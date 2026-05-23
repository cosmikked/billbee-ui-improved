import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  /** Strip default var(--pad-card) padding — useful for full-bleed table cards */
  noPadding?: boolean
  /** Add hover border lift — use for interactive/clickable cards */
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', noPadding = false, hover = false, onClick }: CardProps) {
  return (
    <div
      className={[
        'bg-surface border border-border rounded-card',
        hover ? 'transition-ui hover:border-border-strong' : '',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
      style={noPadding ? undefined : { padding: 'var(--pad-card)' }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

/** Reusable card header: title + optional subtitle, flex row with right slot */
interface CardHeadProps {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
}

export function CardHead({ title, subtitle, actions, className = '' }: CardHeadProps) {
  return (
    <div className={`flex items-start justify-between gap-3 mb-4 flex-wrap ${className}`}>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-[16px] font-semibold text-ink tracking-[-0.01em]">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[12.5px] text-ink-3 mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-[10px] flex-shrink-0">{actions}</div>
      )}
    </div>
  )
}
