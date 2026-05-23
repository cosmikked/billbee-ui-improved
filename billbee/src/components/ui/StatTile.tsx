import { type ReactNode } from 'react'
import { Pill, type PillVariant } from './Pill'

export type IconVariant  = 'default' | 'accent' | 'warn' | 'danger' | 'success'
export type ValueVariant = 'default' | 'attention' | 'danger'

export interface StatTileDelta {
  label: string
  variant: PillVariant
}

interface StatTileProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  delta?: StatTileDelta
  icon?: ReactNode
  iconVariant?: IconVariant
  valueVariant?: ValueVariant
  onClick?: () => void
}

const ICON_VARIANT: Record<IconVariant, string> = {
  default: 'bg-surface-2 text-ink-3',
  accent:  'bg-accent-soft text-accent-2',
  warn:    'bg-warning-soft text-warning',
  danger:  'bg-danger-soft text-danger',
  success: 'bg-success-soft text-success',
}

const VALUE_VARIANT: Record<ValueVariant, string> = {
  default:   'text-ink',
  attention: 'text-accent-2',
  danger:    'text-danger',
}

export function StatTile({
  label,
  value,
  sub,
  delta,
  icon,
  iconVariant  = 'default',
  valueVariant = 'default',
  onClick,
}: StatTileProps) {
  return (
    <div
      className={[
        'bg-surface border border-border rounded-card transition-ui hover:border-border-strong',
        onClick ? 'cursor-pointer' : '',
      ].join(' ')}
      style={{ padding: 'var(--pad-card)' }}
      onClick={onClick}
    >
      {/* Label + icon */}
      <div className="flex items-center justify-between mb-[10px]">
        <span className="text-[12.5px] font-medium text-ink-3 truncate flex-1 min-w-0 pr-2">
          {label}
        </span>
        {icon && (
          <span
            className={`w-7 h-7 rounded-chip inline-flex items-center justify-center shrink-0 ${ICON_VARIANT[iconVariant]}`}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <div
        className={`font-display text-[26px] font-bold tracking-[-0.02em] leading-[1.1] mb-0.5 ${VALUE_VARIANT[valueVariant]}`}
      >
        {value}
      </div>

      {/* Sub + delta */}
      <div className="text-[12px] text-ink-3 flex items-center gap-1.5 flex-wrap">
        {delta && <Pill variant={delta.variant}>{delta.label}</Pill>}
        {sub}
      </div>
    </div>
  )
}
