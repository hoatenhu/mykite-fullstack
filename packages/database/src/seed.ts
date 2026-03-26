import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import hollandData from '../../../data/questions/holland.json'
import bigfiveData from '../../../data/questions/bigfive.json'
import careersData from '../../../data/careers.json'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

const client = postgres(connectionString)
const db = drizzle(client, { schema })

async function seed() {
  console.log('🌱 Starting database seed...')

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await db.delete(schema.results)
    await db.delete(schema.responses)
    await db.delete(schema.questions)
    await db.delete(schema.assessments)
    await db.delete(schema.careers)
    await db.delete(schema.sessions)

    // Seed assessments
    console.log('📝 Seeding assessments...')
    const [hollandAssessment] = await db
      .insert(schema.assessments)
      .values({
        type: 'holland',
        nameVi: 'Trắc nghiệm Holland RIASEC',
        nameEn: 'Holland RIASEC Assessment',
        descriptionVi: 'Khám phá 6 nhóm sở thích nghề nghiệp và môi trường làm việc phù hợp với bạn',
        descriptionEn: 'Discover your 6 career interest types and suitable work environments',
        estimatedMinutes: 10,
        isActive: true,
      })
      .returning()

    const [bigfiveAssessment] = await db
      .insert(schema.assessments)
      .values({
        type: 'bigfive',
        nameVi: 'Trắc nghiệm Big Five OCEAN',
        nameEn: 'Big Five OCEAN Assessment',
        descriptionVi: 'Phân tích 5 khía cạnh tính cách để hiểu rõ bản thân và dự báo hành vi nghề nghiệp',
        descriptionEn: 'Analyze 5 personality dimensions to understand yourself and predict career behavior',
        estimatedMinutes: 15,
        isActive: true,
      })
      .returning()

    console.log(`✅ Created assessments: Holland (${hollandAssessment.id}), Big Five (${bigfiveAssessment.id})`)

    // Seed Holland questions
    console.log('📝 Seeding Holland questions...')
    const hollandQuestions = hollandData.questions.map((q, index) => ({
      assessmentId: hollandAssessment.id,
      orderIndex: index + 1,
      textVi: q.textVi,
      textEn: q.textEn,
      responseType: q.responseType as 'likert5' | 'likert7',
      dimension: q.dimension,
      weight: q.weight,
      isReversed: q.isReversed,
    }))

    await db.insert(schema.questions).values(hollandQuestions)
    console.log(`✅ Created ${hollandQuestions.length} Holland questions`)

    // Seed Big Five questions
    console.log('📝 Seeding Big Five questions...')
    const bigfiveQuestions = bigfiveData.questions.map((q, index) => ({
      assessmentId: bigfiveAssessment.id,
      orderIndex: index + 1,
      textVi: q.textVi,
      textEn: q.textEn,
      responseType: q.responseType as 'likert5' | 'likert7',
      dimension: q.dimension,
      weight: q.weight,
      isReversed: q.isReversed,
    }))

    await db.insert(schema.questions).values(bigfiveQuestions)
    console.log(`✅ Created ${bigfiveQuestions.length} Big Five questions`)

    // Seed careers
    console.log('📝 Seeding careers...')
    const careers = careersData.careers.map((c) => ({
      nameVi: c.nameVi,
      nameEn: c.nameEn,
      descriptionVi: c.descriptionVi,
      hollandCodes: c.hollandCodes,
      bigfiveProfile: c.bigfiveProfile,
      futureOutlook: c.futureOutlook,
      tags: c.tags,
    }))

    await db.insert(schema.careers).values(careers)
    console.log(`✅ Created ${careers.length} careers`)

    console.log('✅ Database seed completed successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

seed()
