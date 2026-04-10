const API_BASE = '/api'

interface ApiResponse<T> {
  data: T
  error?: string
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error || 'API request failed')
  }

  return json.data
}

// Types
export interface Assessment {
  id: string
  type: 'holland' | 'bigfive'
  nameVi: string
  nameEn: string
  descriptionVi: string | null
  descriptionEn: string | null
  estimatedMinutes: number | null
  questionCount: number
}

export interface Question {
  id: string
  orderIndex: number
  textVi: string
  textEn: string | null
  responseType: 'likert5' | 'likert7'
}

export interface AssessmentWithQuestions {
  assessment: {
    id: string
    type: 'holland' | 'bigfive'
    nameVi: string
    nameEn: string
  }
  questions: Question[]
}

export interface Session {
  id: string
  nickname: string | null
  ageGroup: string | null
  createdAt: string
}

export interface Result {
  id: string
  sessionId: string
  assessmentId: string
  assessmentType: 'holland' | 'bigfive'
  assessmentNameVi?: string
  scores: Record<string, number>
  topDimensions: string[] | null
  resultCode: string | null
  isPaid: boolean
  completedAt: string
}

export interface Career {
  id: string
  nameVi: string
  nameEn: string | null
  descriptionVi: string | null
  hollandCodes: string[] | null
  futureOutlook: string | null
  matchScore: number
}

// API functions
export const api = {
  // Assessments
  getAssessments: () => fetchApi<Assessment[]>('/assessments'),
  
  getAssessment: (id: string) => fetchApi<Assessment>(`/assessments/${id}`),
  
  getAssessmentQuestions: (id: string) =>
    fetchApi<AssessmentWithQuestions>(`/assessments/${id}/questions`),

  // Sessions
  createSession: (data: { nickname?: string; ageGroup?: string }) =>
    fetchApi<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSession: (id: string) => fetchApi<Session>(`/sessions/${id}`),

  // Results
  submitAssessment: (data: {
    sessionId: string
    assessmentId: string
    responses: Array<{ questionId: string; value: number }>
  }) =>
    fetchApi<Result>('/results/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getResults: (sessionId: string) => fetchApi<Result[]>(`/results/${sessionId}`),

  getResult: (sessionId: string, assessmentId: string) =>
    fetchApi<Result>(`/results/${sessionId}/${assessmentId}`),

  // Careers
  getCareers: (hollandCode?: string) =>
    fetchApi<Career[]>(`/careers${hollandCode ? `?hollandCode=${hollandCode}` : ''}`),

  // Payments
  createCheckout: (data: { sessionId: string; assessmentId: string; successUrl?: string; cancelUrl?: string }) =>
    fetchApi<{ transactionId: string; transactionCode: string; checkoutUrl: string; formPayload: Record<string, string> }>('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
