/* ── CycleMetricBoxes ──────────────────────────────────────────
   Reusable 4-box billing-cycle summary.
   Variants follow Option B: color only for terminal states,
   neutral for in-progress / unstarted states.
─────────────────────────────────────────────────────────────── */

export type CycleBoxVariant = 'paid' | 'posted' | 'draft' | 'overdue' | 'none'

export interface CycleBoxItem {
  variant: CycleBoxVariant
  count: number
  label: string
}

const BOX_STYLE: Record<CycleBoxVariant, { wrap: string; count: string; label: string }> = {
  paid:    { wrap: 'bg-success-soft',                  count: 'text-success',              label: 'text-success/80'          },
  posted:  { wrap: 'bg-indigo-50 dark:bg-indigo-950/40', count: 'text-indigo-600 dark:text-indigo-400', label: 'text-indigo-500 dark:text-indigo-400' },
  draft:   { wrap: 'bg-surface-2 border border-border', count: 'text-ink-2',               label: 'text-ink-3'               },
  overdue: { wrap: 'bg-danger-soft',                   count: 'text-danger',               label: 'text-danger/80'           },
  none:    { wrap: 'bg-surface-2 border border-border', count: 'text-ink-3',               label: 'text-ink-4'               },
}

interface CycleMetricBoxesProps {
  items: CycleBoxItem[]
  className?: string
}

export function CycleMetricBoxes({ items, className = '' }: CycleMetricBoxesProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {items.map(({ variant, count, label }) => {
        const s = BOX_STYLE[variant]
        return (
          <div key={label} className={`flex-1 rounded-btn px-4 py-3 flex flex-col gap-0.5 ${s.wrap}`}>
            <span className={`font-display text-[28px] font-bold leading-none tracking-[-0.02em] ${s.count}`}>
              {count}
            </span>
            <span className={`text-[12.5px] font-medium ${s.label}`}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}
