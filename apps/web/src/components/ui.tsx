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
      {eyebrow ? <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary-600">{eyebrow}</p> : null}
      <h2 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-ink-600 sm:text-lg">{description}</p> : null}
    </div>
  )
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'rounded-[28px] border border-white/70 bg-white/95 shadow-card backdrop-blur-sm transition-all duration-300',
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
        'inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700',
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
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 hover:-translate-y-0.5',
        variant === 'primary' && 'bg-primary-700 text-white shadow-soft hover:bg-primary-800 hover:shadow-primary-300/30',
        variant === 'secondary' && 'border border-primary-200 bg-white text-primary-700 hover:border-primary-300 hover:bg-primary-50',
        variant === 'ghost' && 'text-ink-600 hover:bg-white hover:text-ink-900',
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
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] hover:-translate-y-0.5',
        variant === 'primary' && 'bg-primary-700 text-white shadow-soft hover:bg-primary-800 hover:shadow-primary-300/30',
        variant === 'secondary' && 'border border-primary-200 bg-white text-primary-700 hover:border-primary-300 hover:bg-primary-50',
        variant === 'ghost' && 'text-ink-600 hover:bg-white hover:text-ink-900',
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
    <div className="h-2 overflow-hidden rounded-full bg-primary-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-300"
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  )
}

export function LoadingState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-700" />
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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-100 text-primary-700">
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
