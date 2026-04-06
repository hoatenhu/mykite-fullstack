import type { ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AssessmentCard } from '@/components/AssessmentCard'
import { BrandLogo } from '@/components/BrandLogo'
import { ArrowRightIcon, HeartHandshakeIcon, SparkIcon } from '@/components/icons'
import { ButtonLink, Card, PageContainer, Pill, SectionTitle } from '@/components/ui'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const featuredAssessments = [
  {
    id: 'holland',
    type: 'holland' as const,
    nameVi: 'Holland RIASEC',
    nameEn: 'Holland RIASEC',
    descriptionVi:
      'Khám phá 6 nhóm sở thích nghề nghiệp để biết bạn hợp kiểu công việc, môi trường học tập và lộ trình phát triển nào.',
    descriptionEn: null,
    estimatedMinutes: 10,
    questionCount: 48,
  },
  {
    id: 'bigfive',
    type: 'bigfive' as const,
    nameVi: 'Big Five OCEAN',
    nameEn: 'Big Five OCEAN',
    descriptionVi:
      'Đo 5 nhóm tính cách cốt lõi để hiểu cách bạn suy nghĩ, học tập, hợp tác và phản ứng với áp lực.',
    descriptionEn: null,
    estimatedMinutes: 15,
    questionCount: 100,
  },
]

function HomePage() {
  return (
    <div className="pb-20">
      <section className="overflow-hidden pt-8 sm:pt-12">
        <PageContainer>
          <Card className="relative overflow-hidden border-primary-100 bg-gradient-to-br from-white via-primary-50 to-cream-50 p-8 sm:p-12 lg:p-14">
            <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary-100/60 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-cream-100/80 blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <Pill className="border-primary-200 bg-white/80">Trắc nghiệm hướng nghiệp cho học sinh và người trẻ</Pill>
                <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
                  Hiểu mình rõ hơn để chọn ngành và nghề bớt mơ hồ.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-600">
                  MyKite kết hợp Holland RIASEC và Big Five để biến trắc nghiệm thành một hành trình khám phá bản thân gần gũi, dễ hiểu và đủ tin cậy để bạn hành động tiếp.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink to="/assessments" className="w-full sm:w-auto">
                    Bắt đầu trắc nghiệm
                    <ArrowRightIcon />
                  </ButtonLink>
                  <ButtonLink to="/assessments" variant="secondary" className="w-full sm:w-auto">
                    Xem 2 bài đánh giá
                  </ButtonLink>
                </div>

                <div className="mt-8 grid gap-3 text-sm text-ink-600 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/80 px-4 py-3">
                    <div className="font-semibold text-ink-900">10-15 phút</div>
                    <div className="mt-1">Hoàn thành nhanh, không quá tải.</div>
                  </div>
                  <div className="rounded-2xl bg-white/80 px-4 py-3">
                    <div className="font-semibold text-ink-900">2 góc nhìn</div>
                    <div className="mt-1">Sở thích nghề nghiệp và tính cách.</div>
                  </div>
                  <div className="rounded-2xl bg-white/80 px-4 py-3">
                    <div className="font-semibold text-ink-900">Dễ hiểu</div>
                    <div className="mt-1">Kết quả viết bằng ngôn ngữ gần gũi.</div>
                  </div>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md">
                <div className="absolute inset-6 rounded-[32px] bg-primary-200/70 blur-3xl" />
                <Card className="relative border-primary-100 bg-white/90 p-6">
                  <BrandLogo className="mx-auto h-16 w-auto" />
                  <div className="mt-6 rounded-[28px] bg-primary-700 px-5 py-6 text-white shadow-soft">
                    <p className="text-sm uppercase tracking-[0.24em] text-primary-100">MyKite Mood</p>
                    <p className="mt-3 text-2xl font-medium leading-snug">
                      Trẻ trung, gần gũi, đủ nghiêm túc để bạn tin vào kết quả.
                    </p>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-primary-50 p-4">
                      <p className="text-sm font-medium text-primary-700">Màu thương hiệu</p>
                      <div className="mt-3 flex gap-2">
                        <span className="h-8 w-8 rounded-full bg-primary-700" />
                        <span className="h-8 w-8 rounded-full bg-primary-400" />
                        <span className="h-8 w-8 rounded-full bg-cream-200" />
                      </div>
                    </div>
                    <div className="rounded-2xl bg-ink-900 p-4 text-white">
                      <p className="text-sm font-medium text-primary-100">Giọng điệu</p>
                      <p className="mt-2 text-sm leading-6 text-white/80">Nhẹ nhàng, rõ ràng, không phô trương.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </PageContainer>
      </section>

      <section className="pt-20">
        <PageContainer>
          <SectionTitle
            eyebrow="Tại sao là MyKite"
            title="Một trải nghiệm đủ thân thiện để bắt đầu, đủ chỉn chu để bạn muốn tin tưởng."
            description="Thay vì biến trắc nghiệm thành một biểu mẫu khô khan, MyKite làm cho việc hiểu bản thân trở nên nhẹ hơn, gần gũi hơn và dễ chuyển thành hành động hơn."
            align="center"
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <FeatureCard
              icon={<SparkIcon className="h-6 w-6" />}
              title="Diễn giải dễ hiểu"
              description="Kết quả viết theo ngôn ngữ gần gũi để học sinh, phụ huynh và cố vấn đều có thể đọc được ngay."
            />
            <FeatureCard
              icon={<HeartHandshakeIcon className="h-6 w-6" />}
              title="Thân thiện nhưng không hời hợt"
              description="Visual trẻ trung, mềm mại, nhưng vẫn giữ đủ độ tin cậy cho một công cụ định hướng học tập và nghề nghiệp."
            />
            <FeatureCard
              icon={<ArrowRightIcon className="h-6 w-6" />}
              title="Biết bước tiếp theo"
              description="Sau kết quả, bạn có thể tiếp tục nhìn vào nhóm nghề gợi ý, điểm mạnh nổi bật và hướng phát triển phù hợp."
            />
          </div>
        </PageContainer>
      </section>

      <section className="pt-20">
        <PageContainer>
          <SectionTitle
            eyebrow="Hai góc nhìn"
            title="Bắt đầu với một bài, hoặc làm cả hai để có bức tranh toàn diện hơn."
            description="Holland giúp bạn nhìn thấy kiểu nghề phù hợp. Big Five giúp bạn hiểu cách mình học, hợp tác và xử lý áp lực."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {featuredAssessments.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="pt-20">
        <PageContainer>
          <Card className="border-primary-100 bg-primary-700 p-8 text-white sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.2em] text-primary-100">Sẵn sàng bắt đầu</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Dành 10 phút hôm nay để bớt mơ hồ hơn cho quyết định lớn ngày mai.
                </h2>
                <p className="mt-4 text-base leading-7 text-primary-100">
                  Bạn không cần trả lời hoàn hảo. Chỉ cần trả lời thật với mình, MyKite sẽ giúp bạn nhìn ra một hướng đi rõ hơn.
                </p>
              </div>
              <ButtonLink to="/assessments" variant="secondary" className="border-white/20 bg-white text-primary-700 hover:bg-primary-50">
                Vào khu trắc nghiệm
                <ArrowRightIcon />
              </ButtonLink>
            </div>
          </Card>
        </PageContainer>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="p-6 sm:p-7">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">{icon}</div>
      <h3 className="mt-5 text-xl font-semibold text-ink-900">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-ink-600">{description}</p>
    </Card>
  )
}
