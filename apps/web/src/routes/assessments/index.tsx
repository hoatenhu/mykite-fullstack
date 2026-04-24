import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { AssessmentCard } from '@/components/AssessmentCard'
import { api, type Assessment } from '@/lib/api'
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageContainer,
  SectionTitle,
} from '@/components/ui'

export const Route = createFileRoute('/assessments/')({
  component: AssessmentsPage,
})

function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAssessments = () => {
    setLoading(true)
    setError(null)

    api
      .getAssessments()
      .then(setAssessments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAssessments()
  }, [])

  if (loading) {
    return <LoadingState title="Đang chuẩn bị khu trắc nghiệm" description="MyKite đang tải danh sách bài đánh giá phù hợp cho bạn." />
  }

  if (error) {
    return (
      <ErrorState
        title="Chưa thể tải danh sách trắc nghiệm"
        description={error}
        action={<Button onClick={loadAssessments}>Thử lại</Button>}
      />
    )
  }

  return (
    <div className="pb-20 pt-10 sm:pt-14">
      <PageContainer>
        <SectionTitle
          eyebrow="Assessment studio"
          title="Chọn bài trắc nghiệm phù hợp nhất với điều bạn muốn hiểu ngay lúc này."
          description="Nếu bạn đang phân vân nghề phù hợp, bắt đầu với Holland. Nếu bạn muốn hiểu sâu cách mình học, hợp tác và phản ứng với áp lực, bắt đầu với Big Five."
        />

        <div className="mt-8 grid gap-4 text-sm text-ink-600 sm:grid-cols-3">
          <InfoPoint title="Mỗi bài 10 đến 15 phút" description="Một phiên tập trung ngắn, không quá tải." />
          <InfoPoint title="Bắt đầu với 1 bài" description="Không cần làm cả hai ngay ở lượt đầu tiên." />
          <InfoPoint title="Kết quả dễ đọc" description="Ngắn gọn, rõ ràng và đủ để ra quyết định tiếp theo." />
        </div>

        {assessments.length === 0 ? (
          <div className="mt-10">
            <EmptyState title="Chưa có bài trắc nghiệm nào" description="Khi dữ liệu được cập nhật, MyKite sẽ hiển thị danh sách bài đánh giá tại đây." />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {assessments.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} compact />
            ))}
          </div>
        )}

        <div className="mt-12 border-t border-ink-200 pt-6 text-sm leading-7 text-ink-600">
          Sau khi hoàn thành một bài, bạn luôn có thể quay lại làm bài còn lại để đối chiếu kết quả và có góc nhìn đầy đủ hơn.
        </div>
      </PageContainer>
    </div>
  )
}

function InfoPoint({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-1 py-2">
      <p className="font-label text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-700">{title}</p>
      <p className="mt-2 leading-6 text-ink-600">{description}</p>
    </div>
  )
}
