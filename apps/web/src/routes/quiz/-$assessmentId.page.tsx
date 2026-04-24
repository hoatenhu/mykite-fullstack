import { useNavigate, useParams } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { LIKERT5_OPTIONS } from '@mykite/shared'
import { api, type AssessmentWithQuestions, type Question } from '@/lib/api'
import { useSessionStore, useQuizStore } from '@/lib/store'
import { ArrowRightIcon } from '@/components/icons'
import { Button, ErrorState, LoadingState, PageContainer } from '@/components/ui'

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function QuizPage() {
  const { assessmentId } = useParams({ from: '/quiz/$assessmentId' })
  const navigate = useNavigate()

  const { sessionId, setSession } = useSessionStore()
  const { currentQuestionIndex, responses, setResponse, nextQuestion, prevQuestion, reset } = useQuizStore()

  const [data, setData] = useState<AssessmentWithQuestions | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const loadAssessment = useCallback(() => {
    setLoading(true)
    setError(null)
    setNotice(null)
    reset()

    api
      .getAssessmentQuestions(assessmentId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [assessmentId, reset])

  useEffect(() => {
    loadAssessment()
  }, [loadAssessment])

  // Tạo session MỚI mỗi lần vào trang làm bài, bất kể đã có session cũ hay chưa.
  // Điều này đảm bảo mỗi lần làm bài → submit → phải thanh toán riêng.
  useEffect(() => {
    api.createSession({}).then((session) => {
      setSession(session.id, session.nickname ?? undefined)
    })
  }, [setSession])

  // const handleNext = () => {
  //   setIsWarping(true)
  //   setTimeout(() => {
  //     nextQuestion()
  //     setIsWarping(false)
  //   }, 1000)
  // }

  // const handlePrev = () => {
  //   setIsWarping(true)
  //   setTimeout(() => {
  //     prevQuestion()
  //     setIsWarping(false)
  //   }, 1000)
  // }

  // const handleGoTo = (idx: number) => {
  //   if (idx === currentQuestionIndex) return;
  //   setIsWarping(true)
  //   setTimeout(() => {
  //     useQuizStore.getState().goToQuestion(idx)
  //     setIsWarping(false)
  //   }, 1000)
  // }

  const handleSubmit = useCallback(async () => {
    if (!data || !sessionId) return

    if (responses.size < data.questions.length) {
      setNotice('Bạn cần trả lời hết các câu để MyKite phân tích kết quả chính xác.')
      return
    }

    setNotice(null)
    setSubmitting(true)

    try {
      await api.submitAssessment({
        sessionId,
        assessmentId: data.assessment.id,
        responses: Array.from(responses.entries()).map(([questionId, value]) => ({
          questionId,
          value,
        })),
      })

      navigate({
        to: '/results/$sessionId/$assessmentId',
        params: { sessionId, assessmentId: data.assessment.id },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi nộp bài')
    } finally {
      setSubmitting(false)
    }
  }, [assessmentId, data, navigate, responses, sessionId])

  const questions = data?.questions ?? []
  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = currentQuestion ? responses.get(currentQuestion.id) : undefined
  const completedCount = responses.size
  const progress = questions.length > 0 ? (completedCount / questions.length) * 100 : 0
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  if (loading) {
    return <LoadingState title="Đang chuẩn bị câu hỏi" description="MyKite đang xếp sẵn không gian làm bài để bạn bắt đầu thuận hơn." />
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Chưa thể mở bài trắc nghiệm"
        description={error ?? 'Không tải được dữ liệu câu hỏi.'}
        action={<Button onClick={loadAssessment}>Tải lại bài</Button>}
      />
    )
  }

  const handleSelectAnswer = (questionId: string, value: number) => {
    setNotice(null)
    setResponse(questionId, value)

    // Auto next logic with small delay for visual feedback
    if (!isLastQuestion) {
      setTimeout(() => {
        nextQuestion()
      }, 400)
    }
  }

  if (!currentQuestion) {
    return (
      <ErrorState
        title="Không tìm thấy câu hỏi hiện tại"
        description="Dữ liệu bài làm có vẻ chưa đồng bộ. Bạn có thể tải lại bài để tiếp tục."
        action={<Button onClick={loadAssessment}>Tải lại bài</Button>}
      />
    )
  }

  return (
    <div className="min-h-screen bg-paper-100 pb-12">
      <header className="sticky top-0 z-30 w-full border-b border-ink-200 bg-paper-50/95 backdrop-blur-md">
        <PageContainer className="max-w-3xl py-4">
          <p className="font-label text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">{data.assessment.nameVi}</p>
          <div className="mt-3 flex items-center justify-between gap-4 text-sm text-ink-600">
            <span>Câu {currentQuestionIndex + 1} / {questions.length}</span>
            <span>{completedCount} đã trả lời</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-ink-900 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </PageContainer>
      </header>

      <PageContainer className="mt-6 max-w-6xl">
        <div className="mx-auto flex min-h-[calc(100dvh-15rem)] max-w-6xl flex-col justify-center pb-6">
          <div className="flex flex-col gap-8">
            <div className="flex min-h-[200px] flex-col items-center justify-center text-center sm:min-h-[220px] lg:min-h-[250px]">
              <span className="font-label text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                Chọn một mức độ phù hợp nhất
              </span>

              <h2 key={currentQuestion.id} className="mt-4 max-w-5xl text-center text-[2rem] font-semibold leading-[1.2] tracking-[-0.04em] text-ink-900 sm:text-[2.6rem] lg:text-[3.4rem]">
                {currentQuestion.textVi}
              </h2>

              {notice ? (
                <div className="mt-5 rounded-2xl border border-ink-300 bg-paper-200/70 px-5 py-3 text-sm text-ink-700">
                  {notice}
                </div>
              ) : null}
            </div>

            <div className="mx-auto w-full max-w-3xl">
              <div className="relative mx-auto px-2 sm:px-4">
                <div className="absolute left-[12%] right-[12%] top-6 -z-10 hidden h-px bg-ink-200 sm:block" />

                <div className="grid grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                  {LIKERT5_OPTIONS.map((option) => (
                    <OptionButtonHorizontal
                      key={option.value}
                      option={option}
                      selected={currentAnswer === option.value}
                      onClick={() => handleSelectAnswer(currentQuestion.id, option.value)}
                    />
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500 sm:mt-4 sm:text-xs">
                  <span>Rất không đồng ý</span>
                  <span className="text-ink-700">Rất đồng ý</span>
                </div>
              </div>
            </div>

            <div className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-4 border-t border-ink-200 pt-6">
              <Button
                variant="secondary"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="h-12 w-full border-ink-300 bg-paper-50 px-6 shadow-none hover:bg-paper-200"
              >
                Quay lại
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || responses.size < questions.length}
                  className="h-12 w-full px-6 text-base font-bold"
                >
                  {submitting ? 'Đang xử lý...' : 'Nộp bài'}
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  disabled={!currentAnswer}
                  className="h-12 w-full px-6 text-base font-bold"
                >
                  Tiếp theo
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}

function OptionButtonHorizontal({
  option,
  selected,
  onClick,
}: {
  option: (typeof LIKERT5_OPTIONS)[number]
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col items-center gap-2 transition-all duration-200 active:scale-95"
    >
      <div
        className={cx(
          'flex h-12 w-12 items-center justify-center rounded-2xl border text-base font-semibold transition-all duration-200 sm:h-14 sm:w-14',
          selected
            ? 'border-ink-900 bg-ink-900 text-paper-50'
            : 'border-ink-200 bg-paper-50 text-ink-500 hover:border-ink-400 hover:text-ink-800'
        )}
      >
        {option.value}
      </div>

      <span className={cx(
        'hidden min-h-[14px] text-[10px] font-semibold uppercase tracking-[0.12em] sm:block',
        selected ? 'text-ink-900' : 'text-ink-400'
      )}>
        {option.value === 3 ? 'Bình thường' : ''}
      </span>
    </button>
  )
}
