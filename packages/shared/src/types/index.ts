// ============ ASSESSMENT TYPES ============

export type AssessmentType = 'holland' | 'bigfive'

// Holland RIASEC
export type HollandDimension = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
export const HOLLAND_DIMENSIONS: HollandDimension[] = ['R', 'I', 'A', 'S', 'E', 'C']

export const HOLLAND_LABELS: Record<HollandDimension, { vi: string; en: string }> = {
  R: { vi: 'Thực tế', en: 'Realistic' },
  I: { vi: 'Nghiên cứu', en: 'Investigative' },
  A: { vi: 'Nghệ thuật', en: 'Artistic' },
  S: { vi: 'Xã hội', en: 'Social' },
  E: { vi: 'Doanh nghiệp', en: 'Enterprising' },
  C: { vi: 'Quy củ', en: 'Conventional' },
}

export const HOLLAND_DESCRIPTIONS: Record<HollandDimension, { vi: string; en: string }> = {
  R: {
    vi: 'Thích làm việc với đồ vật, máy móc, công cụ, động thực vật. Ưa thích các hoạt động ngoài trời.',
    en: 'Prefers working with objects, machines, tools, plants or animals. Enjoys outdoor activities.',
  },
  I: {
    vi: 'Thích quan sát, học hỏi, nghiên cứu, phân tích và giải quyết vấn đề.',
    en: 'Prefers observing, learning, investigating, analyzing and solving problems.',
  },
  A: {
    vi: 'Thích các hoạt động sáng tạo, tự do, không theo quy tắc cứng nhắc.',
    en: 'Prefers creative activities that are original and independent.',
  },
  S: {
    vi: 'Thích làm việc với người khác, giúp đỡ, hướng dẫn, chữa bệnh hoặc phục vụ.',
    en: 'Prefers helping, teaching, counseling or serving others.',
  },
  E: {
    vi: 'Thích lãnh đạo, thuyết phục người khác, kinh doanh để đạt mục tiêu.',
    en: 'Prefers leading, persuading others and achieving organizational goals.',
  },
  C: {
    vi: 'Thích làm việc với dữ liệu, số liệu, hồ sơ theo quy trình rõ ràng.',
    en: 'Prefers working with data, details, and following set procedures.',
  },
}

// Big Five OCEAN
export type BigFiveDimension = 'O' | 'C' | 'E' | 'A' | 'N'
export const BIGFIVE_DIMENSIONS: BigFiveDimension[] = ['O', 'C', 'E', 'A', 'N']

export const BIGFIVE_LABELS: Record<BigFiveDimension, { vi: string; en: string }> = {
  O: { vi: 'Cởi mở', en: 'Openness' },
  C: { vi: 'Tận tâm', en: 'Conscientiousness' },
  E: { vi: 'Hướng ngoại', en: 'Extraversion' },
  A: { vi: 'Dễ chịu', en: 'Agreeableness' },
  N: { vi: 'Bất ổn cảm xúc', en: 'Neuroticism' },
}

export const BIGFIVE_DESCRIPTIONS: Record<BigFiveDimension, { vi: string; en: string }> = {
  O: {
    vi: 'Mức độ tò mò, sáng tạo, thích trải nghiệm mới và ý tưởng độc đáo.',
    en: 'Degree of curiosity, creativity, and preference for novelty and variety.',
  },
  C: {
    vi: 'Mức độ tổ chức, kỷ luật, có trách nhiệm và hướng đến mục tiêu.',
    en: 'Degree of organization, dependability, self-discipline and goal-orientation.',
  },
  E: {
    vi: 'Mức độ năng động, hay nói, quyết đoán và thích giao tiếp xã hội.',
    en: 'Degree of energy, talkativeness, assertiveness and social engagement.',
  },
  A: {
    vi: 'Mức độ thân thiện, hợp tác, đồng cảm và tin tưởng người khác.',
    en: 'Degree of friendliness, cooperation, empathy and trust toward others.',
  },
  N: {
    vi: 'Mức độ dễ bị căng thẳng, lo âu, buồn bã hoặc bất ổn cảm xúc.',
    en: 'Degree of emotional instability, anxiety, moodiness and irritability.',
  },
}

// ============ RESPONSE TYPES ============

export type ResponseType = 'likert5' | 'likert7'

export const LIKERT5_OPTIONS = [
  { value: 1, vi: 'Hoàn toàn không đồng ý', en: 'Strongly Disagree' },
  { value: 2, vi: 'Không đồng ý', en: 'Disagree' },
  { value: 3, vi: 'Trung lập', en: 'Neutral' },
  { value: 4, vi: 'Đồng ý', en: 'Agree' },
  { value: 5, vi: 'Hoàn toàn đồng ý', en: 'Strongly Agree' },
] as const

export const LIKERT7_OPTIONS = [
  { value: 1, vi: 'Hoàn toàn không đồng ý', en: 'Strongly Disagree' },
  { value: 2, vi: 'Không đồng ý', en: 'Disagree' },
  { value: 3, vi: 'Hơi không đồng ý', en: 'Somewhat Disagree' },
  { value: 4, vi: 'Trung lập', en: 'Neutral' },
  { value: 5, vi: 'Hơi đồng ý', en: 'Somewhat Agree' },
  { value: 6, vi: 'Đồng ý', en: 'Agree' },
  { value: 7, vi: 'Hoàn toàn đồng ý', en: 'Strongly Agree' },
] as const

// ============ AGE GROUPS ============

export type AgeGroup = 'thpt' | 'university' | 'working'

export const AGE_GROUP_LABELS: Record<AgeGroup, { vi: string; en: string }> = {
  thpt: { vi: 'Học sinh THPT', en: 'High School Student' },
  university: { vi: 'Sinh viên', en: 'University Student' },
  working: { vi: 'Người đi làm', en: 'Working Professional' },
}

// ============ RESULT TYPES ============

export interface HollandResult {
  type: 'holland'
  scores: Record<HollandDimension, number>
  topThree: HollandDimension[]
  code: string // VD: "RIA"
  percentiles: Record<HollandDimension, number>
}

export interface BigFiveResult {
  type: 'bigfive'
  scores: Record<BigFiveDimension, number>
  levels: Record<BigFiveDimension, 'low' | 'medium' | 'high'>
  percentiles: Record<BigFiveDimension, number>
}

export type AssessmentResult = HollandResult | BigFiveResult

// ============ CAREER MATCHING ============

export interface CareerMatch {
  id: string
  nameVi: string
  nameEn?: string
  matchScore: number // 0-100
  matchedDimensions: string[]
  futureOutlook: 'high' | 'medium' | 'low' | 'declining'
}
