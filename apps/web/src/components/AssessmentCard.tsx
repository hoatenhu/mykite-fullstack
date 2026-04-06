import { Link } from '@tanstack/react-router'
import type { Assessment } from '@/lib/api'
import { BrainIcon, ClipboardIcon, ClockIcon } from '@/components/icons'
import { Card, Pill } from '@/components/ui'

const assessmentVisual = {
  holland: {
    icon: ClipboardIcon,
    accent: 'from-primary-200 via-cream-100 to-white',
    iconBg: 'bg-primary-700 text-white',
    summary: 'Tập trung vào xu hướng nghề nghiệp, môi trường học tập và kiểu công việc hợp với bạn.',
  },
  bigfive: {
    icon: BrainIcon,
    accent: 'from-cream-100 via-primary-100 to-white',
    iconBg: 'bg-ink-900 text-white',
    summary: 'Đào sâu tính cách, cách bạn học, phối hợp với người khác và phản ứng với áp lực.',
  },
}

export function AssessmentCard({
  assessment,
  compact = false,
}: {
  assessment: Assessment
  compact?: boolean
}) {
  const config = assessmentVisual[assessment.type]
  const Icon = config.icon

  return (
    <Card className="group overflow-hidden">
      <div className={`h-24 bg-gradient-to-r ${config.accent}`} />
      <div className="-mt-8 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-[20px] ${config.iconBg} shadow-soft`}>
            <Icon className="h-7 w-7" />
          </div>
          <Pill>{assessment.type === 'holland' ? 'Hướng nghiệp' : 'Tính cách'}</Pill>
        </div>

        <h3 className="mt-6 text-2xl font-semibold tracking-tight text-ink-900">{assessment.nameVi}</h3>
        <p className="mt-3 text-sm leading-7 text-ink-600">{assessment.descriptionVi}</p>
        {!compact ? <p className="mt-3 text-sm leading-7 text-ink-500">{config.summary}</p> : null}

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-ink-600">
          <div className="inline-flex items-center gap-2 rounded-full bg-ink-50 px-3 py-2">
            <ClipboardIcon className="h-4 w-4" />
            <span>{assessment.questionCount} câu hỏi</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-ink-50 px-3 py-2">
            <ClockIcon className="h-4 w-4" />
            <span>Khoảng {assessment.estimatedMinutes ?? 10} phút</span>
          </div>
        </div>

        <Link
          to="/quiz/$assessmentId"
          params={{ assessmentId: assessment.id }}
          className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary-700 px-5 py-3 text-sm font-medium text-white shadow-soft transition duration-200 hover:bg-primary-800 sm:w-auto"
        >
          Bắt đầu làm bài
        </Link>
      </div>
    </Card>
  )
}
