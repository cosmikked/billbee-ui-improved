import { type ReactNode } from 'react'
import { X } from 'lucide-react'

export type BannerVariant = 'accent' | 'info' | 'warning' | 'danger' | 'success'

const BANNER: Record<BannerVariant, string> = {
  accent:  'bg-accent-tint border-accent-soft text-ink-2',
  info:    'bg-info-soft border-info-soft text-info',
  warning: 'bg-warning-soft border-warning-soft text-warning',
  danger:  'bg-danger-soft border-danger-soft text-danger',
  success: 'bg-success-soft border-success-soft text-success',
}

interface BannerProps {
  children: ReactNode
  variant?: BannerVariant
  /** When provided a dismiss × button is shown */
  onDismiss?: () => void
  className?: string
}

export function Banner({ children, variant = 'info', onDismiss, className = '' }: BannerProps) {
  return (
    <div
      className={[
        'flex items-center justify-between gap-4 px-4 py-2.5 border rounded-btn',
        'text-[13.5px] font-medium',
        BANNER[variant],
        className,
      ].join(' ')}
    >
      <span>{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="opacity-60 hover:opacity-100 transition-ui flex items-center shrink-0"
          aria-label="Dismiss"
        >
          <X size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}
