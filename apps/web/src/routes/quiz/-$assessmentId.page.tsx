import { useNavigate, useParams } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { LIKERT5_OPTIONS } from '@mykite/shared'
import { api, type AssessmentWithQuestions, type Question } from '@/lib/api'
import { useSessionStore, useQuizStore } from '@/lib/store'
import { ArrowRightIcon, CheckCircleIcon, ClockIcon } from '@/components/icons'
import { Button, Card, ErrorState, LoadingState, PageContainer, Pill, ProgressBar } from '@/components/ui'

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
      setNotice('Bạn cần trả lời hết các câu để MyKite phân tích kết quả chính xác.')
      return
    }

    setNotice(null)
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
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi nộp bài')
    } finally {
      setSubmitting(false)
    }
  }, [assessmentId, data, navigate, responses, sessionId])

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

  const questions = data.questions
  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = currentQuestion ? responses.get(currentQuestion.id) : undefined
  const completedCount = responses.size
  const progress = (completedCount / questions.length) * 100
  const isLastQuestion = currentQuestionIndex === questions.length - 1

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
    <div className="pb-20 pt-8 sm:pt-10">
      <PageContainer className="max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <Card className="p-6 sm:p-7 lg:sticky lg:top-28">
            <Pill>{data.assessment.type === 'holland' ? 'Hướng nghiệp' : 'Tính cách'}</Pill>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink-900">{data.assessment.nameVi}</h1>
            <p className="mt-3 text-sm leading-7 text-ink-600">
              Trả lời theo cảm nhận thật của bạn ở thời điểm hiện tại. Không có đáp án đúng tuyệt đối.
            </p>

            <div className="mt-6 space-y-4 rounded-[24px] bg-ink-50 p-5">
              <div className="flex items-center justify-between text-sm text-ink-600">
                <span>Tiến độ hoàn thành</span>
                <span className="font-medium text-ink-900">{completedCount}/{questions.length} câu</span>
              </div>
              <ProgressBar value={progress} />
              <div className="flex flex-wrap gap-2 text-sm text-ink-600">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2">
                  <ClockIcon className="h-4 w-4" />
                  <span>Khoảng {Math.ceil(questions.length / 6)} phút còn lại</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>{currentQuestionIndex + 1} / {questions.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-ink-900">Bản đồ câu hỏi</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {questions.map((question, index) => {
                  const isAnswered = responses.has(question.id)
                  const isCurrent = index === currentQuestionIndex

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => useQuizStore.getState().goToQuestion(index)}
                      className={[
                        'flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-medium transition',
                        isCurrent && 'bg-primary-700 text-white shadow-soft',
                        !isCurrent && isAnswered && 'bg-primary-100 text-primary-700 hover:bg-primary-200',
                        !isCurrent && !isAnswered && 'bg-ink-100 text-ink-500 hover:bg-ink-200',
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

          <div className="space-y-5">
            <Card className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary-600">Câu hỏi {currentQuestionIndex + 1}</p>
                  <h2 className="mt-3 text-2xl font-semibold leading-tight text-ink-900 sm:text-[2rem]">{currentQuestion.textVi}</h2>
                </div>
                <Pill className="bg-cream-100 text-primary-700">Trả lời theo mức độ đúng với bạn</Pill>
              </div>

              {notice ? (
                <div className="mt-6 rounded-2xl border border-cream-200 bg-cream-100 px-4 py-3 text-sm leading-6 text-primary-800">
                  {notice}
                </div>
              ) : null}

              <div className="mt-8 space-y-3">
                {LIKERT5_OPTIONS.map((option) => (
                  <OptionButton
                    key={option.value}
                    option={option}
                    selected={currentAnswer === option.value}
                    onClick={() => {
                      setNotice(null)
                      onSelectAnswer(currentQuestion.id, option.value, setResponse)
                    }}
                  />
                ))}
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="secondary" onClick={prevQuestion} disabled={currentQuestionIndex === 0}>
                  Câu trước
                </Button>

                {isLastQuestion ? (
                  <Button onClick={handleSubmit} disabled={submitting || responses.size < questions.length} className="sm:min-w-[220px]">
                    {submitting ? 'Đang xử lý...' : 'Nộp bài và xem kết quả'}
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    disabled={!currentAnswer}
                    className="sm:min-w-[180px]"
                  >
                    Câu tiếp theo
                    <ArrowRightIcon />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}

function onSelectAnswer(
  questionId: string,
  value: number,
  setResponse: (questionId: string, value: number) => void
) {
  setResponse(questionId, value)
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full rounded-[24px] border p-4 text-left transition sm:p-5',
        selected
          ? 'border-primary-300 bg-primary-50 shadow-soft'
          : 'border-ink-100 bg-white hover:border-primary-200 hover:bg-primary-50/50',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center gap-4">
        <div
          className={[
            'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition',
            selected ? 'border-primary-700 bg-primary-700 text-white' : 'border-ink-200 text-ink-500',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {option.value}
        </div>
        <div>
          <p className="font-medium text-ink-900">{option.vi}</p>
          <p className="mt-1 text-sm text-ink-500">{option.en}</p>
        </div>
      </div>
    </button>
  )
}
