import { type ReactNode } from 'react'

interface PageHeadProps {
  title: ReactNode
  subtitle?: ReactNode
  /** Right-side actions — typically Button components */
  actions?: ReactNode
  className?: string
}

export function PageHead({ title, subtitle, actions, className = '' }: PageHeadProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-5 flex-wrap ${className}`}>
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] leading-[1.1] text-ink mb-1">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[14px] text-ink-3 leading-[1.45]">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  )
}
