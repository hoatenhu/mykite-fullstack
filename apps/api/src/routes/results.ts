import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, and, sql } from 'drizzle-orm'
import { db, schema } from '../db'
import { submitAssessmentSchema } from '@mykite/shared'
import type { Question } from '@mykite/database'
import { calculateHollandScores } from '../services/holland.service'
import { calculateBigFiveScores } from '../services/bigfive.service'

const results = new Hono()

// POST /api/results/submit - Nộp bài và tính điểm
results.post('/submit', zValidator('json', submitAssessmentSchema as any), async (c) => {
  const body = c.req.valid('json' as any) as { sessionId: string; assessmentId: string; responses: Array<{ questionId: string; value: number }> }
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

  // 4. Chuẩn bị data cho scoring
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

  // 5. Tính điểm dựa trên loại assessment
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
    topDimensions = Object.entries(bigfiveResult.levels)
      .filter(([_, level]) => level === 'high')
      .map(([dim]) => dim)
  }

  // 6. Dùng transaction để đảm bảo tính nhất quán (concurrent submissions safe)
  const result = await db.transaction(async (tx) => {
    // Xóa responses cũ (nếu làm lại bài) trước khi insert mới
    await tx
      .delete(schema.responses)
      .where(
        and(
          eq(schema.responses.sessionId, sessionId),
          eq(schema.responses.assessmentId, assessmentId)
        )
      )

    // Insert responses mới
    const responseRecords = responses.map((r) => ({
      sessionId,
      assessmentId,
      questionId: r.questionId,
      value: r.value,
    }))
    await tx.insert(schema.responses).values(responseRecords)

    // Upsert result bên trong transaction:
    // SELECT trước để biết có row cũ không
    const [existing] = await tx
      .select({ id: schema.results.id, isPaid: schema.results.isPaid })
      .from(schema.results)
      .where(and(
        eq(schema.results.sessionId, sessionId),
        eq(schema.results.assessmentId, assessmentId)
      ))
      .limit(1)

    if (existing) {
      // Đã có result → UPDATE điểm mới, BẮT BUỘC THANH TOÁN LẠI (isPaid: false)
      const [updated] = await tx
        .update(schema.results)
        .set({ scores, topDimensions, resultCode, isPaid: false, completedAt: sql`now()` })
        .where(eq(schema.results.id, existing.id))
        .returning()
      return updated!
    } else {
      // Chưa có → INSERT mới với isPaid = false
      const [inserted] = await tx
        .insert(schema.results)
        .values({ sessionId, assessmentId, scores, topDimensions, resultCode, isPaid: false })
        .returning()
      return inserted!
    }
  })

  const isPaid = result.isPaid

  return c.json({
    data: {
      ...result,
      scores: isPaid ? scores : {},
      topDimensions: isPaid ? topDimensions : [],
      resultCode: isPaid ? resultCode : null,
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
      isPaid: schema.results.isPaid,
      completedAt: schema.results.completedAt,
      assessmentType: schema.assessments.type,
      assessmentNameVi: schema.assessments.nameVi,
    })
    .from(schema.results)
    .innerJoin(schema.assessments, eq(schema.results.assessmentId, schema.assessments.id))
    .where(eq(schema.results.sessionId, sessionId))
    .orderBy(schema.results.completedAt)

  const maskedResultList = resultList.map(r => ({
    ...r,
    scores: r.isPaid ? r.scores : {},
    topDimensions: r.isPaid ? r.topDimensions : [],
    resultCode: r.isPaid ? r.resultCode : null,
  }))

  return c.json({ data: maskedResultList })
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
      isPaid: schema.results.isPaid,
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

  const maskedResult = {
    ...result,
    scores: result.isPaid ? result.scores : {},
    topDimensions: result.isPaid ? result.topDimensions : [],
    resultCode: result.isPaid ? result.resultCode : null,
  }

  return c.json({ data: maskedResult })
})

export default results
