import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SessionState {
  sessionId: string | null
  nickname: string | null
  setSession: (sessionId: string, nickname?: string) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: null,
      nickname: null,
      setSession: (sessionId, nickname) => set({ sessionId, nickname }),
      clearSession: () => set({ sessionId: null, nickname: null }),
    }),
    {
      name: 'mykite-session',
    }
  )
)

// Quiz progress store (not persisted - for current quiz only)
interface QuizState {
  currentQuestionIndex: number
  responses: Map<string, number>
  setResponse: (questionId: string, value: number) => void
  nextQuestion: () => void
  prevQuestion: () => void
  goToQuestion: (index: number) => void
  reset: () => void
}

export const useQuizStore = create<QuizState>((set) => ({
  currentQuestionIndex: 0,
  responses: new Map(),
  setResponse: (questionId, value) =>
    set((state) => {
      const newResponses = new Map(state.responses)
      newResponses.set(questionId, value)
      return { responses: newResponses }
    }),
  nextQuestion: () =>
    set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
  prevQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
    })),
  goToQuestion: (index) => set({ currentQuestionIndex: index }),
  reset: () => set({ currentQuestionIndex: 0, responses: new Map() }),
}))
