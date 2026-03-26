import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { db, schema } from '../db'
import { createSessionSchema } from '@mykite/shared'

const sessions = new Hono()

// POST /api/sessions - Tạo session mới (anonymous)
sessions.post('/', zValidator('json', createSessionSchema), async (c) => {
  const body = c.req.valid('json')

  // Tạo session mới với expiry 30 ngày
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const [session] = await db
    .insert(schema.sessions)
    .values({
      nickname: body.nickname,
      ageGroup: body.ageGroup,
      expiresAt,
    })
    .returning()

  return c.json({ data: session }, 201)
})

// GET /api/sessions/:id - Lấy thông tin session
sessions.get('/:id', async (c) => {
  const id = c.req.param('id')

  const [session] = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.id, id))
    .limit(1)

  if (!session) {
    return c.json({ error: 'Session not found' }, 404)
  }

  // Kiểm tra expiry
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    return c.json({ error: 'Session expired' }, 410)
  }

  return c.json({ data: session })
})

export default sessions
