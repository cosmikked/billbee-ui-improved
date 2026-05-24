import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Info, Plus } from 'lucide-react'
import { MOCK_BILLING_CENTER } from '../../data/mock'
import type { BillingCycleProperty } from '../../types/billing'
import { PageHead } from '../../components/ui/PageHead'
import { Button } from '../../components/ui/Button'
import { Card, CardHead } from '../../components/ui/Card'
import { Pill } from '../../components/ui/Pill'
import { Callout } from '../../components/ui/Callout'

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(value: number): string {
  return `₱${value.toLocaleString('en-PH')}`
}

function segmentPct(count: number, total: number): string {
  if (total === 0) return '0%'
  return `${(count / total) * 100}%`
}

/* ── Cycle property card ───────────────────────────────────── */

function CycleCard({ cycle }: { cycle: BillingCycleProperty }) {
  const navigate = useNavigate()
  const total = cycle.counts.paid + cycle.counts.posted + cycle.counts.draft + cycle.counts.overdue
  const inProgress = cycle.status === 'in-progress'

  return (
    <Card>
      <CardHead
        title={cycle.propertyName}
        subtitle={`billing day ${cycle.billingDay} · period ${cycle.periodLabel}`}
        actions={
          <>
            <Pill variant={inProgress ? 'info' : 'neutral'}>
              {inProgress ? 'In progress' : 'Not started'}
            </Pill>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate(`/landlord/billing/cycle/${cycle.id}`)}
            >
              Open cycle <ArrowRight size={13} strokeWidth={1.75} />
            </Button>
          </>
        }
      />

      {inProgress ? (
        <>
          {/* Segmented progress bar */}
          <div className="w-full h-2 rounded-pill overflow-hidden mb-3 bg-surface-2 flex gap-px">
            <span className="h-full bg-success-soft transition-[width]"  style={{ width: segmentPct(cycle.counts.paid,    total) }} />
            <span className="h-full bg-accent-soft transition-[width]"   style={{ width: segmentPct(cycle.counts.posted,  total) }} />
            <span className="h-full bg-border-strong transition-[width]" style={{ width: segmentPct(cycle.counts.draft,   total) }} />
            <span className="h-full bg-warning-soft transition-[width]"  style={{ width: segmentPct(cycle.counts.overdue, total) }} />
          </div>

          {/* Bill count pills + totals */}
          <div className="flex items-center gap-2 flex-wrap">
            <Pill variant="up">{cycle.counts.paid} paid</Pill>
            <Pill variant="accent">{cycle.counts.posted} posted</Pill>
            <Pill variant="neutral">{cycle.counts.draft} draft</Pill>
            {cycle.counts.overdue > 0 && (
              <Pill variant="down">{cycle.counts.overdue} overdue</Pill>
            )}
            <span className="ml-auto text-[13px] text-ink-3">
              billed:{' '}
              <span className="font-mono font-medium text-ink-2">{fmtPHP(cycle.totals.billedPHP)}</span>
            </span>
            <span className="text-[13px] text-ink-3">
              collected:{' '}
              <span className="font-mono font-medium text-ink-2">{fmtPHP(cycle.totals.collectedPHP)}</span>
            </span>
          </div>
        </>
      ) : (
        <Callout
          variant="accent"
          icon={<Info size={16} strokeWidth={1.75} />}
          action={<Button size="sm" variant="accent">Start prep</Button>}
        >
          <p className="text-[13px]">
            Billing day is the {cycle.billingDay}th — already passed. Generate now to catch up.
          </p>
        </Callout>
      )}
    </Card>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

export function BillingCenter() {
  const navigate = useNavigate()
  const [activeMonth, setActiveMonth] = useState(
    MOCK_BILLING_CENTER.months.find(m => m.state === 'current')?.id
      ?? MOCK_BILLING_CENTER.months[0]?.id
      ?? '',
  )

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">
      <PageHead
        title="Billing cycles"
        subtitle="organized by month + property — see the cycle as a whole"
        actions={
          <Button variant="accent" onClick={() => navigate('/landlord/billing/generate')}>
            <Plus size={14} strokeWidth={2} />
            Generate Billings
          </Button>
        }
      />

      {/* Month tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6">
        {MOCK_BILLING_CENTER.months.map(month => {
          const isActive = month.id === activeMonth
          return (
            <button
              key={month.id}
              type="button"
              onClick={() => setActiveMonth(month.id)}
              className={[
                'min-w-[80px] flex-shrink-0 border rounded-btn px-3 py-2 text-center transition-ui',
                isActive
                  ? 'bg-ink border-ink text-white'
                  : month.state === 'future'
                    ? 'bg-surface border-border text-ink-4 hover:border-border-strong hover:text-ink-3'
                    : 'bg-surface border-border text-ink hover:bg-surface-2 hover:border-border-strong',
              ].join(' ')}
            >
              <div className="text-[13.5px] font-semibold leading-tight">{month.label}</div>
              <div className={`text-[11px] mt-0.5 ${isActive ? 'text-white/60' : 'text-ink-4'}`}>
                {month.state}
              </div>
            </button>
          )
        })}
      </div>

      {/* Current month label */}
      <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em] text-ink mb-3">
        {MOCK_BILLING_CENTER.currentMonthLabel}
      </h2>

      {/* Cycle cards */}
      <div className="flex flex-col" style={{ gap: 'var(--gap-grid)' }}>
        {MOCK_BILLING_CENTER.cycles.map(cycle => (
          <CycleCard key={cycle.id} cycle={cycle} />
        ))}
      </div>

      {/* Older overdue callout */}
      <Callout
        variant="warning"
        className="mt-5"
        icon={<AlertTriangle size={18} strokeWidth={1.75} />}
        action={
          <Button size="sm" variant="default">
            View <ArrowRight size={13} strokeWidth={1.75} />
          </Button>
        }
      >
        <span className="text-[13.5px]">
          <strong className="font-semibold text-ink">Older overdue:</strong>{' '}
          {MOCK_BILLING_CENTER.olderOverdue.billCount} bills from {MOCK_BILLING_CENTER.olderOverdue.monthLabel}{' '}
          totalling{' '}
          <span className="font-mono font-medium">{fmtPHP(MOCK_BILLING_CENTER.olderOverdue.amountPHP)}</span>{' '}
          still unpaid.
        </span>
      </Callout>

      {/* How a cycle works — info note */}
      <Callout
        variant="info"
        className="mt-3"
        icon={<Info size={18} strokeWidth={1.75} />}
      >
        <p className="text-[13px] text-ink-2">
          <strong className="font-semibold text-ink">How a cycle works:</strong>{' '}
          for each property × month, BillBee tracks the billing day, drafts, posted bills, and payments.
          Click <strong className="font-semibold text-ink">Open cycle →</strong> to see all bills in that cycle with bulk actions.
        </p>
      </Callout>
    </main>
  )
}
