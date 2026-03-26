import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core'

// Enums
export const assessmentTypeEnum = pgEnum('assessment_type', ['holland', 'bigfive'])
export const responseTypeEnum = pgEnum('response_type', ['likert5', 'likert7'])

// Holland dimensions: Realistic, Investigative, Artistic, Social, Enterprising, Conventional
export const hollandDimensionEnum = pgEnum('holland_dimension', ['R', 'I', 'A', 'S', 'E', 'C'])

// Big Five dimensions: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
export const bigfiveDimensionEnum = pgEnum('bigfive_dimension', ['O', 'C', 'E', 'A', 'N'])

// ============ TABLES ============

// Assessments - Định nghĩa các bài trắc nghiệm
export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: assessmentTypeEnum('type').notNull(),
  nameVi: text('name_vi').notNull(),
  nameEn: text('name_en').notNull(),
  descriptionVi: text('description_vi'),
  descriptionEn: text('description_en'),
  estimatedMinutes: integer('estimated_minutes').default(15),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Questions - Câu hỏi trắc nghiệm
export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id')
    .references(() => assessments.id, { onDelete: 'cascade' })
    .notNull(),
  orderIndex: integer('order_index').notNull(),
  textVi: text('text_vi').notNull(),
  textEn: text('text_en'),
  responseType: responseTypeEnum('response_type').default('likert5').notNull(),
  // Dimension - sẽ là R/I/A/S/E/C cho Holland hoặc O/C/E/A/N cho Big Five
  dimension: text('dimension').notNull(),
  weight: integer('weight').default(1),
  isReversed: boolean('is_reversed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Sessions - Phiên làm bài (anonymous)
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Metadata tùy chọn
  nickname: text('nickname'),
  ageGroup: text('age_group'), // 'thpt', 'university', 'working'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
})

// Responses - Câu trả lời của user
export const responses = pgTable('responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  questionId: uuid('question_id')
    .references(() => questions.id, { onDelete: 'cascade' })
    .notNull(),
  assessmentId: uuid('assessment_id')
    .references(() => assessments.id, { onDelete: 'cascade' })
    .notNull(),
  // Giá trị 1-5 (Likert 5) hoặc 1-7 (Likert 7)
  value: integer('value').notNull(),
  answeredAt: timestamp('answered_at').defaultNow().notNull(),
})

// Results - Kết quả phân tích
export const results = pgTable('results', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  assessmentId: uuid('assessment_id')
    .references(() => assessments.id, { onDelete: 'cascade' })
    .notNull(),
  // Điểm số theo từng dimension: { "R": 45, "I": 78, ... }
  scores: jsonb('scores').notNull().$type<Record<string, number>>(),
  // Top dimensions (VD: ["R", "I", "A"] cho Holland)
  topDimensions: jsonb('top_dimensions').$type<string[]>(),
  // Mã kết quả (VD: "RIA" cho Holland)
  resultCode: text('result_code'),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
})

// Careers - Database nghề nghiệp (đơn giản cho MVP)
export const careers = pgTable('careers', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameVi: text('name_vi').notNull(),
  nameEn: text('name_en'),
  descriptionVi: text('description_vi'),
  // Holland codes phù hợp (VD: ["RIC", "IRC"])
  hollandCodes: jsonb('holland_codes').$type<string[]>(),
  // Big Five profile lý tưởng (VD: { "O": "high", "C": "high", ... })
  bigfiveProfile: jsonb('bigfive_profile').$type<Record<string, string>>(),
  // Xu hướng tương lai: 'high', 'medium', 'low', 'declining'
  futureOutlook: text('future_outlook').default('medium'),
  // Tags cho filtering
  tags: jsonb('tags').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Types export
export type Assessment = typeof assessments.$inferSelect
export type NewAssessment = typeof assessments.$inferInsert
export type Question = typeof questions.$inferSelect
export type NewQuestion = typeof questions.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type Response = typeof responses.$inferSelect
export type NewResponse = typeof responses.$inferInsert
export type Result = typeof results.$inferSelect
export type NewResult = typeof results.$inferInsert
export type Career = typeof careers.$inferSelect
export type NewCareer = typeof careers.$inferInsert
