import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { api, type Assessment } from '@/lib/api'

export const Route = createFileRoute('/assessments/')({
  component: AssessmentsPage,
})

function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .getAssessments()
      .then(setAssessments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-500">Đang tải...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500">Lỗi: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-primary-600 hover:underline"
        >
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Chọn Bài Trắc nghiệm</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Mỗi bài trắc nghiệm sẽ giúp bạn hiểu rõ hơn về bản thân từ một góc độ khác nhau.
          Bạn có thể làm một hoặc cả hai bài để có kết quả toàn diện nhất.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {assessments.map((assessment) => (
          <AssessmentCard key={assessment.id} assessment={assessment} />
        ))}
      </div>

      {assessments.length === 0 && (
        <p className="text-center text-gray-500">Chưa có bài trắc nghiệm nào.</p>
      )}
    </div>
  )
}

function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const config = {
    holland: {
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50',
      icon: '🎯',
    },
    bigfive: {
      gradient: 'from-purple-500 to-pink-500',
      bgLight: 'bg-purple-50',
      icon: '🧠',
    },
  }

  const cfg = config[assessment.type]

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
      <div className={`h-2 bg-gradient-to-r ${cfg.gradient}`} />
      <div className="p-8">
        <div className={`w-16 h-16 ${cfg.bgLight} rounded-2xl flex items-center justify-center text-3xl mb-6`}>
          {cfg.icon}
        </div>
        
        <h2 className="text-2xl font-bold mb-3">{assessment.nameVi}</h2>
        <p className="text-gray-600 mb-6">{assessment.descriptionVi}</p>

        <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {assessment.questionCount} câu hỏi
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ~{assessment.estimatedMinutes} phút
          </span>
        </div>

        <Link
          to="/quiz/$assessmentId"
          params={{ assessmentId: assessment.id }}
          className={`block w-full text-center py-3 px-6 rounded-xl bg-gradient-to-r ${cfg.gradient} text-white font-semibold hover:opacity-90 transition-opacity`}
        >
          Bắt đầu Làm bài
        </Link>
      </div>
    </div>
  )
}
