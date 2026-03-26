import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, sql } from 'drizzle-orm'
import { db, schema } from '../db'
import { assessmentItemSchema } from '@mykite/shared'

const assessments = new Hono()

// GET /api/assessments - Lấy danh sách bài trắc nghiệm
assessments.get('/', async (c) => {
  const result = await db
    .select({
      id: schema.assessments.id,
      type: schema.assessments.type,
      nameVi: schema.assessments.nameVi,
      nameEn: schema.assessments.nameEn,
      descriptionVi: schema.assessments.descriptionVi,
      descriptionEn: schema.assessments.descriptionEn,
      estimatedMinutes: schema.assessments.estimatedMinutes,
      questionCount: sql<number>`CAST(count(${schema.questions.id}) AS INTEGER)`.as('question_count'),
    })
    .from(schema.assessments)
    .leftJoin(schema.questions, eq(schema.questions.assessmentId, schema.assessments.id))
    .where(eq(schema.assessments.isActive, true))
    .groupBy(
      schema.assessments.id,
      schema.assessments.type,
      schema.assessments.nameVi,
      schema.assessments.nameEn,
      schema.assessments.descriptionVi,
      schema.assessments.descriptionEn,
      schema.assessments.estimatedMinutes
    )

  return c.json({ data: result })
})

// GET /api/assessments/:id - Lấy thông tin chi tiết bài trắc nghiệm
assessments.get('/:id', async (c) => {
  const id = c.req.param('id')
  
  const [assessment] = await db
    .select()
    .from(schema.assessments)
    .where(eq(schema.assessments.id, id))
    .limit(1)

  if (!assessment) {
    return c.json({ error: 'Assessment not found' }, 404)
  }

  const questionCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.questions)
    .where(eq(schema.questions.assessmentId, id))

  return c.json({
    data: {
      ...assessment,
      questionCount: questionCount[0]?.count ?? 0,
    },
  })
})

// GET /api/assessments/:id/questions - Lấy câu hỏi của bài trắc nghiệm
assessments.get('/:id/questions', async (c) => {
  const id = c.req.param('id')

  // Kiểm tra assessment tồn tại
  const [assessment] = await db
    .select()
    .from(schema.assessments)
    .where(eq(schema.assessments.id, id))
    .limit(1)

  if (!assessment) {
    return c.json({ error: 'Assessment not found' }, 404)
  }

  // Lấy câu hỏi (không trả về dimension để tránh gaming)
  const questions = await db
    .select({
      id: schema.questions.id,
      orderIndex: schema.questions.orderIndex,
      textVi: schema.questions.textVi,
      textEn: schema.questions.textEn,
      responseType: schema.questions.responseType,
    })
    .from(schema.questions)
    .where(eq(schema.questions.assessmentId, id))
    .orderBy(schema.questions.orderIndex)

  return c.json({
    data: {
      assessment: {
        id: assessment.id,
        type: assessment.type,
        nameVi: assessment.nameVi,
        nameEn: assessment.nameEn,
      },
      questions,
    },
  })
})

export default assessments
