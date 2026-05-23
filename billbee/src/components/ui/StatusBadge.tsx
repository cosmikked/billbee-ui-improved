export type BillStatus     = 'draft' | 'posted' | 'partial' | 'paid' | 'overdue' | 'void'
export type PropertyStatus = 'active' | 'inactive' | 'ready'
export type BadgeStatus    = BillStatus | PropertyStatus

const STATUS: Record<BadgeStatus, { label: string; classes: string }> = {
  draft:    { label: 'Draft',         classes: 'bg-surface-2 text-ink-3 border-border' },
  posted:   { label: 'Posted',        classes: 'bg-info-soft text-info border-info-soft' },
  partial:  { label: 'Partial',       classes: 'bg-warning-soft text-warning border-warning-soft' },
  paid:     { label: 'Paid',          classes: 'bg-success-soft text-success border-success-soft' },
  overdue:  { label: 'Overdue',       classes: 'bg-danger-soft text-danger border-danger-soft' },
  void:     { label: 'Void',          classes: 'bg-surface-2 text-ink-4 border-border' },
  active:   { label: 'Active',        classes: 'bg-success-soft text-success border-success-soft' },
  inactive: { label: 'Inactive',      classes: 'bg-surface-2 text-ink-4 border-border' },
  ready:    { label: 'Ready to bill', classes: 'bg-accent-soft text-accent-2 border-accent-soft' },
}

interface StatusBadgeProps {
  status: BadgeStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { label, classes } = STATUS[status]
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-pill border',
        'text-[11.5px] font-medium font-mono',
        classes,
        className,
      ].join(' ')}
    >
      {label}
    </span>
  )
}
