import { Link, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  BIGFIVE_DESCRIPTIONS,
  BIGFIVE_LABELS,
  HOLLAND_DESCRIPTIONS,
  HOLLAND_LABELS,
  type BigFiveDimension,
  type HollandDimension,
} from '@mykite/shared'
import { BigFiveChart } from '@/components/BigFiveChart'
import { HollandChart } from '@/components/HollandChart'
import { ArrowRightIcon, CheckCircleIcon, PrintIcon } from '@/components/icons'
import { api, type Career, type Result } from '@/lib/api'
import { Button, ButtonLink, Card, ErrorState, LoadingState, PageContainer, Pill } from '@/components/ui'

export function ResultsPage() {
  const { sessionId, assessmentId } = useParams({ from: '/results/$sessionId/$assessmentId' })

  const [result, setResult] = useState<Result | null>(null)
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const resultData = await api.getResult(sessionId, assessmentId)
        setResult(resultData)

        if (resultData.assessmentType === 'holland' && resultData.resultCode) {
          const careerData = await api.getCareers(resultData.resultCode)
          setCareers(careerData.slice(0, 8))
        } else {
          setCareers([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [assessmentId, sessionId])

  if (loading) {
    return <LoadingState title="MyKite đang phân tích kết quả" description="Chúng mình đang gom các tín hiệu nổi bật để trả lại một bức tranh rõ ràng hơn về bạn." />
  }

  if (error || !result) {
    return (
      <ErrorState
        title="Không mở được trang kết quả"
        description={error ?? 'Kết quả không tồn tại hoặc chưa được tạo thành công.'}
        action={<ButtonLink to="/assessments">Quay lại khu trắc nghiệm</ButtonLink>}
      />
    )
  }

  return (
    <div className="pb-20 pt-10 sm:pt-12">
      <PageContainer className="max-w-5xl">
        <ResultHero result={result} />

        <div className="mt-8 space-y-6">
          {result.assessmentType === 'holland' ? (
            <HollandResults result={result} careers={careers} />
          ) : (
            <BigFiveResults result={result} />
          )}

          <Card className="p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-ink-900">Bạn muốn làm gì tiếp theo?</h2>
                <p className="mt-2 text-sm leading-6 text-ink-600">
                  Bạn có thể làm thêm bài còn lại để bổ sung góc nhìn, hoặc in kết quả để tiện trao đổi với phụ huynh, giáo viên hay cố vấn.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink to="/assessments" variant="secondary">
                  Làm bài khác
                </ButtonLink>
                <Button onClick={() => window.print()}>
                  <PrintIcon className="h-4 w-4" />
                  In kết quả
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </PageContainer>
    </div>
  )
}

function ResultHero({ result }: { result: Result }) {
  return (
    <Card className="overflow-hidden border-primary-100 bg-gradient-to-br from-white via-primary-50 to-cream-50 p-8 sm:p-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-mint-100 text-primary-700">
            <CheckCircleIcon className="h-7 w-7" />
          </div>
          <p className="mt-5 text-sm uppercase tracking-[0.2em] text-primary-600">Kết quả đã sẵn sàng</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{result.assessmentNameVi ?? 'Kết quả trắc nghiệm của bạn'}</h1>
          <p className="mt-4 text-base leading-7 text-ink-600">
            {result.assessmentType === 'holland'
              ? 'Đây là nhóm sở thích nghề nghiệp nổi bật nhất ở thời điểm hiện tại của bạn.'
              : 'Đây là bức tranh khái quát về 5 khía cạnh tính cách cốt lõi của bạn.'}
          </p>
        </div>

        {result.assessmentType === 'holland' && result.resultCode ? (
          <div className="rounded-[28px] bg-primary-700 px-8 py-7 text-center text-white shadow-soft">
            <p className="text-sm uppercase tracking-[0.18em] text-primary-100">Mã Holland</p>
            <p className="mt-2 text-5xl font-semibold tracking-[0.18em]">{result.resultCode}</p>
          </div>
        ) : (
          <Pill className="border-primary-200 bg-white text-primary-700">Big Five OCEAN</Pill>
        )}
      </div>
    </Card>
  )
}

function HollandResults({ result, careers }: { result: Result; careers: Career[] }) {
  const scores = result.scores as Record<HollandDimension, number>
  const topThree = (result.topDimensions ?? []) as HollandDimension[]

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink-900">Bản đồ sở thích nghề nghiệp</h2>
        <p className="mt-2 text-sm leading-6 text-ink-600">Biểu đồ cho thấy nhóm sở thích nào đang nổi bật hơn trong cách bạn tiếp cận công việc và học tập.</p>
        <div className="mt-6">
          <HollandChart scores={scores} />
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink-900">3 nhóm nổi bật nhất</h2>
        <div className="mt-6 space-y-4">
          {topThree.map((dimension, index) => (
            <div key={dimension} className="rounded-[24px] border border-ink-100 bg-ink-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-700 text-lg font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-ink-900">{HOLLAND_LABELS[dimension].vi}</h3>
                      <span className="text-sm text-ink-500">({dimension})</span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-ink-600">{HOLLAND_DESCRIPTIONS[dimension].vi}</p>
                  </div>
                </div>
                <Pill>{scores[dimension]}%</Pill>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {careers.length > 0 ? (
        <Card className="p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-ink-900">Nhóm nghề bạn có thể tham khảo</h2>
              <p className="mt-2 text-sm leading-6 text-ink-600">Đây là các lựa chọn gần với mã Holland của bạn để bắt đầu tìm hiểu sâu hơn.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {careers.map((career) => (
              <div key={career.id} className="rounded-[24px] border border-ink-100 bg-white p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink-900">{career.nameVi}</h3>
                    {career.nameEn ? <p className="mt-1 text-sm text-ink-500">{career.nameEn}</p> : null}
                  </div>
                  {career.futureOutlook === 'high' ? <Pill className="bg-mint-100 text-primary-700">Xu hướng cao</Pill> : null}
                </div>

                {career.matchScore > 0 ? (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm text-ink-600">
                      <span>Độ phù hợp</span>
                      <span className="font-medium text-ink-900">{Math.min(career.matchScore, 100)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-primary-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700"
                        style={{ width: `${Math.min(career.matchScore, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  )
}

function BigFiveResults({ result }: { result: Result }) {
  const scores = result.scores as Record<BigFiveDimension, number>

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink-900">Biểu đồ 5 khía cạnh tính cách</h2>
        <p className="mt-2 text-sm leading-6 text-ink-600">Các điểm số không nói bạn tốt hay chưa tốt. Chúng chỉ cho thấy xu hướng tính cách đang nổi bật hơn ở bạn.</p>
        <div className="mt-6">
          <BigFiveChart scores={scores} />
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink-900">Diễn giải từng khía cạnh</h2>
        <div className="mt-6 space-y-5">
          {(Object.keys(scores) as BigFiveDimension[]).map((dimension) => {
            const level = getLevel(scores[dimension])

            return (
              <div key={dimension} className="rounded-[24px] border border-ink-100 bg-ink-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900">{BIGFIVE_LABELS[dimension].vi}</h3>
                    <p className="mt-1 text-sm text-ink-500">{BIGFIVE_LABELS[dimension].en}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Pill>{level}</Pill>
                    <span className="text-lg font-semibold text-primary-700">{scores[dimension]}%</span>
                  </div>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-primary-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-700"
                    style={{ width: `${scores[dimension]}%` }}
                  />
                </div>
                <p className="mt-4 text-sm leading-7 text-ink-600">{BIGFIVE_DESCRIPTIONS[dimension].vi}</p>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="border-primary-100 bg-primary-50 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink-900">Gợi ý bước tiếp theo</h2>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-ink-600">
          <li>Đối chiếu kết quả với cách bạn học và làm việc thực tế gần đây.</li>
          <li>Nếu cần thêm góc nhìn về nghề phù hợp, hãy làm thêm bài Holland RIASEC.</li>
          <li>Ghi lại 2-3 điểm khiến bạn thấy “đúng với mình nhất” để dùng cho bước định hướng tiếp theo.</li>
        </ul>
      </Card>
    </div>
  )
}

function getLevel(score: number) {
  if (score < 34) return 'Thấp'
  if (score > 66) return 'Cao'
  return 'Trung bình'
}
