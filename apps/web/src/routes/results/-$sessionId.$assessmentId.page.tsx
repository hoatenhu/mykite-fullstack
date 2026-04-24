import { useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
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
import { ArrowRightIcon, PrintIcon } from '@/components/icons'
import { api, type Career, type Result } from '@/lib/api'
import { Button, ButtonLink, Card, ErrorState, LoadingState, PageContainer, Pill } from '@/components/ui'

export function ResultsPage() {
  const { sessionId, assessmentId } = useParams({ from: '/results/$sessionId/$assessmentId' })

  const [result, setResult] = useState<Result | null>(null)
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        // Optional: Can add a toast message here if you want to notify users
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  if (!result.isPaid) {
    return <PaymentScreen result={result} sessionId={sessionId} assessmentId={assessmentId} onPaymentSuccess={() => window.location.reload()} />
  }

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true)

      const element = document.getElementById('report-content')
      if (!element) {
        setDownloading(false)
        return
      }

      await new Promise(resolve => setTimeout(resolve, 300))

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`MyKite-BaoCao-${result.assessmentType}.pdf`)
      setDownloading(false)

    } catch (err) {
      console.error(err)
      alert('Có lỗi xảy ra khi tải báo cáo, vui lòng thử lại sau.')
      setDownloading(false)
    }
  }

    return (
      <div className="pb-20 pt-10 sm:pt-12" id="report-content">
        <PageContainer className="max-w-5xl">
          <ResultHero result={result} />

          <div className="mt-8 space-y-6">
            {result.assessmentType === 'holland' ? (
              <HollandResults result={result} careers={careers} />
            ) : (
              <BigFiveResults result={result} />
            )}

            <Card className="p-6 sm:p-8" data-html2canvas-ignore>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-ink-900">Tiếp theo</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-600">
                    Làm thêm bài còn lại để có góc nhìn đầy đủ hơn, hoặc tải kết quả này về để lưu lại.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row shrink-0">
                  <ButtonLink to="/assessments" variant="secondary" className="w-full sm:w-auto whitespace-nowrap">
                    Làm bài khác
                  </ButtonLink>
                  <Button onClick={handleDownloadPDF} disabled={downloading} className="w-full sm:w-auto whitespace-nowrap">
                    <PrintIcon className="mr-2 h-5 w-5" />
                    {downloading ? 'Đang tải...' : 'Tải kết quả'}
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
    <Card className="overflow-hidden bg-paper-50 p-8 sm:p-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-ink-500">Kết quả đã sẵn sàng</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{result.assessmentNameVi ?? 'Kết quả trắc nghiệm của bạn'}</h1>
          <p className="mt-4 text-base leading-7 text-ink-600">
            {result.assessmentType === 'holland'
              ? 'Đây là nhóm sở thích nghề nghiệp nổi bật nhất ở thời điểm hiện tại của bạn.'
              : 'Đây là bức tranh khái quát về 5 khía cạnh tính cách cốt lõi của bạn.'}
          </p>
        </div>

        {result.assessmentType === 'holland' && result.resultCode ? (
          <div className="rounded-[20px] border border-ink-200 bg-paper-200/70 px-7 py-6 text-center text-ink-900">
            <p className="font-label text-xs uppercase tracking-[0.18em] text-ink-500">Mã Holland</p>
            <p className="mt-2 text-4xl font-semibold tracking-[0.12em] text-ink-900">{result.resultCode}</p>
          </div>
        ) : (
          <Pill className="border-ink-300 bg-paper-200 text-ink-800">Big Five OCEAN</Pill>
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
            <div key={dimension} className="rounded-[24px] border border-ink-200 bg-paper-100 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-paper-50 text-sm font-semibold text-ink-900">
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
              <div key={career.id} className="rounded-[24px] border border-ink-200 bg-paper-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink-900">{career.nameVi}</h3>
                    {career.nameEn ? <p className="mt-1 text-sm text-ink-500">{career.nameEn}</p> : null}
                  </div>
                  {career.futureOutlook === 'high' ? <Pill className="bg-paper-200 text-ink-800">Xu hướng cao</Pill> : null}
                </div>

                {career.matchScore > 0 ? (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm text-ink-600">
                      <span>Độ phù hợp</span>
                      <span className="font-medium text-ink-900">{Math.min(career.matchScore, 100)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-ink-200">
                      <div
                        className="h-full rounded-full bg-ink-900"
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
              <div key={dimension} className="rounded-[24px] border border-ink-200 bg-paper-100 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900">{BIGFIVE_LABELS[dimension].vi}</h3>
                    <p className="mt-1 text-sm text-ink-500">{BIGFIVE_LABELS[dimension].en}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Pill>{level}</Pill>
                    <span className="text-lg font-semibold text-ink-900">{scores[dimension]}%</span>
                  </div>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-ink-200">
                  <div
                    className="h-full rounded-full bg-ink-900"
                    style={{ width: `${scores[dimension]}%` }}
                  />
                </div>
                <p className="mt-4 text-sm leading-7 text-ink-600">{BIGFIVE_DESCRIPTIONS[dimension].vi}</p>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="border-ink-300 bg-paper-100 p-6 sm:p-8">
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

function PaymentScreen({ result, sessionId, assessmentId, onPaymentSuccess }: { result: Result; sessionId: string; assessmentId: string, onPaymentSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const isHolland = result.assessmentType === 'holland'
  const originalPrice = isHolland ? '20.000' : '40.000'
  const finalPrice = isHolland ? '10.000' : '20.000'

  useEffect(() => {
    // Poll API check payment status
    const interval = setInterval(async () => {
      try {
        const res = await api.getResult(sessionId, assessmentId)
        if (res.isPaid) {
          onPaymentSuccess()
        }
      } catch (err) {
        console.error(err)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [sessionId, assessmentId, onPaymentSuccess])

  const handleCheckout = async () => {
    try {
      setLoading(true)
      const res = await api.createCheckout({ sessionId, assessmentId })
      if (res.checkoutUrl && res.formPayload) {
        // Create invisible form dynamically
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = res.checkoutUrl;

        Object.entries(res.formPayload).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo thanh toán.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-100 pb-20 pt-10 sm:pt-12">
      <PageContainer className="max-w-3xl">
        <div className="text-center">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-ink-500">Kết quả đã sẵn sàng</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Mở khóa để xem trọn vẹn báo cáo của bạn.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-ink-600">
            Kết quả bài trắc nghiệm <strong className="text-ink-900">{result.assessmentNameVi}</strong> đã được phân tích xong. Mở khóa để xem toàn bộ diễn giải, gợi ý và file tải về.
          </p>
        </div>

        <Card className="mt-10 overflow-hidden bg-paper-50 p-8 sm:p-10">
          <div className="flex flex-col items-center justify-center text-center">
            <Pill className="mb-4 bg-paper-200 text-ink-800">Mở khóa kết quả</Pill>

            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-bold text-ink-400 line-through decoration-ink-300">
                {originalPrice}đ
              </span>
              <span className="text-5xl font-extrabold text-ink-900">
                {finalPrice}đ
              </span>
            </div>

            <p className="mt-6 text-base font-semibold text-ink-900">
              Bạn sẽ nhận được:
            </p>
            <ul className="mt-4 mb-2 flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-ink-200 bg-paper-100 p-5 text-left text-sm text-ink-700">
              <li className="flex items-start gap-3">
                <span>Phân tích đầy đủ và dễ đọc</span>
              </li>
              <li className="flex items-start gap-3">
                <span>Gợi ý nghề nghiệp và bước tiếp theo</span>
              </li>
              <li className="flex items-start gap-3">
                <span>Tải file báo cáo để lưu lại</span>
              </li>
            </ul>

            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-8 h-12 px-10 text-base font-bold"
            >
              {loading ? 'Đang khởi tạo...' : 'Thanh toán ngay'}
              {!loading && <ArrowRightIcon className="ml-2 h-5 w-5" />}
            </Button>

            <div className="mt-6 flex items-center gap-2 text-xs text-ink-400">
              <span>Bảo mật thanh toán qua SePay</span>
            </div>
          </div>
        </Card>
      </PageContainer>
    </div>
  )
}
