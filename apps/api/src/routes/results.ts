import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, and } from 'drizzle-orm'
import { db, schema } from '../db'
import { submitAssessmentSchema } from '@mykite/shared'
import type { Question } from '@mykite/database'
import { calculateHollandScores } from '../services/holland.service'
import { calculateBigFiveScores } from '../services/bigfive.service'

const results = new Hono()

// POST /api/results/submit - Nộp bài và tính điểm
results.post('/submit', zValidator('json', submitAssessmentSchema), async (c) => {
  const body = c.req.valid('json')
  const { sessionId, assessmentId, responses } = body

  // 1. Kiểm tra session
  const [session] = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.id, sessionId))
    .limit(1)

  if (!session) {
    return c.json({ error: 'Session not found' }, 404)
  }

  // 2. Lấy thông tin assessment
  const [assessment] = await db
    .select()
    .from(schema.assessments)
    .where(eq(schema.assessments.id, assessmentId))
    .limit(1)

  if (!assessment) {
    return c.json({ error: 'Assessment not found' }, 404)
  }

  // 3. Lấy tất cả câu hỏi với metadata
  const questions = (await db
    .select()
    .from(schema.questions)
    .where(eq(schema.questions.assessmentId, assessmentId))) as Question[]

  const questionMap = new Map(questions.map((q: Question) => [q.id, q]))

  // 4. Lưu responses
  const responseRecords = responses.map((r) => ({
    sessionId,
    assessmentId,
    questionId: r.questionId,
    value: r.value,
  }))

  await db.insert(schema.responses).values(responseRecords)

  // 5. Chuẩn bị data cho scoring
  const scoringData = responses.map((r) => {
    const question = questionMap.get(r.questionId)
    if (!question) throw new Error(`Question ${r.questionId} not found`)

    return {
      dimension: question.dimension,
      value: r.value,
      weight: question.weight ?? 1,
      isReversed: question.isReversed ?? false,
      maxValue: question.responseType === 'likert7' ? 7 : 5,
    }
  })

  // 6. Tính điểm dựa trên loại assessment
  let scores: Record<string, number>
  let topDimensions: string[] | null = null
  let resultCode: string | null = null

  if (assessment.type === 'holland') {
    const hollandResult = calculateHollandScores(scoringData)
    scores = hollandResult.scores
    topDimensions = hollandResult.topThree
    resultCode = hollandResult.code
  } else {
    const bigfiveResult = calculateBigFiveScores(scoringData)
    scores = bigfiveResult.scores
    // Big Five không có "code" như Holland
    topDimensions = Object.entries(bigfiveResult.levels)
      .filter(([_, level]) => level === 'high')
      .map(([dim]) => dim)
  }

  // 7. Lưu kết quả
  const [result] = await db
    .insert(schema.results)
    .values({
      sessionId,
      assessmentId,
      scores,
      topDimensions,
      resultCode,
    })
    .returning()

  return c.json({
    data: {
      ...result,
      assessmentType: assessment.type,
    },
  }, 201)
})

// GET /api/results/:sessionId - Lấy tất cả kết quả của session
results.get('/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId')

  const resultList = await db
    .select({
      id: schema.results.id,
      sessionId: schema.results.sessionId,
      assessmentId: schema.results.assessmentId,
      scores: schema.results.scores,
      topDimensions: schema.results.topDimensions,
      resultCode: schema.results.resultCode,
      completedAt: schema.results.completedAt,
      assessmentType: schema.assessments.type,
      assessmentNameVi: schema.assessments.nameVi,
    })
    .from(schema.results)
    .innerJoin(schema.assessments, eq(schema.results.assessmentId, schema.assessments.id))
    .where(eq(schema.results.sessionId, sessionId))
    .orderBy(schema.results.completedAt)

  return c.json({ data: resultList })
})

// GET /api/results/:sessionId/:assessmentId - Lấy kết quả cụ thể
results.get('/:sessionId/:assessmentId', async (c) => {
  const { sessionId, assessmentId } = c.req.param()

  const [result] = await db
    .select({
      id: schema.results.id,
      sessionId: schema.results.sessionId,
      assessmentId: schema.results.assessmentId,
      scores: schema.results.scores,
      topDimensions: schema.results.topDimensions,
      resultCode: schema.results.resultCode,
      completedAt: schema.results.completedAt,
      assessmentType: schema.assessments.type,
      assessmentNameVi: schema.assessments.nameVi,
    })
    .from(schema.results)
    .innerJoin(schema.assessments, eq(schema.results.assessmentId, schema.assessments.id))
    .where(
      and(
        eq(schema.results.sessionId, sessionId),
        eq(schema.results.assessmentId, assessmentId)
      )
    )
    .limit(1)

  if (!result) {
    return c.json({ error: 'Result not found' }, 404)
  }

  return c.json({ data: result })
})

export default results
