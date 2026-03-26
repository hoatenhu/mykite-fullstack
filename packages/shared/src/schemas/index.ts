import { z } from 'zod'

// ============ BASE SCHEMAS ============

export const uuidSchema = z.string().uuid()

export const assessmentTypeSchema = z.enum(['holland', 'bigfive'])

export const responseTypeSchema = z.enum(['likert5', 'likert7'])

export const hollandDimensionSchema = z.enum(['R', 'I', 'A', 'S', 'E', 'C'])

export const bigfiveDimensionSchema = z.enum(['O', 'C', 'E', 'A', 'N'])

export const ageGroupSchema = z.enum(['thpt', 'university', 'working'])

// ============ API REQUEST SCHEMAS ============

// Create session
export const createSessionSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  ageGroup: ageGroupSchema.optional(),
})

// Submit response (single question)
export const submitResponseSchema = z.object({
  questionId: uuidSchema,
  value: z.number().int().min(1).max(7),
})

// Submit all responses for an assessment
export const submitAssessmentSchema = z.object({
  sessionId: uuidSchema,
  assessmentId: uuidSchema,
  responses: z.array(submitResponseSchema).min(1),
})

// ============ API RESPONSE SCHEMAS ============

// Assessment list item
export const assessmentItemSchema = z.object({
  id: uuidSchema,
  type: assessmentTypeSchema,
  nameVi: z.string(),
  nameEn: z.string(),
  descriptionVi: z.string().nullable(),
  descriptionEn: z.string().nullable(),
  estimatedMinutes: z.number().nullable(),
  questionCount: z.number(),
})

// Question for quiz
export const questionSchema = z.object({
  id: uuidSchema,
  orderIndex: z.number(),
  textVi: z.string(),
  textEn: z.string().nullable(),
  responseType: responseTypeSchema,
})

// Session response
export const sessionSchema = z.object({
  id: uuidSchema,
  nickname: z.string().nullable(),
  ageGroup: ageGroupSchema.nullable(),
  createdAt: z.string(),
})

// Holland scores
export const hollandScoresSchema = z.object({
  R: z.number(),
  I: z.number(),
  A: z.number(),
  S: z.number(),
  E: z.number(),
  C: z.number(),
})

// Big Five scores
export const bigfiveScoresSchema = z.object({
  O: z.number(),
  C: z.number(),
  E: z.number(),
  A: z.number(),
  N: z.number(),
})

// Result response
export const resultSchema = z.object({
  id: uuidSchema,
  sessionId: uuidSchema,
  assessmentId: uuidSchema,
  assessmentType: assessmentTypeSchema,
  scores: z.union([hollandScoresSchema, bigfiveScoresSchema]),
  topDimensions: z.array(z.string()).nullable(),
  resultCode: z.string().nullable(),
  completedAt: z.string(),
})

// Career suggestion
export const careerSuggestionSchema = z.object({
  id: uuidSchema,
  nameVi: z.string(),
  nameEn: z.string().nullable(),
  descriptionVi: z.string().nullable(),
  matchScore: z.number().min(0).max(100),
  hollandCodes: z.array(z.string()).nullable(),
  futureOutlook: z.string().nullable(),
})

// ============ QUESTION JSON SCHEMA (for data import) ============

export const questionJsonSchema = z.object({
  id: z.string(),
  assessmentType: assessmentTypeSchema,
  dimension: z.string(), // R/I/A/S/E/C or O/C/E/A/N
  textVi: z.string(),
  textEn: z.string().optional(),
  responseType: responseTypeSchema.default('likert5'),
  weight: z.number().default(1),
  isReversed: z.boolean().default(false),
})

export const questionsJsonSchema = z.array(questionJsonSchema)

// ============ TYPE EXPORTS ============

export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>
export type SubmitAssessmentInput = z.infer<typeof submitAssessmentSchema>
export type AssessmentItem = z.infer<typeof assessmentItemSchema>
export type QuestionItem = z.infer<typeof questionSchema>
export type SessionResponse = z.infer<typeof sessionSchema>
export type ResultResponse = z.infer<typeof resultSchema>
export type CareerSuggestion = z.infer<typeof careerSuggestionSchema>
export type QuestionJson = z.infer<typeof questionJsonSchema>
