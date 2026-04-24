import type { ComponentProps, HTMLAttributes, ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8', className)} {...props} />
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}) {
  const alignment = align === 'center' ? 'text-center mx-auto' : ''

  return (
    <div className={cx('max-w-3xl', alignment)}>
      {eyebrow ? <p className="mb-3 font-label text-xs font-semibold uppercase tracking-[0.24em] text-ink-600">{eyebrow}</p> : null}
      <h2 className="font-display text-4xl font-extrabold leading-tight tracking-wide text-ink-900 sm:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-ink-600 sm:text-lg">{description}</p> : null}
    </div>
  )
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'ink-frame bg-paper-50 transition-all duration-300',
        className
      )}
      {...props}
    />
  )
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-md border-2 border-ink-300 bg-paper-200 px-3 py-1 font-label text-xs font-semibold uppercase tracking-wider text-ink-700',
        className
      )}
    >
      {children}
    </span>
  )
}

export function Button({
  children,
  className,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}) {
  return (
    <button
      className={cx(
        'ink-button inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 font-label text-base font-bold uppercase tracking-wide transition-all duration-200 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-ink-900 text-paper-50 hover:bg-ink-800',
        variant === 'secondary' && 'bg-paper-50 text-ink-900 hover:bg-paper-200',
        variant === 'ghost' && 'border-none bg-transparent text-ink-700 shadow-none hover:bg-paper-200',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function ButtonLink({
  children,
  className,
  variant = 'primary',
  ...props
}: ComponentProps<typeof Link> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}) {
  return (
    <Link
      className={cx(
        'ink-button inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 font-label text-base font-bold uppercase tracking-wide transition-all duration-200 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none',
        variant === 'primary' && 'bg-ink-900 text-paper-50 hover:bg-ink-800',
        variant === 'secondary' && 'bg-paper-50 text-ink-900 hover:bg-paper-200',
        variant === 'ghost' && 'border-none bg-transparent text-ink-700 shadow-none hover:bg-paper-200',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-ink-200">
      <div
        className="h-full rounded-full bg-ink-900 transition-all duration-300"
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  )
}

export function LoadingState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-ink-300 border-t-ink-900" />
        <h2 className="mt-6 text-xl font-semibold text-ink-900">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-ink-600">{description}</p> : null}
      </Card>
    </div>
  )
}

export function ErrorState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-paper-200 text-ink-900">
          <span className="text-2xl font-semibold">!</span>
        </div>
        <h2 className="mt-6 text-xl font-semibold text-ink-900">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-ink-600">{description}</p> : null}
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
      </Card>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-8 text-center">
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-600">{description}</p>
    </Card>
  )
}
