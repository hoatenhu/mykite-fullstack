import { useNavigate, useParams } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { LIKERT5_OPTIONS } from '@mykite/shared'
import { api, type AssessmentWithQuestions, type Question } from '@/lib/api'
import { useSessionStore, useQuizStore } from '@/lib/store'
import { ArrowRightIcon, CheckCircleIcon, ClockIcon, SparkIcon } from '@/components/icons'
import { Button, Card, ErrorState, LoadingState, PageContainer, Pill, ProgressBar } from '@/components/ui'

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
  const [showHalfwayNotice, setShowHalfwayNotice] = useState(false)
  const [hasShownHalfwayNotice, setHasShownHalfwayNotice] = useState(false)

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

  // Handle halfway milestone
  useEffect(() => {
    if (!hasShownHalfwayNotice && progress >= 50 && progress < 60 && questions.length > 4) {
      setShowHalfwayNotice(true)
      setHasShownHalfwayNotice(true)
      // Auto hide after 4 seconds
      const timer = setTimeout(() => setShowHalfwayNotice(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [progress, hasShownHalfwayNotice, questions.length])

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
    <div className="min-h-screen bg-ink-50/30 pb-12">
      {/* Sticky Progress Header */}
      <header className="sticky top-0 z-30 w-full border-b border-ink-100 bg-white/80 backdrop-blur-md">
        <PageContainer className="max-w-4xl py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-700 text-white shadow-soft">
                <SparkIcon className="h-6 w-6" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Đang thực hiện</p>
                <h3 className="text-sm font-bold text-ink-900 truncate max-w-[200px]">{data.assessment.nameVi}</h3>
              </div>
            </div>

            <div className="flex flex-1 max-w-md flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <span>Tiến độ bài làm</span>
                <span className="text-primary-700">{completedCount}/{questions.length} câu</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full bg-gradient-to-r from-primary-600 to-indigo-600 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 text-ink-600 sm:w-auto sm:px-3 sm:gap-2">
              <ClockIcon className="h-5 w-5" />
              <span className="hidden text-sm font-bold sm:inline">~{Math.ceil((questions.length - completedCount) / 6)}p</span>
            </div>
          </div>
        </PageContainer>
      </header>

      <PageContainer className="mt-4 max-w-4xl sm:mt-6 lg:mt-8">
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Halfway Milestone Notice */}
          {showHalfwayNotice && (
            <div className="animate-fade-in-up">
              <Card className="border-primary-200 bg-gradient-to-r from-primary-600 to-indigo-600 p-6 text-white shadow-xl">
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                    <SparkIcon className="h-8 w-8 text-yellow-300 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">Tuyệt vời, bạn đã hoàn thành 50%!</h3>
                    <p className="mt-1 text-sm text-white/80">Bạn đang đi đúng hướng. Chỉ còn một nửa chặng đường nữa thôi! 🚀</p>
                  </div>
                  <button onClick={() => setShowHalfwayNotice(false)} className="h-8 w-8 hover:bg-white/10 rounded-full">✕</button>
                </div>
              </Card>
            </div>
          )}

          {/* Main Question Area */}
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center rounded-full bg-primary-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary-700 border border-primary-100">
              Câu hỏi {currentQuestionIndex + 1} / {questions.length}
            </span>

            <h2 key={currentQuestion.id} className="animate-fade-in-up mt-2 text-center text-3xl font-bold leading-[1.35] text-ink-900 sm:text-4xl lg:text-5xl lg:leading-[1.2]">
              {currentQuestion.textVi}
            </h2>

            <p className="mt-3 text-lg text-ink-500 italic max-w-2xl">
              "Hãy chọn mức độ phản ánh đúng nhất về con người bạn."
            </p>

            {notice ? (
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm font-medium text-red-700 animate-fade-in-up">
                {notice}
              </div>
            ) : null}

            {/* Horizontal Likert Scale */}
            <div className="mt-4 w-full sm:mt-6 lg:mt-8">
              <div className="relative mx-auto max-w-3xl px-4">
                {/* Visual Scale Line */}
                <div className="absolute left-10 right-10 top-6 h-1 -z-10 bg-ink-100 hidden sm:block" />

                <div className="flex flex-row justify-between sm:items-start">
                  {LIKERT5_OPTIONS.map((option) => (
                    <OptionButtonHorizontal
                      key={option.value}
                      option={option}
                      selected={currentAnswer === option.value}
                      onClick={() => handleSelectAnswer(currentQuestion.id, option.value)}
                    />
                  ))}
                </div>

                {/* Labels at ends */}
                <div className="mt-4 flex items-center justify-between px-2 text-[11px] font-black uppercase tracking-widest text-ink-400 sm:text-xs">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-red-500">Rất không đồng ý</span>
                    <span className="h-1 w-8 bg-red-500/20 rounded-full" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-primary-600">Rất đồng ý</span>
                    <span className="h-1 w-8 bg-primary-600/20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="secondary"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="h-14 w-full sm:w-auto px-10 border-ink-200 bg-white shadow-sm hover:bg-ink-50"
            >
              Câu quay lại
            </Button>

            <div className="flex flex-1 items-center justify-center gap-4">
              <span className="text-xs font-bold text-ink-300 uppercase tracking-widest hidden lg:block">Phím mũi tên để di chuyển</span>
            </div>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting || responses.size < questions.length}
                className="h-14 w-full sm:w-auto px-12 shadow-lg shadow-primary-700/30 text-lg font-bold"
              >
                {submitting ? 'Đang xử lý...' : 'Nộp bài ngay'}
                <ArrowRightIcon className="ml-2 h-6 w-6" />
              </Button>
            ) : (
              <Button
                onClick={nextQuestion}
                disabled={!currentAnswer}
                className="h-14 w-full sm:w-auto px-12 shadow-md text-lg font-bold"
              >
                Tiếp theo
                <ArrowRightIcon className="ml-2 h-6 w-6" />
              </Button>
            )}
          </div>

          {/* Question Navigator (Always visible) */}
          <Card className="mx-auto mt-10 w-full max-w-3xl overflow-hidden border border-ink-100 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-100 text-ink-600">
                  <CheckCircleIcon className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-ink-900">Bản đồ bài làm</span>
                  <p className="text-xs text-ink-500">Xem nhanh các câu bạn đã trả lời</p>
                </div>
              </div>
            </div>

            <div className="border-t border-ink-100 p-8 pt-6">
              <div className="flex flex-wrap justify-center gap-2.5">
                {questions.map((question, index) => {
                  const isAnswered = responses.has(question.id)
                  const isCurrent = index === currentQuestionIndex

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => useQuizStore.getState().goToQuestion(index)}
                      className={[
                        'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300',
                        isCurrent && 'bg-primary-700 text-white shadow-soft scale-110 ring-4 ring-primary-100/50',
                        !isCurrent && isAnswered && 'bg-primary-100 text-primary-700 hover:bg-primary-200',
                        !isCurrent && !isAnswered && 'bg-ink-50 text-ink-300 hover:bg-ink-100',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>
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
  const getLikertColors = (val: number) => {
    switch (val) {
      case 1: return 'bg-red-500'
      case 2: return 'bg-orange-500'
      case 3: return 'bg-ink-400'
      case 4: return 'bg-emerald-500'
      case 5: return 'bg-primary-600'
      default: return 'bg-ink-200'
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col items-center gap-3 transition-all duration-300 active:scale-90"
    >
      <div
        className={cx(
          'flex h-12 w-12 items-center justify-center rounded-2xl text-base font-black transition-all duration-300 shadow-sm sm:h-14 sm:w-14',
          selected
            ? `${getLikertColors(option.value)} text-white scale-110 shadow-lg ring-4 ring-white`
            : 'bg-white text-ink-400 border border-ink-100 hover:border-ink-300 hover:scale-105'
        )}
      >
        {option.value}
      </div>

      {selected && (
        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary-700 shadow-sm animate-fade-in-up border border-primary-100">
          <CheckCircleIcon className="h-3 w-3" />
        </div>
      )}

      <span className={cx(
        'hidden text-[10px] font-bold uppercase tracking-tighter sm:block',
        selected ? 'text-ink-900' : 'text-ink-400'
      )}>
        {option.value === 3 ? 'Bình thường' : ''}
      </span>
    </button>
  )
}

function OptionButton({
  option,
  selected,
  onClick,
}: {
  option: (typeof LIKERT5_OPTIONS)[number]
  selected: boolean
  onClick: () => void
}) {
  const getLikertColors = (val: number) => {
    switch (val) {
      case 1: return 'border-red-200 hover:border-red-400 bg-red-50/30'
      case 2: return 'border-orange-200 hover:border-orange-400 bg-orange-50/30'
      case 3: return 'border-ink-200 hover:border-primary-300 bg-ink-50/30'
      case 4: return 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/30'
      case 5: return 'border-primary-200 hover:border-primary-400 bg-primary-50/30'
      default: return 'border-ink-100 bg-white'
    }
  }

  const getLikertIndicator = (val: number) => {
    switch (val) {
      case 1: return 'border-red-500 bg-red-500 text-white'
      case 2: return 'border-orange-500 bg-orange-500 text-white'
      case 3: return 'border-ink-400 bg-ink-400 text-white'
      case 4: return 'border-emerald-500 bg-emerald-500 text-white'
      case 5: return 'border-primary-600 bg-primary-600 text-white'
      default: return 'border-ink-200 text-ink-500'
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full rounded-[24px] border p-5 text-left transition-all duration-300 transform active:scale-[0.99] group',
        selected
          ? 'border-primary-600 bg-primary-50 shadow-soft ring-2 ring-primary-100'
          : `hover:bg-opacity-100 ${getLikertColors(option.value)}`,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center gap-5">
        <div
          className={[
            'flex h-12 w-12 items-center justify-center rounded-2xl border-2 text-sm font-black transition-all duration-300',
            selected ? 'border-primary-700 bg-primary-700 text-white shadow-soft scale-110' : getLikertIndicator(option.value),
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {option.value}
        </div>
        <div className="flex-1">
          <p className={cx('text-lg font-bold transition-colors', selected ? 'text-primary-950' : 'text-ink-800')}>
            {option.vi}
          </p>
          <p className={cx('text-xs uppercase tracking-widest transition-colors', selected ? 'text-primary-700/60' : 'text-ink-400')}>
            {option.en}
          </p>
        </div>
        {selected && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 animate-fade-in-up">
            <CheckCircleIcon className="h-5 w-5" />
          </div>
        )}
      </div>
    </button>
  )
}
