import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { AssessmentCard } from '@/components/AssessmentCard'
import { api, type Assessment } from '@/lib/api'
import { ButtonLink, PageContainer } from '@/components/ui'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])

  useEffect(() => {
    api.getAssessments().then(setAssessments).catch(() => setAssessments([]))
  }, [])

  const featuredAssessments = useMemo(
    () => assessments.slice().sort((a, b) => Number(a.type !== 'holland') - Number(b.type !== 'holland')),
    [assessments]
  )

  const hollandAssessment = featuredAssessments.find((assessment) => assessment.type === 'holland')

  return (
    <div className="relative pb-20 pt-10 sm:pt-14">
      <PageContainer className="max-w-7xl">
        <section className="rounded-[32px] border border-ink-300 bg-paper-50/98 px-5 pb-10 pt-10 shadow-[0_14px_32px_rgba(16,16,15,0.06)] sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-label text-xs font-semibold uppercase tracking-[0.28em] text-ink-500">Self discovery for career fit</p>
            <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-ink-900 sm:text-5xl lg:text-[4rem]">
              Chọn một bài trắc nghiệm và bắt đầu hiểu mình rõ hơn.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-ink-600 sm:text-lg">
              Bắt đầu với Holland nếu bạn đang phân vân nghề phù hợp. Chọn Big Five nếu bạn muốn hiểu sâu hơn về tính cách và cách mình vận hành.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {hollandAssessment ? (
                <Link
                  to="/quiz/$assessmentId"
                  params={{ assessmentId: hollandAssessment.id }}
                  className="ink-button inline-flex min-h-11 min-w-[220px] items-center justify-center gap-2 px-5 py-3 font-label text-base font-bold uppercase tracking-wide transition-all duration-200 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none bg-ink-900 text-paper-50 hover:bg-ink-800"
                >
                  Bắt đầu với Holland
                </Link>
              ) : (
                <ButtonLink to="/assessments" className="min-w-[220px]">
                  Bắt đầu với Holland
                </ButtonLink>
              )}
              <ButtonLink to="/assessments" variant="secondary" className="min-w-[220px] border-ink-300 bg-paper-200/90 text-ink-900 shadow-none">
                Xem tất cả bài trắc nghiệm
              </ButtonLink>
            </div>
          </div>

          <div className="mt-12 border-t border-ink-200 pt-8">
            <p className="font-label text-[11px] font-semibold uppercase tracking-[0.26em] text-ink-500">Chọn lối bắt đầu</p>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {featuredAssessments.map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} compact />
              ))}
            </div>
          </div>
        </section>

      </PageContainer>
    </div>
  )
}
