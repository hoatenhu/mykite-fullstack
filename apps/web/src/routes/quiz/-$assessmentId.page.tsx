import { useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
import { api, type AssessmentWithQuestions, type Question } from '@/lib/api'
import { useSessionStore, useQuizStore } from '@/lib/store'
import { LIKERT5_OPTIONS } from '@mykite/shared'

export function QuizPage() {
  const { assessmentId } = useParams({ from: '/quiz/$assessmentId' })
  const navigate = useNavigate()

  const { sessionId, setSession } = useSessionStore()
  const {
    currentQuestionIndex,
    responses,
    setResponse,
    nextQuestion,
    prevQuestion,
    reset,
  } = useQuizStore()

  const [data, setData] = useState<AssessmentWithQuestions | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    reset()
    api
      .getAssessmentQuestions(assessmentId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [assessmentId, reset])

  useEffect(() => {
    if (!sessionId) {
      api.createSession({}).then((session) => {
        setSession(session.id, session.nickname ?? undefined)
      })
    }
  }, [sessionId, setSession])

  const handleSubmit = useCallback(async () => {
    if (!data || !sessionId) return

    if (responses.size < data.questions.length) {
      alert('Vui lòng trả lời tất cả các câu hỏi')
      return
    }

    setSubmitting(true)
    try {
      await api.submitAssessment({
        sessionId,
        assessmentId,
        responses: Array.from(responses.entries()).map(([questionId, value]) => ({
          questionId,
          value,
        })),
      })

      navigate({
        to: '/results/$sessionId/$assessmentId',
        params: { sessionId, assessmentId },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }, [data, sessionId, assessmentId, responses, navigate])

  if (loading) return <LoadingState />
  if (error || !data) return <ErrorState error={error ?? 'Không tải được dữ liệu'} />

  const questions = data.questions
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const currentAnswer = currentQuestion ? responses.get(currentQuestion.id) : undefined

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>{data.assessment.nameVi}</span>
            <span>
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            selectedValue={currentAnswer}
            onSelect={(value) => setResponse(currentQuestion.id, value)}
          />
        )}

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Câu trước
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || responses.size < questions.length}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? 'Đang xử lý...' : 'Nộp bài & Xem kết quả'}
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              disabled={!currentAnswer}
              className="px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Câu tiếp →
            </button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {questions.map((q, idx) => {
            const isAnswered = responses.has(q.id)
            const isCurrent = idx === currentQuestionIndex

            return (
              <button
                key={q.id}
                onClick={() => useQuizStore.getState().goToQuestion(idx)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-primary-600 text-white ring-2 ring-primary-300'
                    : isAnswered
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function QuestionCard({
  question,
  questionNumber,
  selectedValue,
  onSelect,
}: {
  question: Question
  questionNumber: number
  selectedValue?: number
  onSelect: (value: number) => void
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-sm text-primary-600 font-medium mb-2">Câu hỏi {questionNumber}</div>
      <h2 className="text-xl md:text-2xl font-semibold mb-8">{question.textVi}</h2>

      <div className="space-y-3">
        {LIKERT5_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedValue === option.value
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedValue === option.value
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedValue === option.value && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="font-medium">{option.vi}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-500">Đang tải câu hỏi...</p>
      </div>
    </div>
  )
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 text-lg">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-primary-600 hover:underline">
          Thử lại
        </button>
      </div>
    </div>
  )
}
