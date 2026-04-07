import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { AssessmentCard } from '@/components/AssessmentCard'
import { ArrowRightIcon } from '@/components/icons'
import { api, type Assessment } from '@/lib/api'
import {
  Button,
  ButtonLink,
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
          eyebrow="Khu trắc nghiệm"
          title="Chọn bài phù hợp với câu hỏi bạn đang có ở hiện tại."
          description="Nếu bạn đang phân vân nghề nào hợp với mình, hãy bắt đầu với Holland. Nếu bạn muốn hiểu sâu hơn cách mình học, phản ứng và hợp tác với người khác, hãy làm thêm Big Five."
        />

        <div className="mt-10 grid gap-4 rounded-[28px] border border-primary-100 bg-white/70 p-5 text-sm text-ink-600 shadow-card sm:grid-cols-3">
          <InfoPoint title="Làm một bài trước" description="Không cần làm cả hai ngay. Mỗi bài đều cho bạn một góc nhìn có ích." />
          <InfoPoint title="Kết quả dễ đọc" description="Không dùng thuật ngữ nặng. Kết quả tập trung vào điều bạn có thể hiểu và ứng dụng." />
          <InfoPoint title="Làm liền mạch" description="Mỗi bài mất khoảng 10 đến 15 phút, phù hợp cho một lần ngồi tập trung ngắn." />
        </div>

        {assessments.length === 0 ? (
          <div className="mt-10">
            <EmptyState title="Chưa có bài trắc nghiệm nào" description="Khi dữ liệu được cập nhật, MyKite sẽ hiển thị danh sách bài đánh giá tại đây." />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {assessments.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </div>
        )}

        <div className="mt-12 rounded-[28px] bg-primary-700 p-6 text-white shadow-soft sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight">Muốn nhìn bức tranh toàn diện hơn?</h2>
              <p className="mt-3 text-sm leading-7 text-primary-100 sm:text-base">
                Sau khi hoàn thành một bài, bạn có thể quay lại làm bài còn lại để so sánh sở thích nghề nghiệp với đặc điểm tính cách của mình.
              </p>
            </div>
            <ButtonLink to="/" variant="secondary" className="border-white/20 bg-white text-primary-700 hover:bg-primary-50">
              Về trang chủ
              <ArrowRightIcon />
            </ButtonLink>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}

function InfoPoint({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl bg-ink-50 px-4 py-4">
      <p className="font-semibold text-ink-900">{title}</p>
      <p className="mt-2 leading-6 text-ink-600">{description}</p>
    </div>
  )
}
