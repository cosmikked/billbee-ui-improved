import { type ReactNode } from 'react'

export type PillVariant = 'up' | 'down' | 'neutral' | 'accent' | 'info'

export const PILL_VARIANT: Record<PillVariant, string> = {
  up:      'bg-success-soft text-success',
  down:    'bg-danger-soft text-danger',
  neutral: 'bg-surface-2 text-ink-3',
  accent:  'bg-accent-soft text-accent-2',
  info:    'bg-info-soft text-info',
}

interface PillProps {
  children: ReactNode
  variant?: PillVariant
  className?: string
}

export function Pill({ children, variant = 'neutral', className = '' }: PillProps) {
  return (
    <span
      className={[
        'font-mono text-[11.5px] font-medium px-1.5 py-px rounded-xs',
        'inline-flex items-center',
        PILL_VARIANT[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
