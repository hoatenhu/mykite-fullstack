import { Link, useParams } from '@tanstack/react-router'
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
import { ArrowRightIcon, CheckCircleIcon, PrintIcon } from '@/components/icons'
import { api, type Career, type Result } from '@/lib/api'
import { Button, ButtonLink, Card, ErrorState, LoadingState, PageContainer, Pill } from '@/components/ui'

export function ResultsPage() {
  const { sessionId, assessmentId } = useParams({ from: '/results/$sessionId/$assessmentId' })

  const [result, setResult] = useState<Result | null>(null)
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
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

  if (!result.isPaid) {
    return <PaymentScreen result={result} sessionId={sessionId} assessmentId={assessmentId} onPaymentSuccess={() => window.location.reload()} />
  }

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true)
      setDownloadProgress(0)

      // Start fake progress interval
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) return prev // Stop at 90% until actually finished
          return Math.min(prev + Math.floor(Math.random() * 15) + 5, 90)
        })
      }, 500)

      const element = document.getElementById('report-content')
      if (!element) {
        clearInterval(progressInterval)
        setDownloading(false)
        return
      }

      // Allow UI to paint modal before starting hard work (html2canvas is synchronous-heavy)
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

      clearInterval(progressInterval)
      setDownloadProgress(100)

      // Delay a tiny bit so user sees 100%
      setTimeout(() => {
        pdf.save(`MyKite-BaoCao-${result.assessmentType}.pdf`)
        setDownloading(false)
      }, 400)

    } catch (err) {
      alert('Có lỗi xảy ra khi tải báo cáo, vui lòng thử lại sau.')
      console.error(err)
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

          <Card className="p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-ink-900">Bạn muốn làm gì tiếp theo?</h2>
                <p className="mt-2 text-sm leading-6 text-ink-600">
                  Bạn có thể làm thêm bài còn lại để bổ sung góc nhìn, hoặc tải file báo cáo này về (Ctrl+P / Command+P) để in hoặc lưu thành PDF.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row shrink-0">
                <ButtonLink to="/assessments" variant="secondary" className="w-full sm:w-auto whitespace-nowrap">
                  Làm bài khác
                </ButtonLink>
                <Button onClick={handleDownloadPDF} disabled={downloading} className="w-full sm:w-auto whitespace-nowrap">
                  <PrintIcon className="mr-2 h-5 w-5" />
                  {downloading ? 'Đang tạo PDF...' : 'Tải kết quả'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </PageContainer>

      {/* Download Progress Modal */}
      {downloading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-[24px] bg-white p-8 shadow-2xl animate-fade-in-up text-center mx-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-6">
              <PrintIcon className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-ink-900">Đang chuẩn bị báo cáo</h3>
            <p className="mt-2 text-sm text-ink-500">
              Vui lòng đợi vài giây để hệ thống tổng hợp dữ liệu thành file PDF chất lượng cao.
            </p>

            <div className="mt-8">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                <span>Tiến trình tải</span>
                <span className="text-primary-600 font-extrabold">{downloadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-300 ease-out"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
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
    <div className="pb-20 pt-10 sm:pt-12 min-h-screen">
      <PageContainer className="max-w-3xl">
        <div className="text-center animate-fade-in-up">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-400 to-primary-700 text-white shadow-xl">
            <CheckCircleIcon className="h-10 w-10" />
          </div>

          <h1 className="mt-8 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Tuyệt vời! Chúng tôi đã phân tích xong Dữ liệu của bạn 🚀
          </h1>
          <p className="mt-4 text-lg leading-8 text-ink-600 max-w-2xl mx-auto">
            Kết quả bài trắc nghiệm <strong className="text-ink-900">{result.assessmentNameVi}</strong> đã sẵn sàng. Hãy mở khóa để khám phá bức tranh toàn cảnh về bản thân mình!
          </p>
        </div>

        <Card className="mt-12 overflow-hidden border-primary-200 bg-gradient-to-br from-white to-primary-50 p-8 sm:p-10 shadow-lg animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex flex-col items-center justify-center text-center">
            <Pill className="bg-primary-100 text-primary-800 font-bold mb-4 uppercase tracking-widest text-xs">Mở khóa Kết Quả</Pill>

            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-bold text-ink-400 line-through decoration-ink-300">
                {originalPrice}đ
              </span>
              <span className="text-5xl font-extrabold text-primary-700">
                {finalPrice}đ
              </span>
            </div>

            <p className="mt-6 text-base font-semibold text-ink-900">
              Nhận ngay báo cáo trọn đời chỉ với 1 lần mở khóa:
            </p>
            <ul className="mt-4 mb-2 flex flex-col gap-3 text-left text-sm text-ink-700 bg-white/50 rounded-2xl p-5 border border-ink-100 max-w-sm w-full mx-auto shadow-sm">
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-mint-500" />
                <span>Xem bản phân tích <strong>đầy đủ và đa chiều</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-mint-500" />
                <span>Nhận gợi ý <strong>lộ trình và ngành nghề</strong> sát thực tế</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-mint-500" />
                <span>Tải &amp; lưu file về máy <strong>thuận tiện tư vấn</strong></span>
              </li>
            </ul>

            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-8 h-14 px-12 text-lg font-bold shadow-soft transition-transform hover:scale-105"
            >
              {loading ? 'Đang khởi tạo...' : 'Thanh toán ngay'}
              {!loading && <ArrowRightIcon className="ml-2 h-5 w-5" />}
            </Button>

            <div className="mt-6 text-xs text-ink-400 flex items-center gap-2">
              <span>Bảo mật thanh toán qua SePay</span>
            </div>
          </div>
        </Card>
      </PageContainer>
    </div>
  )
}

