import { type ReactNode } from 'react'

export type CalloutVariant = 'accent' | 'info' | 'warning' | 'danger' | 'success'

const CALLOUT: Record<CalloutVariant, { wrap: string; iconBg: string }> = {
  accent:  { wrap: 'bg-accent-tint border-accent-soft',   iconBg: 'bg-accent' },
  info:    { wrap: 'bg-info-soft border-info-soft',       iconBg: 'bg-info' },
  warning: { wrap: 'bg-warning-soft border-warning-soft', iconBg: 'bg-warning' },
  danger:  { wrap: 'bg-danger-soft border-danger-soft',   iconBg: 'bg-danger' },
  success: { wrap: 'bg-success-soft border-success-soft', iconBg: 'bg-success' },
}

interface CalloutProps {
  /** 18×18 icon node, rendered on a tinted circular background */
  icon: ReactNode
  children: ReactNode
  /** Optional right-side action (e.g. a Button) */
  action?: ReactNode
  variant?: CalloutVariant
  className?: string
}

export function Callout({ icon, children, action, variant = 'accent', className = '' }: CalloutProps) {
  const { wrap, iconBg } = CALLOUT[variant]
  return (
    <div
      className={[
        'flex items-center gap-4 px-[18px] py-[14px] border rounded-[14px]',
        wrap,
        className,
      ].join(' ')}
    >
      <div
        className={`w-9 h-9 rounded-pill ${iconBg} flex items-center justify-center shrink-0 text-white`}
      >
        {icon}
      </div>
      <div className="flex-1 text-[14px] text-ink-2">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
