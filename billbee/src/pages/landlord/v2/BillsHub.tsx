import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, AlertCircle } from 'lucide-react'
import { MOCK_BILLING_CENTER } from '../../../data/mock'
import type { BillingCycleProperty } from '../../../types/billing'
import { Button } from '../../../components/ui/Button'
import { PageHead } from '../../../components/ui/PageHead'

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(v: number) {
  return `₱${v.toLocaleString('en-PH')}`
}

/* ── Status dot ────────────────────────────────────────────── */

function Dot({ color }: { color: 'warning' | 'success' | 'danger' | 'muted' }) {
  const cls = {
    warning: 'bg-warning',
    success: 'bg-success',
    danger:  'bg-danger',
    muted:   'bg-ink-4',
  }[color]
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${cls}`} />
}

/* ── Property bill card ────────────────────────────────────── */

function PropertyBillCard({ cycle }: { cycle: BillingCycleProperty }) {
  const navigate   = useNavigate()
  const hasStarted = cycle.status === 'in-progress'

  const notSent       = cycle.counts.draft
  const waitingPayment = cycle.counts.posted + cycle.counts.overdue
  const fullyPaid      = cycle.counts.paid
  const overdueCount   = cycle.counts.overdue

  return (
    <div className="border border-border rounded-card bg-surface overflow-hidden">
      {/* Card header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-[15.5px] font-semibold text-ink leading-tight">
            {cycle.propertyName}
          </h2>
          <p className="text-[12.5px] text-ink-3 mt-0.5">
            Billing day: {cycle.billingDay}th · {cycle.periodLabel}
          </p>
        </div>
        <Button
          variant={hasStarted ? 'default' : 'accent'}
          size="sm"
          onClick={() =>
            hasStarted
              ? navigate(`/landlord/billing-v2/cycle/${cycle.id}`)
              : navigate(`/landlord/billing-v2/create?property=${cycle.id}`)
          }
        >
          {hasStarted ? 'Open bills' : "Create this month's bills"}
          <ArrowRight size={13} strokeWidth={1.75} />
        </Button>
      </div>

      {/* Card body */}
      <div className="px-5 py-4">
        {hasStarted ? (
          <div className="flex flex-col gap-2.5">
            {notSent > 0 && (
              <div className="flex items-center gap-2.5">
                <Dot color="warning" />
                <span className="text-[13.5px] text-ink-2">
                  <strong className="text-ink font-semibold">{notSent}</strong>{' '}
                  {notSent === 1 ? 'bill' : 'bills'} not sent to tenants yet
                </span>
              </div>
            )}
            {waitingPayment > 0 && (
              <div className="flex items-center gap-2.5">
                <Dot color={overdueCount > 0 ? 'danger' : 'muted'} />
                <span className="text-[13.5px] text-ink-2">
                  <strong className="text-ink font-semibold">{waitingPayment}</strong>{' '}
                  {waitingPayment === 1 ? 'bill' : 'bills'} waiting for payment
                  {overdueCount > 0 && (
                    <span className="text-danger ml-1.5 font-medium">
                      ({overdueCount} overdue)
                    </span>
                  )}
                </span>
              </div>
            )}
            {fullyPaid > 0 && (
              <div className="flex items-center gap-2.5">
                <Dot color="success" />
                <span className="text-[13.5px] text-ink-2">
                  <strong className="text-ink font-semibold">{fullyPaid}</strong>{' '}
                  {fullyPaid === 1 ? 'tenant has' : 'tenants have'} fully paid
                </span>
              </div>
            )}
            {notSent === 0 && waitingPayment === 0 && fullyPaid === 0 && (
              <p className="text-[13.5px] text-ink-3">No billing activity yet this period.</p>
            )}
            {/* Totals footer */}
            <div className="mt-1 pt-3 border-t border-border flex items-center gap-5">
              <span className="text-[12.5px] text-ink-3">
                Billed:{' '}
                <span className="font-mono font-medium text-ink">
                  {fmtPHP(cycle.totals.billedPHP)}
                </span>
              </span>
              <span className="text-[12.5px] text-ink-3">
                Collected:{' '}
                <span className="font-mono font-medium text-success">
                  {fmtPHP(cycle.totals.collectedPHP)}
                </span>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 text-[13.5px] text-ink-3">
            <AlertCircle size={15} strokeWidth={1.75} className="shrink-0 mt-[1px] text-ink-4" />
            <span>
              No bills created for this month yet. Click{' '}
              <strong className="text-ink font-medium">Create this month's bills</strong> to get started.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

export function BillsHub() {
  const [activeMonthId, setActiveMonthId] = useState(
    MOCK_BILLING_CENTER.months.find(m => m.state === 'current')?.id
      ?? MOCK_BILLING_CENTER.months[0]?.id
      ?? '',
  )

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">
      <PageHead
        title="Bills"
        subtitle="Create and track monthly bills for all your tenants"
      />

      {/* Month tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6">
        {MOCK_BILLING_CENTER.months.map(month => {
          const isActive = month.id === activeMonthId
          return (
            <button
              key={month.id}
              type="button"
              onClick={() => setActiveMonthId(month.id)}
              className={[
                'min-w-[76px] flex-shrink-0 border rounded-btn px-3 py-2 text-center transition-ui',
                isActive
                  ? 'bg-ink border-ink text-white'
                  : month.state === 'future'
                    ? 'bg-surface border-border text-ink-4 hover:border-border-strong hover:text-ink-3'
                    : 'bg-surface border-border text-ink hover:bg-surface-2 hover:border-border-strong',
              ].join(' ')}
            >
              <div className="text-[13.5px] font-semibold leading-tight">{month.label}</div>
              <div className={`text-[11px] mt-0.5 ${isActive ? 'text-white/60' : 'text-ink-4'}`}>
                {month.state === 'current' ? 'this month' : month.state}
              </div>
            </button>
          )
        })}
      </div>

      {/* Property cards */}
      <div className="flex flex-col gap-4">
        {MOCK_BILLING_CENTER.cycles.map(cycle => (
          <PropertyBillCard key={cycle.id} cycle={cycle} />
        ))}
      </div>
    </main>
  )
}
