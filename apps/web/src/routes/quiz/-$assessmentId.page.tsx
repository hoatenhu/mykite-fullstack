import { useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { api, type AssessmentWithQuestions, type Question } from '@/lib/api'
import { useSessionStore, useQuizStore } from '@/lib/store'
import { LIKERT5_OPTIONS } from '@mykite/shared'
import { Canvas } from '@react-three/fiber'
import { SpaceScene } from '@/components/ui/SpaceScene'

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
  const [isWarping, setIsWarping] = useState(false)

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

  const handleNext = () => {
    setIsWarping(true)
    setTimeout(() => {
      nextQuestion()
      setIsWarping(false)
    }, 1000)
  }

  const handlePrev = () => {
    setIsWarping(true)
    setTimeout(() => {
      prevQuestion()
      setIsWarping(false)
    }, 1000)
  }

  const handleGoTo = (idx: number) => {
    if (idx === currentQuestionIndex) return;
    setIsWarping(true)
    setTimeout(() => {
      useQuizStore.getState().goToQuestion(idx)
      setIsWarping(false)
    }, 1000)
  }

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
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden bg-[#0a0a0a] border-none">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <Suspense fallback={null}>
            <SpaceScene isWarping={isWarping} />
          </Suspense>
        </Canvas>
      </div>

      <div className="relative z-10 w-full min-h-[calc(100vh-4rem)] flex flex-col">
        <div className="backdrop-blur-md bg-black/40 border-b border-white/5 sticky top-16 z-40">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>{data.assessment.nameVi}</span>
              <span>
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-500 transition-all duration-300 shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 flex-1 w-full relative z-10">
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              selectedValue={currentAnswer}
              onSelect={(value) => {
                setResponse(currentQuestion.id, value)
              }}
            />
          )}

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0 || isWarping}
              className="px-6 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ← Câu trước
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || responses.size < questions.length || isWarping}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? 'Đang xử lý...' : 'Nộp bài'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!currentAnswer || isWarping}
                className="px-6 py-3 rounded-xl bg-primary-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] font-semibold hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all group relative overflow-hidden"
              >
                Câu tiếp →
                {isWarping && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl blur-sm" />
                )}
              </button>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-12 pb-8">
            {questions.map((q, idx) => {
              const isAnswered = responses.has(q.id)
              const isCurrent = idx === currentQuestionIndex

              return (
                <button
                  key={q.id}
                  onClick={() => handleGoTo(idx)}
                  disabled={isWarping}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-all backdrop-blur-md ${
                    isCurrent
                      ? 'bg-primary-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] ring-2 ring-primary-300'
                      : isAnswered
                      ? 'bg-primary-900/50 text-primary-200 border border-primary-500/50 hover:bg-primary-800/50'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
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
    <div className="backdrop-blur-xl bg-black/40 rounded-3xl shadow-2xl p-8 border border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

      <div className="relative z-10">
        <div className="text-sm text-primary-400 font-bold mb-3 tracking-widest uppercase">Câu hỏi {questionNumber}</div>
        <h2 className="text-xl md:text-2xl font-semibold mb-8 text-white leading-relaxed">{question.textVi}</h2>

        <div className="space-y-4">
          {LIKERT5_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all backdrop-blur-sm group ${
                selectedValue === option.value
                  ? 'border-primary-500 bg-primary-500/20 text-white shadow-[0_0_20px_rgba(14,165,233,0.15)]'
                  : 'border-white/5 text-gray-300 hover:border-white/20 hover:bg-white/5 bg-black/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    selectedValue === option.value
                      ? 'border-primary-400 bg-primary-500'
                      : 'border-gray-500 group-hover:border-gray-400 bg-white/5'
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
                <span className="font-medium text-[15px]">{option.vi}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
        <p className="mt-4 text-gray-400 font-medium tracking-wide animate-pulse">Đang tải câu hỏi...</p>
      </div>
    </div>
  )
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-red-500/20 shadow-2xl">
        <p className="text-red-400 text-lg mb-4 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20 hover:border-red-500/40">
          Thử lại
        </button>
      </div>
    </div>
  )
}
