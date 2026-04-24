import { Link } from '@tanstack/react-router'
import type { Assessment } from '@/lib/api'
import { BrainIcon, CheckCircleIcon, ClipboardIcon, ClockIcon } from '@/components/icons'
import { Card, Pill } from '@/components/ui'
import { BigFiveDoodle, HollandDoodle } from '@/components/VintageIllustrations'

const assessmentVisual = {
  holland: {
    icon: ClipboardIcon,
    iconBg: 'bg-paper-200 text-ink-900',
    badge: 'Hướng nghiệp',
    summary: 'Đối chiếu sở thích, môi trường và nhịp công việc để thấy nhóm nghề hợp với bạn.',
    prompt: 'Phù hợp khi bạn đang cần một điểm bắt đầu rõ ràng cho chọn ngành, chọn nghề.',
    outcomes: ['Những kiểu công việc dễ có động lực', 'Môi trường học tập và làm việc hợp hơn', 'Các nhóm nghề nên ưu tiên tìm hiểu'],
    cta: 'Khám phá nghề hợp',
  },
  bigfive: {
    icon: BrainIcon,
    iconBg: 'bg-paper-200 text-ink-900',
    badge: 'Tính cách',
    summary: 'Đọc khí chất cốt lõi, cách bạn hợp tác, học hỏi và giữ cân bằng dưới áp lực.',
    prompt: 'Phù hợp khi bạn muốn hiểu sâu cách mình vận hành trước khi ra quyết định lớn.',
    outcomes: ['Cách bạn tiếp nhận thay đổi và stress', 'Kiểu hợp tác và giao tiếp tự nhiên', 'Thế mạnh cần bồi dưỡng để phát triển lâu dài'],
    cta: 'Hiểu rõ tính cách',
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
  const outcomes = compact ? config.outcomes.slice(0, 2) : config.outcomes

  return (
    <Link
      to="/quiz/$assessmentId"
      params={{ assessmentId: assessment.id }}
      className="group block outline-none"
    >
      <Card className="relative overflow-hidden border border-ink-300 bg-paper-50/95 p-7 text-left shadow-[0_16px_36px_rgba(16,16,15,0.08)] transition-all duration-200 will-change-transform sm:p-8 group-hover:-translate-y-1 group-hover:shadow-[0_22px_42px_rgba(16,16,15,0.1)] group-active:translate-y-[1px]">
        <span className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent opacity-80" />

        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-ink-200 ${config.iconBg}`}>
              <Icon className="h-6 w-6" />
            </div>
            <Pill className="border-ink-200 bg-paper-200/70 text-ink-600">
              {config.badge}
            </Pill>
          </div>

          <h3 className="mt-6 text-4xl font-semibold leading-tight tracking-[-0.03em] text-ink-900 sm:text-5xl">{assessment.nameVi}</h3>
          <p className="mt-4 max-w-lg text-sm leading-7 text-ink-600">{config.summary}</p>

          <div className="mt-6 rounded-[24px] bg-paper-200/55 px-5 py-5">
            {assessment.type === 'holland' ? <HollandDoodle className="h-32 w-full" /> : <BigFiveDoodle className="h-32 w-full" />}
          </div>

          {!compact ? <p className="mt-3 text-sm leading-7 text-ink-500 italic">{config.prompt}</p> : null}

          <div className="mt-6 space-y-3">
            {outcomes.map((outcome) => (
              <div key={outcome} className="flex items-start gap-3 text-sm leading-6 text-ink-600">
                <CheckCircleIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ink-700" />
                <span>{outcome}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3 font-label text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-paper-200/85 px-3.5 py-2">
              <ClipboardIcon className="h-4 w-4 text-ink-700" />
              <span>{assessment.questionCount} câu hỏi</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-paper-200/85 px-3.5 py-2">
              <ClockIcon className="h-4 w-4 text-ink-700" />
              <span>Khoảng {assessment.estimatedMinutes ?? 10} phút</span>
            </div>
          </div>

          <span className="ink-button mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-ink-800 bg-ink-900 px-6 py-3 font-label text-sm font-bold uppercase tracking-[0.16em] text-paper-50 shadow-[3px_3px_0_rgba(10,10,9,0.92)] transition-all duration-200 group-hover:bg-ink-800 sm:w-auto">
            {config.cta}
          </span>
        </div>
      </Card>
    </Link>
  )
}
