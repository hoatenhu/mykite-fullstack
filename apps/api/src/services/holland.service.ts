import type { HollandDimension, HollandResult } from '@mykite/shared'
import { HOLLAND_DIMENSIONS } from '@mykite/shared'

interface QuestionResponse {
  dimension: string
  value: number
  weight: number
  isReversed: boolean
  maxValue: number // 5 for likert5, 7 for likert7
}

/**
 * Tính điểm Holland RIASEC từ các câu trả lời
 * Áp dụng reverse scoring và weight
 */
export function calculateHollandScores(responses: QuestionResponse[]): HollandResult {
  // Khởi tạo điểm thô và số câu cho mỗi dimension
  const rawScores: Record<HollandDimension, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  const questionCounts: Record<HollandDimension, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  const maxPossible: Record<HollandDimension, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }

  for (const response of responses) {
    const dim = response.dimension as HollandDimension
    if (!HOLLAND_DIMENSIONS.includes(dim)) continue

    // Reverse scoring nếu cần: score = maxValue + 1 - value
    const adjustedValue = response.isReversed
      ? response.maxValue + 1 - response.value
      : response.value

    // Áp dụng weight
    rawScores[dim] += adjustedValue * response.weight
    questionCounts[dim] += response.weight
    maxPossible[dim] += response.maxValue * response.weight
  }

  // Chuyển đổi sang thang điểm 0-100
  const scores: Record<HollandDimension, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  
  for (const dim of HOLLAND_DIMENSIONS) {
    if (maxPossible[dim] > 0) {
      // Normalize: (raw - min) / (max - min) * 100
      const minPossible = questionCounts[dim] // minimum score = 1 per question * weight
      scores[dim] = Math.round(
        ((rawScores[dim] - minPossible) / (maxPossible[dim] - minPossible)) * 100
      )
    }
  }

  // Xác định top 3 dimensions
  const sorted = HOLLAND_DIMENSIONS.slice().sort((a, b) => scores[b] - scores[a])
  const topThree = sorted.slice(0, 3)
  const code = topThree.join('')

  // Percentiles (simplified - so sánh với chính mình)
  const percentiles = { ...scores }

  return {
    type: 'holland',
    scores,
    topThree,
    code,
    percentiles,
  }
}

/**
 * Gợi ý môi trường làm việc dựa trên Holland code
 */
export function getHollandWorkEnvironments(code: string): string[] {
  const environments: Record<HollandDimension, string[]> = {
    R: ['Nhà xưởng', 'Công trường', 'Phòng thí nghiệm kỹ thuật', 'Ngoài trời'],
    I: ['Phòng nghiên cứu', 'Thư viện', 'Phòng thí nghiệm', 'Trung tâm dữ liệu'],
    A: ['Studio', 'Xưởng sáng tạo', 'Sân khấu', 'Phòng thiết kế'],
    S: ['Trường học', 'Bệnh viện', 'Tổ chức xã hội', 'Trung tâm tư vấn'],
    E: ['Văn phòng công ty', 'Phòng họp', 'Sàn giao dịch', 'Sự kiện'],
    C: ['Văn phòng hành chính', 'Ngân hàng', 'Kế toán', 'Công ty bảo hiểm'],
  }

  const result: string[] = []
  for (const char of code.slice(0, 3)) {
    const dim = char as HollandDimension
    if (environments[dim]) {
      result.push(...environments[dim].slice(0, 2))
    }
  }
  
  return [...new Set(result)]
}
