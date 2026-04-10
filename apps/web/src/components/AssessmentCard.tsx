import { Link } from '@tanstack/react-router'
import type { Assessment } from '@/lib/api'
import { BrainIcon, ClipboardIcon, ClockIcon } from '@/components/icons'
import { ButtonLink, Card, Pill } from '@/components/ui'

const assessmentVisual = {
  holland: {
    icon: ClipboardIcon,
    accent: 'from-primary-600/10 via-primary-400/5 to-white',
    border: 'border-primary-100',
    iconBg: 'bg-primary-700 text-white',
    summary: 'Tập trung vào xu hướng nghề nghiệp, môi trường học tập và kiểu công việc hợp với bạn.',
  },
  bigfive: {
    icon: BrainIcon,
    accent: 'from-indigo-600/10 via-indigo-400/5 to-white',
    border: 'border-indigo-100',
    iconBg: 'bg-indigo-900 text-white',
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
    <Card className={`group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-card border-2 ${config.border}`}>
      <div className={`absolute right-0 top-0 h-32 w-full bg-gradient-to-br transition-opacity duration-500 group-hover:opacity-80 ${config.accent}`} />
      <div className="relative p-7 sm:p-9 text-left">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${config.iconBg} shadow-soft transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-primary-300/40`}>
            <Icon className="h-8 w-8" />
          </div>
          <Pill className={assessment.type === 'holland' ? 'bg-primary-50 text-primary-700 border-primary-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}>
            {assessment.type === 'holland' ? 'Hướng nghiệp' : 'Tính cách'}
          </Pill>
        </div>

        <h3 className="mt-6 text-2xl font-bold tracking-tight text-ink-900 group-hover:text-primary-700 transition-colors">{assessment.nameVi}</h3>
        <p className="mt-3 text-sm leading-7 text-ink-600">{assessment.descriptionVi}</p>
        {!compact ? <p className="mt-3 text-sm leading-7 text-ink-500 font-medium italic">{config.summary}</p> : null}

        <div className="mt-7 flex flex-wrap gap-3 text-sm text-ink-600 font-medium">
          <div className="inline-flex items-center gap-2 rounded-xl bg-ink-50 px-3.5 py-2">
            <ClipboardIcon className="h-4 w-4 text-primary-600" />
            <span>{assessment.questionCount} câu hỏi</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-ink-50 px-3.5 py-2">
            <ClockIcon className="h-4 w-4 text-primary-600" />
            <span>Khoảng {assessment.estimatedMinutes ?? 10} phút</span>
          </div>
        </div>

        <Link
          to="/quiz/$assessmentId"
          params={{ assessmentId: assessment.id }}
          className={`mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 active:scale-95 shadow-soft hover:shadow-primary-300/30 sm:w-auto ${assessment.type === 'holland'
              ? 'bg-primary-700 text-white hover:bg-primary-800'
              : 'bg-indigo-900 text-white hover:bg-indigo-950'
            }`}
        >
          Bắt đầu làm bài
        </Link>
      </div>
    </Card>
  )
}
