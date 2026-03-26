import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db, schema } from '../db'
import type { Career } from '@mykite/database'

const careers = new Hono()

function calculateHollandMatchScore(userCode: string, careerCode: string): number {
  const normalizedUser = userCode.slice(0, 3).toUpperCase()
  const normalizedCareer = careerCode.slice(0, 3).toUpperCase()
  const positionWeights = [50, 30, 20]

  let score = 0
  for (let i = 0; i < 3; i++) {
    const userChar = normalizedUser[i]
    const careerChar = normalizedCareer[i]
    const weight = positionWeights[i] ?? 0
    if (!userChar || !careerChar) continue

    if (userChar === careerChar) {
      score += weight
      continue
    }

    if (normalizedCareer.includes(userChar)) {
      // Có cùng ký tự nhưng sai vị trí -> partial match
      score += Math.round(weight * 0.4)
    }
  }

  return Math.min(100, score)
}

// GET /api/careers - Lấy danh sách nghề nghiệp
careers.get('/', async (c) => {
  const hollandCode = c.req.query('hollandCode')
  const limit = parseInt(c.req.query('limit') ?? '20')

  const careerList = await db.select().from(schema.careers).limit(limit)

  // Nếu có Holland code, tính match score
  if (hollandCode && hollandCode.length >= 2) {
    const scoredCareers = careerList.map((career: Career) => {
      const codes = (career.hollandCodes as string[] | null) ?? []

      const matchScore =
        codes.length > 0
          ? Math.max(...codes.map((code) => calculateHollandMatchScore(hollandCode, code)))
          : 0

      return { ...career, matchScore }
    })

    // Sort by match score
    scoredCareers.sort((a: { matchScore: number }, b: { matchScore: number }) => b.matchScore - a.matchScore)

    return c.json({ data: scoredCareers })
  }

  return c.json({ data: careerList.map((career: Career) => ({ ...career, matchScore: 0 })) })
})

// GET /api/careers/:id - Chi tiết nghề nghiệp
careers.get('/:id', async (c) => {
  const id = c.req.param('id')

  const [career] = await db
    .select()
    .from(schema.careers)
    .where(eq(schema.careers.id, id))
    .limit(1)

  if (!career) {
    return c.json({ error: 'Career not found' }, 404)
  }

  return c.json({ data: career })
})

export default careers
