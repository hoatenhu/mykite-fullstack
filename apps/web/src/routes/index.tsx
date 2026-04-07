import type { ReactNode } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { AssessmentCard } from '@/components/AssessmentCard'
import { BrandLogo } from '@/components/BrandLogo'
import { ArrowRightIcon, BrainIcon, HeartHandshakeIcon, SparkIcon } from '@/components/icons'
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
                <Pill className="animate-fade-in-up border-primary-200 bg-white/80">Trắc nghiệm hướng nghiệp cho học sinh và người trẻ</Pill>
                <h1 className="animate-fade-in-up mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
                  Hiểu mình rõ hơn để chọn ngành và nghề bớt mơ hồ.
                </h1>
                <p className="animate-fade-in-up mt-6 max-w-2xl text-lg leading-8 text-ink-600 [animation-delay:200ms]">
                  MyKite kết hợp Holland RIASEC và Big Five để biến trắc nghiệm thành một hành trình khám phá bản thân gần gũi, dễ hiểu và đủ tin cậy để bạn hành động tiếp.
                </p>

                <div className="animate-fade-in-up mt-8 flex flex-col gap-3 sm:flex-row [animation-delay:400ms]">
                  <ButtonLink to="/assessments" className="w-full sm:w-auto">
                    Bắt đầu trắc nghiệm
                    <ArrowRightIcon />
                  </ButtonLink>
                  <ButtonLink to="/assessments" variant="secondary" className="w-full sm:w-auto">
                    Xem 2 bài đánh giá
                  </ButtonLink>
                </div>

                <div className="animate-fade-in-up mt-8 grid gap-3 text-sm text-ink-600 sm:grid-cols-3 [animation-delay:600ms]">
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

              <div className="animate-float relative mx-auto w-full max-w-sm">
                <div className="absolute inset-6 rounded-[32px] bg-primary-200/70 blur-3xl opacity-50" />
                <Card className="relative border-primary-100 bg-white/90 p-8 shadow-card backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-700 text-white shadow-soft">
                      <BrainIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-primary-600">Kết quả mẫu</p>
                      <h3 className="text-xl font-bold text-ink-900">Nhóm Nghiên cứu</h3>
                    </div>
                  </div>

                  <div className="mt-8 space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-ink-600">Tư duy Logic</span>
                        <span className="font-extrabold text-primary-700">85%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-primary-100/50">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700" style={{ width: '85%' }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-ink-600">Khả năng Phân tích</span>
                        <span className="font-extrabold text-primary-700">92%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-primary-100/50">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600" style={{ width: '92%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 rounded-2xl border border-primary-100 bg-primary-50/30 p-5">
                    <p className="text-sm font-bold text-ink-800">Gợi ý nghề nghiệp:</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Pill className="border-primary-200 bg-white text-primary-700 shadow-sm">Lập trình viên</Pill>
                      <Pill className="border-primary-200 bg-white text-primary-700 shadow-sm">Kỹ thuật viên</Pill>
                      <Pill className="border-primary-200 bg-white text-primary-700 shadow-sm">Nhà toán học</Pill>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-center gap-2 grayscale-0">
                    <BrandLogo className="h-5 w-auto" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-300">Discovery Card</span>
                  </div>
                </Card>

                {/* Decorative floating elements */}
                <div className="absolute -right-4 -top-4 flex h-10 w-10 animate-bounce items-center justify-center rounded-full bg-cream-100 text-cream-600 shadow-soft">
                  <SparkIcon className="h-5 w-5" />
                </div>
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

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
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

      <section className="relative overflow-hidden py-24">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_50%,rgba(220,226,244,0.4)_0%,rgba(247,247,251,0)_100%)]" />
        <div className="absolute -left-20 top-40 -z-10 h-72 w-72 rounded-full bg-primary-100/30 blur-3xl" />
        <div className="absolute -right-20 bottom-20 -z-10 h-72 w-72 rounded-full bg-cream-100/40 blur-3xl" />

        <PageContainer>
          <SectionTitle
            eyebrow="Hai góc nhìn"
            title="Bắt đầu với một bài, hoặc làm cả hai để có bức tranh toàn diện hơn."
            description="Holland giúp bạn nhìn thấy kiểu nghề phù hợp. Big Five giúp bạn hiểu cách mình học, hợp tác và xử lý áp lực."
            align="center"
          />

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {featuredAssessments.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="pt-20">
        <PageContainer>
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary-800 via-primary-700 to-indigo-900 p-8 shadow-card sm:p-12 lg:p-14">
            <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary-600/20 blur-3xl" />
            <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-cream-400/10 blur-2xl" />

            <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-100 backdrop-blur-md">
                  Sẵn sàng bắt đầu
                </span>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Dành 10 phút hôm nay để bớt mơ hồ hơn.
                </h2>
                <p className="mt-6 text-lg leading-8 text-primary-50">
                  Bạn không cần trả lời hoàn hảo. Chỉ cần trả lời thật với mình, MyKite sẽ giúp bạn nhìn ra một hướng đi rõ hơn.
                </p>
              </div>
              <div className="shrink-0">
                <ButtonLink to="/assessments" variant="secondary" className="h-14 border-none bg-white px-8 text-base font-bold text-primary-700 shadow-soft hover:bg-white/95">
                  Vào khu trắc nghiệm
                  <ArrowRightIcon className="h-5 w-5" />
                </ButtonLink>
              </div>
            </div>
          </div>
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
    <Card className="group relative p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-card lg:p-9">
      <div className="absolute right-6 top-6 h-1 w-0 bg-primary-600 transition-all duration-500 group-hover:w-12" />
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 transition-all duration-300 group-hover:bg-primary-700 group-hover:text-white group-hover:shadow-soft">
        {icon}
      </div>
      <h3 className="mt-6 text-xl font-bold text-ink-900 transition-colors duration-300 group-hover:text-primary-700">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-ink-600">
        {description}
      </p>
    </Card>
  )
}
