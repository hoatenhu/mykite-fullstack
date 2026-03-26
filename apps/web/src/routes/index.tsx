import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Khám phá Tiềm năng
            <br />
            <span className="text-primary-200">Tìm nghề Phù hợp</span>
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Trắc nghiệm hướng nghiệp dựa trên Holland RIASEC và Big Five OCEAN,
            giúp bạn hiểu rõ bản thân và định hướng nghề nghiệp trong kỷ nguyên AI
          </p>
          <Link
            to="/assessments"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-50 transition-colors shadow-lg"
          >
            Bắt đầu Trắc nghiệm
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn MyKite?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎯"
              title="Khoa học & Chuẩn hóa"
              description="Dựa trên các mô hình tâm lý học được công nhận quốc tế: Holland RIASEC và Big Five OCEAN"
            />
            <FeatureCard
              icon="🇻🇳"
              title="Bản địa hóa"
              description="Câu hỏi được thiết kế phù hợp với ngữ cảnh và văn hóa học sinh Việt Nam"
            />
            <FeatureCard
              icon="🤖"
              title="Hướng tới AI"
              description="Tích hợp xu hướng nghề nghiệp trong kỷ nguyên AI và kinh tế số"
            />
          </div>
        </div>
      </section>

      {/* Assessments Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Bộ Trắc nghiệm</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <AssessmentCard
              type="holland"
              title="Holland RIASEC"
              description="Khám phá 6 nhóm sở thích nghề nghiệp: Thực tế, Nghiên cứu, Nghệ thuật, Xã hội, Doanh nghiệp, Quy củ"
              questions={48}
              time={10}
            />
            <AssessmentCard
              type="bigfive"
              title="Big Five OCEAN"
              description="Phân tích 5 khía cạnh tính cách: Cởi mở, Tận tâm, Hướng ngoại, Dễ chịu, Nhạy cảm"
              questions={100}
              time={15}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng khám phá bản thân?</h2>
          <p className="text-primary-100 mb-8">
            Chỉ mất 10-15 phút để hoàn thành trắc nghiệm và nhận kết quả chi tiết
          </p>
          <Link
            to="/assessments"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-full font-semibold hover:bg-primary-50 transition-colors"
          >
            Làm Trắc nghiệm Ngay
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center p-6">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function AssessmentCard({
  type,
  title,
  description,
  questions,
  time,
}: {
  type: 'holland' | 'bigfive'
  title: string
  description: string
  questions: number
  time: number
}) {
  const colors = {
    holland: 'from-blue-500 to-cyan-500',
    bigfive: 'from-purple-500 to-pink-500',
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className={`h-2 bg-gradient-to-r ${colors[type]}`} />
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {questions} câu hỏi
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ~{time} phút
          </span>
        </div>
      </div>
    </div>
  )
}
