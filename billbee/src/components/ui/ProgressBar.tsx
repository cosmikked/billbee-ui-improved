export type ProgressVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger'

const FILL: Record<ProgressVariant, string> = {
  default: 'bg-ink-3',
  accent:  'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger:  'bg-danger',
}

interface ProgressBarProps {
  /** 0–100 */
  value: number
  variant?: ProgressVariant
  className?: string
}

export function ProgressBar({ value, variant = 'default', className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className={`w-full h-1.5 rounded-pill bg-surface-2 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-pill transition-[width] duration-300 ease-out ${FILL[variant]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
