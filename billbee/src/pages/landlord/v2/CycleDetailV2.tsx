import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Eye, CheckCircle2, X, Plus } from 'lucide-react'
import { MOCK_CYCLE_DETAIL } from '../../../data/mock'
import type { CycleBillRow } from '../../../types/billing'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { PageHead } from '../../../components/ui/PageHead'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { ReviewBillDrawer } from './ReviewBillDrawer'
import { RecordPaymentDrawer } from '../RecordPaymentDrawer'
import type { PaymentResult } from '../RecordPaymentDrawer'

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(n: number) {
  return `₱${n.toLocaleString('en-PH')}`
}

/* ── Tab types ─────────────────────────────────────────────── */

type TabId = 'not-sent' | 'waiting' | 'paid'

/* ── Table cell constants ──────────────────────────────────── */

const TH = 'px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3 text-left whitespace-nowrap'
const TD = 'px-4 py-3 text-[13.5px] align-middle'

/* ── Not Sent table ────────────────────────────────────────── */

function NotSentTable({
  bills,
  onReview,
}: {
  bills: CycleBillRow[]
  onReview: (b: CycleBillRow) => void
}) {
  if (bills.length === 0) {
    return (
      <EmptyState
        heading="All bills have been sent"
        sub="Every draft has been reviewed and sent to tenants."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-surface-2">
            <th className={TH}>Tenant</th>
            <th className={TH}>Room</th>
            <th className={`${TH} text-right`}>Bill Total</th>
            <th className={TH} />
          </tr>
        </thead>
        <tbody>
          {bills.map(b => (
            <tr
              key={b.id}
              className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors"
            >
              <td className={`${TD} font-medium text-ink`}>{b.tenant}</td>
              <td className={`${TD} text-ink-3`}>Room {b.room}</td>
              <td className={`${TD} text-right font-mono font-semibold text-ink`}>
                {fmtPHP(b.totalPHP)}
              </td>
              <td className={`${TD} text-right`}>
                <Button variant="accent" size="sm" onClick={() => onReview(b)}>
                  <Send size={12} strokeWidth={1.75} />
                  Review &amp; Send
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Waiting for Payment table ─────────────────────────────── */

function WaitingTable({
  bills,
  onRecord,
}: {
  bills: CycleBillRow[]
  onRecord: (b: CycleBillRow) => void
}) {
  const navigate = useNavigate()

  if (bills.length === 0) {
    return (
      <EmptyState
        heading="No bills waiting for payment"
        sub="All posted bills have been settled."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-surface-2">
            <th className={TH}>Tenant</th>
            <th className={TH}>Room</th>
            <th className={TH}>Status</th>
            <th className={`${TH} text-right`}>Balance Due</th>
            <th className={TH} />
          </tr>
        </thead>
        <tbody>
          {bills.map(b => {
            const balance = b.balancePHP ?? 0
            return (
              <tr
                key={b.id}
                className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors"
              >
                <td className={`${TD} font-medium text-ink`}>{b.tenant}</td>
                <td className={`${TD} text-ink-3`}>Room {b.room}</td>
                <td className={TD}>
                  <StatusBadge status={b.status} />
                </td>
                <td className={`${TD} text-right font-mono font-semibold ${
                  b.status === 'overdue' ? 'text-danger' : 'text-ink'
                }`}>
                  {fmtPHP(balance)}
                </td>
                <td className={`${TD} text-right`}>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="accent" size="sm" onClick={() => onRecord(b)}>
                      + Record payment
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/landlord/billing/posted/${b.id}`)}
                    >
                      <Eye size={12} strokeWidth={1.75} />
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ── Paid table ────────────────────────────────────────────── */

function PaidTable({ bills }: { bills: CycleBillRow[] }) {
  const navigate = useNavigate()

  if (bills.length === 0) {
    return (
      <EmptyState
        heading="No fully paid bills yet"
        sub="Payments will appear here once tenants settle their bills."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-surface-2">
            <th className={TH}>Tenant</th>
            <th className={TH}>Room</th>
            <th className={`${TH} text-right`}>Amount Paid</th>
            <th className={TH} />
          </tr>
        </thead>
        <tbody>
          {bills.map(b => (
            <tr
              key={b.id}
              className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors opacity-70"
            >
              <td className={`${TD} font-medium text-ink`}>{b.tenant}</td>
              <td className={`${TD} text-ink-3`}>Room {b.room}</td>
              <td className={`${TD} text-right font-mono font-semibold text-success`}>
                {fmtPHP(b.totalPHP)}
              </td>
              <td className={`${TD} text-right`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/landlord/billing/posted/${b.id}`)}
                >
                  <Eye size={12} strokeWidth={1.75} />
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Empty state ───────────────────────────────────────────── */

function EmptyState({ heading, sub }: { heading: string; sub: string }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-[14px] font-medium text-ink-2">{heading}</p>
      <p className="text-[13px] text-ink-4 mt-1">{sub}</p>
    </div>
  )
}

/* ── Tab button ────────────────────────────────────────────── */

function Tab({
  label, count, active, urgent = false, onClick,
}: {
  label: string
  count: number
  active: boolean
  urgent?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-medium border-b-2 transition-ui whitespace-nowrap -mb-px',
        active
          ? 'border-ink text-ink'
          : 'border-transparent text-ink-3 hover:text-ink-2 hover:border-border',
      ].join(' ')}
    >
      {label}
      <span className={[
        'inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-[11px] font-bold px-1.5',
        active
          ? 'bg-ink text-white'
          : urgent
            ? 'bg-warning text-white'
            : 'bg-surface-2 text-ink-3',
      ].join(' ')}>
        {count}
      </span>
    </button>
  )
}

/* ── Quick-payment success strip ──────────────────────────── */

interface PaymentStrip {
  tenantName: string
  result: PaymentResult
}

/* ── Page ──────────────────────────────────────────────────── */

export function CycleDetailV2() {
  const navigate = useNavigate()
  const cycle    = MOCK_CYCLE_DETAIL

  const drafts  = cycle.bills.filter(b => b.status === 'draft')
  const waiting = cycle.bills.filter(b => ['posted', 'partial', 'overdue'].includes(b.status))
  const paid    = cycle.bills.filter(b => b.status === 'paid')

  const hasOverdue = waiting.some(b => b.status === 'overdue')

  const defaultTab: TabId = drafts.length > 0 ? 'not-sent' : 'waiting'
  const [activeTab,    setActiveTab]    = useState<TabId>(defaultTab)
  const [reviewBill,   setReviewBill]   = useState<CycleBillRow | null>(null)
  const [quickPayBill, setQuickPayBill] = useState<CycleBillRow | null>(null)
  const [strip,        setStrip]        = useState<PaymentStrip | null>(null)

  function handleQuickPaySuccess(result: PaymentResult) {
    if (quickPayBill) setStrip({ tenantName: quickPayBill.tenant, result })
    setQuickPayBill(null)
  }

  return (
    <>
      <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate('/landlord/billing-v2')}
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink transition-colors mb-5"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          All properties
        </button>

        {/* Page header */}
        <PageHead
          title={cycle.propertyName}
          subtitle={`${cycle.periodLabel} · Due ${cycle.dueDateLabel} · ${cycle.daysUntilDue} days left`}
          actions={
            cycle.missingBillTenants && cycle.missingBillTenants.length > 0 ? (
              <Button
                variant="accent"
                size="sm"
                onClick={() => navigate(`/landlord/billing-v2/create?property=${cycle.id}`)}
              >
                <Plus size={13} strokeWidth={1.75} />
                Create missing bills
              </Button>
            ) : undefined
          }
        />

        {/* Payment recorded strip */}
        {strip && (
          <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-btn border border-success/30 bg-success/5">
            <CheckCircle2 size={16} strokeWidth={1.75} className="text-success shrink-0" />
            <p className="flex-1 text-[13.5px] text-ink">
              {strip.result.kind === 'regular' ? (
                <>
                  <strong className="font-semibold">
                    ₱{strip.result.amountPaid.toLocaleString('en-PH')} recorded
                  </strong>{' '}
                  from <strong className="font-semibold">{strip.tenantName}</strong>
                </>
              ) : (
                <>
                  <strong className="font-semibold">
                    Advance of ₱{strip.result.amount.toLocaleString('en-PH')} recorded
                  </strong>{' '}
                  from {strip.tenantName} · applied to {strip.result.period}
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => setStrip(null)}
              className="text-ink-4 hover:text-ink transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { label: 'Total billed',  value: fmtPHP(cycle.stats.billedPHP),      sub: cycle.stats.billedSub      },
            { label: 'Collected',     value: fmtPHP(cycle.stats.collectedPHP),   sub: cycle.stats.collectedSub   },
            { label: 'Outstanding',   value: fmtPHP(cycle.stats.outstandingPHP), sub: `Due ${cycle.stats.dueDateLabel}` },
          ].map(s => (
            <div key={s.label} className="border border-border rounded-btn px-5 py-4 bg-surface">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                {s.label}
              </p>
              <p className="font-mono text-[22px] font-bold text-ink mt-0.5 leading-tight">
                {s.value}
              </p>
              <p className="text-[12px] text-ink-4 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Missing tenants notice */}
        {cycle.missingBillTenants && cycle.missingBillTenants.length > 0 && (
          <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-btn border border-dashed border-border-strong bg-surface text-[13px] text-ink-3">
            <span>
              <strong className="text-ink font-medium">
                {cycle.missingBillTenants.length} {cycle.missingBillTenants.length === 1 ? 'tenant' : 'tenants'} still don't have bills:
              </strong>{' '}
              {cycle.missingBillTenants.join(' · ')}
            </span>
          </div>
        )}

        {/* Tab bar + content */}
        <Card noPadding>

          {/* Tab bar */}
          <div className="flex items-end gap-0 px-4 border-b border-border overflow-x-auto">
            <Tab
              label="Not Sent"
              count={drafts.length}
              active={activeTab === 'not-sent'}
              urgent={drafts.length > 0}
              onClick={() => setActiveTab('not-sent')}
            />
            <Tab
              label="Waiting for Payment"
              count={waiting.length}
              active={activeTab === 'waiting'}
              urgent={hasOverdue}
              onClick={() => setActiveTab('waiting')}
            />
            <Tab
              label="Paid"
              count={paid.length}
              active={activeTab === 'paid'}
              onClick={() => setActiveTab('paid')}
            />
          </div>

          {/* Tab content */}
          {activeTab === 'not-sent' && (
            <NotSentTable bills={drafts} onReview={setReviewBill} />
          )}
          {activeTab === 'waiting' && (
            <WaitingTable bills={waiting} onRecord={setQuickPayBill} />
          )}
          {activeTab === 'paid' && (
            <PaidTable bills={paid} />
          )}

        </Card>

      </main>

      {/* Review & send drawer */}
      <ReviewBillDrawer
        bill={reviewBill}
        allDrafts={drafts}
        onClose={() => setReviewBill(null)}
        onNavigate={setReviewBill}
      />

      {/* Quick record payment drawer */}
      {quickPayBill && (
        <RecordPaymentDrawer
          open
          onClose={() => setQuickPayBill(null)}
          onSuccess={handleQuickPaySuccess}
          billId={quickPayBill.billNo}
          tenant={quickPayBill.tenant}
          period={cycle.periodLabel}
          balancePHP={quickPayBill.balancePHP ?? quickPayBill.totalPHP}
          dueDateLabel={cycle.dueDateLabel}
        />
      )}
    </>
  )
}
