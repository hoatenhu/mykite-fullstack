import type { BigFiveDimension, BigFiveResult } from '@mykite/shared'
import { BIGFIVE_DIMENSIONS } from '@mykite/shared'

interface QuestionResponse {
  dimension: string
  value: number
  weight: number
  isReversed: boolean
  maxValue: number // 5 for likert5, 7 for likert7
}

/**
 * Tính điểm Big Five OCEAN từ các câu trả lời
 * Áp dụng reverse scoring và weight
 */
export function calculateBigFiveScores(responses: QuestionResponse[]): BigFiveResult {
  // Khởi tạo điểm thô và số câu cho mỗi dimension
  const rawScores: Record<BigFiveDimension, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 }
  const questionCounts: Record<BigFiveDimension, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 }
  const maxPossible: Record<BigFiveDimension, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 }

  for (const response of responses) {
    const dim = response.dimension as BigFiveDimension
    if (!BIGFIVE_DIMENSIONS.includes(dim)) continue

    // Reverse scoring nếu cần
    const adjustedValue = response.isReversed
      ? response.maxValue + 1 - response.value
      : response.value

    rawScores[dim] += adjustedValue * response.weight
    questionCounts[dim] += response.weight
    maxPossible[dim] += response.maxValue * response.weight
  }

  // Chuyển đổi sang thang điểm 0-100
  const scores: Record<BigFiveDimension, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 }
  
  for (const dim of BIGFIVE_DIMENSIONS) {
    if (maxPossible[dim] > 0) {
      const minPossible = questionCounts[dim]
      scores[dim] = Math.round(
        ((rawScores[dim] - minPossible) / (maxPossible[dim] - minPossible)) * 100
      )
    }
  }

  // Xác định mức độ: low (<34), medium (34-66), high (>66)
  const levels: Record<BigFiveDimension, 'low' | 'medium' | 'high'> = {
    O: 'medium',
    C: 'medium',
    E: 'medium',
    A: 'medium',
    N: 'medium',
  }

  for (const dim of BIGFIVE_DIMENSIONS) {
    if (scores[dim] < 34) {
      levels[dim] = 'low'
    } else if (scores[dim] > 66) {
      levels[dim] = 'high'
    } else {
      levels[dim] = 'medium'
    }
  }

  // Percentiles (simplified)
  const percentiles = { ...scores }

  return {
    type: 'bigfive',
    scores,
    levels,
    percentiles,
  }
}

/**
 * Phân tích profile Big Five cho nghề nghiệp
 */
export function analyzeBigFiveForCareer(
  result: BigFiveResult
): { strengths: string[]; considerations: string[] } {
  const strengths: string[] = []
  const considerations: string[] = []

  const { levels } = result

  // Openness
  if (levels.O === 'high') {
    strengths.push('Sáng tạo, cởi mở với ý tưởng mới')
  } else if (levels.O === 'low') {
    strengths.push('Thực tế, tập trung vào những gì đã được chứng minh')
  }

  // Conscientiousness
  if (levels.C === 'high') {
    strengths.push('Có kỷ luật, đáng tin cậy, hướng đến mục tiêu')
  } else if (levels.C === 'low') {
    considerations.push('Cần phát triển kỹ năng quản lý thời gian và tổ chức')
  }

  // Extraversion
  if (levels.E === 'high') {
    strengths.push('Năng động, giao tiếp tốt, thích làm việc nhóm')
  } else if (levels.E === 'low') {
    strengths.push('Tập trung sâu, làm việc độc lập hiệu quả')
  }

  // Agreeableness
  if (levels.A === 'high') {
    strengths.push('Hợp tác, đồng cảm, làm việc nhóm tốt')
  } else if (levels.A === 'low') {
    strengths.push('Quyết đoán, độc lập trong suy nghĩ')
  }

  // Neuroticism
  if (levels.N === 'high') {
    considerations.push('Cần học kỹ năng quản lý stress và cảm xúc')
  } else if (levels.N === 'low') {
    strengths.push('Bình tĩnh, ổn định cảm xúc, xử lý áp lực tốt')
  }

  return { strengths, considerations }
}
