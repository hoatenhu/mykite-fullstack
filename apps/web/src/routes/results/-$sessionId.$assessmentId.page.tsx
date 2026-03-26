import { Link, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { api, type Result, type Career } from '@/lib/api'
import {
  HOLLAND_LABELS,
  HOLLAND_DESCRIPTIONS,
  BIGFIVE_LABELS,
  BIGFIVE_DESCRIPTIONS,
  type HollandDimension,
  type BigFiveDimension,
} from '@mykite/shared'
import { HollandChart } from '@/components/HollandChart'
import { BigFiveChart } from '@/components/BigFiveChart'

export function ResultsPage() {
  const { sessionId, assessmentId } = useParams({ from: '/results/$sessionId/$assessmentId' })

  const [result, setResult] = useState<Result | null>(null)
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resultData = await api.getResult(sessionId, assessmentId)
        setResult(resultData)

        if (resultData.assessmentType === 'holland' && resultData.resultCode) {
          const careerData = await api.getCareers(resultData.resultCode)
          setCareers(careerData.slice(0, 10))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sessionId, assessmentId])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-500">Đang phân tích kết quả...</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error ?? 'Không tìm thấy kết quả'}</p>
          <Link to="/assessments" className="mt-4 text-primary-600 hover:underline inline-block">
            Quay lại trang trắc nghiệm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Kết quả Trắc nghiệm</h1>
        <p className="text-gray-600">
          {result.assessmentType === 'holland'
            ? 'Holland RIASEC - Sở thích Nghề nghiệp'
            : 'Big Five OCEAN - Đặc điểm Tính cách'}
        </p>
      </div>

      {result.assessmentType === 'holland' ? (
        <HollandResults result={result} careers={careers} />
      ) : (
        <BigFiveResults result={result} />
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
        <Link
          to="/assessments"
          className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-center transition-colors"
        >
          Làm bài khác
        </Link>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          In kết quả
        </button>
      </div>
    </div>
  )
}

function HollandResults({ result, careers }: { result: Result; careers: Career[] }) {
  const scores = result.scores as Record<HollandDimension, number>
  const topThree = (result.topDimensions ?? []) as HollandDimension[]

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-white text-center">
        <p className="text-blue-100 mb-2">Mã Holland của bạn</p>
        <div className="text-6xl font-bold tracking-wider mb-4">{result.resultCode}</div>
        <p className="text-blue-100">{topThree.map((d) => HOLLAND_LABELS[d].vi).join(' - ')}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-6 text-center">Biểu đồ Lục giác Holland</h2>
        <HollandChart scores={scores} />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-6">3 Nhóm Sở thích Chính</h2>
        <div className="space-y-6">
          {topThree.map((dim, idx) => (
            <div key={dim} className="flex gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                  idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-amber-600'
                }`}
              >
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg">{HOLLAND_LABELS[dim].vi}</span>
                  <span className="text-gray-400">({dim})</span>
                  <span className="ml-auto text-primary-600 font-semibold">{scores[dim]}%</span>
                </div>
                <p className="text-gray-600 text-sm">{HOLLAND_DESCRIPTIONS[dim].vi}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {careers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-6">Nghề nghiệp Gợi ý</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {careers.map((career) => (
              <div
                key={career.id}
                className="p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{career.nameVi}</h3>
                    <p className="text-sm text-gray-500">{career.nameEn}</p>
                  </div>
                  {career.futureOutlook === 'high' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Xu hướng cao
                    </span>
                  )}
                </div>
                {career.matchScore > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Độ phù hợp</div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${Math.min(career.matchScore, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BigFiveResults({ result }: { result: Result }) {
  const scores = result.scores as Record<BigFiveDimension, number>

  const getLevel = (score: number): { label: string; color: string } => {
    if (score < 34) return { label: 'Thấp', color: 'text-blue-600' }
    if (score > 66) return { label: 'Cao', color: 'text-green-600' }
    return { label: 'Trung bình', color: 'text-yellow-600' }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-6 text-center">Biểu đồ Big Five</h2>
        <BigFiveChart scores={scores} />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-6">Chi tiết 5 Khía cạnh Tính cách</h2>
        <div className="space-y-6">
          {(Object.keys(scores) as BigFiveDimension[]).map((dim) => {
            const level = getLevel(scores[dim])
            return (
              <div key={dim}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold">{BIGFIVE_LABELS[dim].vi}</span>
                    <span className="text-gray-400 ml-2">({BIGFIVE_LABELS[dim].en})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${level.color}`}>{level.label}</span>
                    <span className="font-bold text-primary-600">{scores[dim]}%</span>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                    style={{ width: `${scores[dim]}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">{BIGFIVE_DESCRIPTIONS[dim].vi}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
