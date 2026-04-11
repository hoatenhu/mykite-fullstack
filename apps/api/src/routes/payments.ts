import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import * as crypto from 'crypto'
import { db, schema } from '../db'
import type { Assessment, Result, Transaction } from '@mykite/database'

const payments = new Hono()

const SEPAY_FORM_INIT_URL = process.env.SEPAY_FORM_INIT_URL || 'https://pay.sepay.vn/v1/checkout/init'
const SEPAY_API_KEY = process.env.SEPAY_API_KEY || ''
const SEPAY_API_SECRET = process.env.SEPAY_API_SECRET || ''

function buildSepaySignature(payload: Record<string, string>, signedFields: string[]): string {
  const signedPairs = signedFields.map((field) => `${field}=${payload[field] || ''}`)
  const signedString = signedPairs.join(',')
  const hmac = crypto.createHmac('sha256', SEPAY_API_SECRET)
  hmac.update(signedString, 'utf-8')
  return hmac.digest('base64')
}

const checkoutSchema = z.object({
  sessionId: z.string().uuid(),
  assessmentId: z.string().uuid(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

// POST /api/payments/checkout
payments.post('/checkout', zValidator('json', checkoutSchema as any), async (c) => {
  const body = c.req.valid('json')
  const { sessionId, assessmentId, successUrl, cancelUrl } = body

  // 1. Get Assessment to determine price
  const [assessment] = await db
    .select()
    .from(schema.assessments)
    .where(eq(schema.assessments.id, assessmentId))
    .limit(1)

  if (!assessment) {
    return c.json({ error: 'Assessment not found' }, 404)
  }

  // Determine amount
  const amountVnd = assessment.type === 'holland' ? 10000 : 20000

  // 2. Check if already paid
  const [result] = await db
    .select()
    .from(schema.results)
    .where(and(eq(schema.results.sessionId, sessionId), eq(schema.results.assessmentId, assessmentId)))
    .limit(1)

  if (result && result.isPaid) {
    return c.json({ error: 'Already paid' }, 400)
  }

  // 3. Create Transaction record
  const transactionCode = `MYKITE-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  
  const [transaction] = await db
    .insert(schema.transactions)
    .values({
      sessionId,
      assessmentId,
      transactionCode,
      amountVnd,
      status: 'pending',
    })
    .returning()

  if (!transaction) {
    return c.json({ error: 'Failed to create transaction' }, 500)
  }

  // 4. Build SePay Checkout form payload
  const defaultUrl = process.env.FRONTEND_URL || 'https://app.mykite.vn'
  const finalSuccessUrl = successUrl || `${defaultUrl}/results/${sessionId}/${assessmentId}`
  const finalCancelUrl = cancelUrl || `${defaultUrl}/results/${sessionId}/${assessmentId}`

  const paymentFormPayload: Record<string, string> = {
    merchant: SEPAY_API_KEY,
    currency: 'VND',
    order_amount: amountVnd.toString(),
    operation: 'PURCHASE',
    order_description: `Thanh toan ket qua ${assessment.type.toUpperCase()}`,
    order_invoice_number: transactionCode,
    customer_id: sessionId,
    success_url: finalSuccessUrl,
    error_url: finalCancelUrl,
    cancel_url: finalCancelUrl,
    payment_method: 'BANK_TRANSFER',
  }

  const signedFields = [
    'merchant',
    'currency',
    'order_amount',
    'operation',
    'order_description',
    'order_invoice_number',
    'customer_id',
    'success_url',
    'error_url',
    'cancel_url',
    'payment_method',
  ]
  const signature = buildSepaySignature(paymentFormPayload, signedFields)
  paymentFormPayload['signature'] = signature

  // 5. Construct redirect URL (using SePay form UI logic - usually it returns the form data or we construct passing via URL)
  // SePay form init accepts POST requests with form fields exactly matching payload.
  const checkoutUrl = SEPAY_FORM_INIT_URL

  return c.json({
    data: {
      transactionId: transaction.id,
      transactionCode,
      checkoutUrl,
      formPayload: paymentFormPayload,
    },
  })
})

// GET /api/payments/webhook - SePay ping check
payments.get('/webhook', (c) => {
  return c.json({ status: 'ok', message: 'MyKite payment webhook is ready' })
})

// POST /api/payments/webhook - Nhan IPN tu SePay
payments.post('/webhook', async (c) => {
  try {
    const rawBody = await c.req.text()
    const signature = c.req.header('x-sepay-signature') || ''

    if (signature) {
      const expectedSignature = crypto.createHash('sha256').update(rawBody + SEPAY_API_SECRET).digest('hex')
      if (signature !== expectedSignature) {
        return c.json({ error: 'Invalid webhook signature' }, 401)
      }
    }

    let payload: any = {}
    try {
      payload = JSON.parse(rawBody)
    } catch {
      payload = {}
    }

    const dataPayload = payload.data || {}
    const orderPayload = payload.order || dataPayload.order || {}
    const transactionPayload = payload.transaction || dataPayload.transaction || {}

    const rawContent = (
      payload.content || dataPayload.content || 
      payload.transaction_code || dataPayload.transaction_code || 
      payload.order_invoice_number || dataPayload.order_invoice_number || 
      orderPayload.order_invoice_number || orderPayload.order_code || ''
    ).toString()

    const matchCode = rawContent.match(/MYKITE-\d+-\d+/)
    const transactionCode = matchCode ? matchCode[0] : rawContent

    const statusText = (
      payload.status || dataPayload.status || dataPayload.payment_status || orderPayload.order_status || payload.result || ''
    ).toString().toLowerCase()

    const paymentCode = (
      payload.code || dataPayload.code || dataPayload.status_code || dataPayload.error_code || ''
    ).toString().toLowerCase()
    
    if (!transactionCode) {
      return c.json({ error: 'Missing transaction code' }, 400)
    }

    // Find the transaction
    const [transaction] = await db
      .select()
      .from(schema.transactions)
      .where(eq(schema.transactions.transactionCode, transactionCode))
      .limit(1)

    if (!transaction) {
      return c.json({ error: 'Transaction not found' }, 404)
    }

    if (transaction.status === 'paid') {
      return c.json({ message: 'Already processed' })
    }

    const isPaid = ['paid', 'success', 'completed', 'successfully', 'captured', 'approved'].includes(statusText) || ['success', 'succeeded', '0', '00', 'authentication_successful'].includes(paymentCode)
    
    if (!isPaid) {
      await db
        .update(schema.transactions)
        .set({ status: 'failed' })
        .where(eq(schema.transactions.id, transaction.id))
      return c.json({ message: 'Failed status received' })
    }

    // Mark as paid
    await db
      .update(schema.transactions)
      .set({ 
        status: 'paid',
        paidAt: new Date()
      })
      .where(eq(schema.transactions.id, transaction.id))

    // Mark Result as paid
    await db
      .update(schema.results)
      .set({ isPaid: true })
      .where(
        and(
          eq(schema.results.sessionId, transaction.sessionId),
          eq(schema.results.assessmentId, transaction.assessmentId)
        )
      )

    return c.json({ message: 'Success' })
  } catch (err) {
    console.error('Webhook error:', err)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default payments
