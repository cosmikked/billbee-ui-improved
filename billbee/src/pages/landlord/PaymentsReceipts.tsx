import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Info,
  Mail,
  Printer,
} from 'lucide-react'
import { PageHead } from '../../components/ui/PageHead'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { Card } from '../../components/ui/Card'
import { Pill } from '../../components/ui/Pill'
import { Callout } from '../../components/ui/Callout'
import { Drawer } from '../../components/ui/Drawer'
import { Modal } from '../../components/ui/Modal'

/* ── Types ─────────────────────────────────────────────────── */

type PaymentType   = 'regular' | 'advance'
type PaymentMode   = 'cash' | 'bank' | 'e-wallet' | 'other'
type EmailStatus   = 'sent' | 'not-sent' | 'failed'
type PaymentStatus = 'active' | 'void'

interface PaymentRow {
  id: string
  date: string
  tenant: string
  tenantFull: string
  billId: string
  type: PaymentType
  advancePeriod?: string
  amountPHP: number
  mode: PaymentMode
  receiptNo: string
  emailStatus: EmailStatus
  status: PaymentStatus
  recordedBy: string
  property: string
  period: string
  billBalanceAfter: number
  voidReason?: string
}

/* ── Mock data ─────────────────────────────────────────────── */

const PAYMENTS: PaymentRow[] = [
  {
    id: 'p1', date: 'Mar 9', tenant: 'J. Cruz', tenantFull: 'Joseph Cruz',
    billId: 'BILL-26-00041', type: 'regular', amountPHP: 4350,
    mode: 'cash', receiptNo: 'RCT-0183', emailStatus: 'sent', status: 'active',
    recordedBy: 'Maria', property: 'Sunset Apartments', period: 'March 2026',
    billBalanceAfter: 0,
  },
  {
    id: 'p2', date: 'Mar 9', tenant: 'J. Cruz', tenantFull: 'Joseph Cruz',
    billId: 'ADV-May2026', type: 'advance', advancePeriod: 'May 2026', amountPHP: 3800,
    mode: 'bank', receiptNo: 'ADV-0842', emailStatus: 'not-sent', status: 'active',
    recordedBy: 'Maria', property: 'Sunset Apartments', period: 'May 2026',
    billBalanceAfter: 0,
  },
  {
    id: 'p3', date: 'Mar 8', tenant: 'R. Lim', tenantFull: 'Rico Lim',
    billId: 'BILL-26-00040', type: 'regular', amountPHP: 3000,
    mode: 'bank', receiptNo: 'RCT-0182', emailStatus: 'sent', status: 'active',
    recordedBy: 'Maria', property: 'Sunset Apartments', period: 'March 2026',
    billBalanceAfter: 1350,
  },
  {
    id: 'p4', date: 'Mar 7', tenant: 'A. Tan', tenantFull: 'Anna Tan',
    billId: 'BILL-26-00039', type: 'regular', amountPHP: 5900,
    mode: 'e-wallet', receiptNo: 'RCT-0181', emailStatus: 'failed', status: 'active',
    recordedBy: 'Maria', property: 'Sunset Apartments', period: 'March 2026',
    billBalanceAfter: 0,
  },
  {
    id: 'p5', date: 'Feb 28', tenant: 'H. Reyes', tenantFull: 'Maria Reyes',
    billId: 'BILL-25-00498', type: 'regular', amountPHP: 4100,
    mode: 'cash', receiptNo: 'RCT-0179', emailStatus: 'sent', status: 'void',
    recordedBy: 'Maria', property: 'Sunset Apartments', period: 'February 2026',
    billBalanceAfter: 4100, voidReason: 'wrong tenant',
  },
  {
    id: 'p6', date: 'Feb 28', tenant: 'J. Cruz', tenantFull: 'Joseph Cruz',
    billId: 'BILL-26-00033', type: 'regular', amountPHP: 3750,
    mode: 'cash', receiptNo: 'RCT-0178', emailStatus: 'sent', status: 'active',
    recordedBy: 'Maria', property: 'Sunset Apartments', period: 'February 2026',
    billBalanceAfter: 0,
  },
]

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(v: number) {
  return `₱${v.toLocaleString('en-PH')}`
}

const EMAIL_PILL: Record<EmailStatus, { label: string; variant: 'up' | 'down' | 'neutral' }> = {
  'sent':     { label: 'Sent',     variant: 'up'      },
  'not-sent': { label: 'Not sent', variant: 'neutral' },
  'failed':   { label: 'Failed',   variant: 'down'    },
}

// Maps the drawer's PaymentMode enum → the table's PaymentMode union
function toTableMode(raw: string): PaymentMode {
  const map: Record<string, PaymentMode> = {
    CASH: 'cash', GCASH: 'e-wallet', BANK: 'bank', CHEQUE: 'other', OTHER: 'other',
  }
  return map[raw.toUpperCase()] ?? 'other'
}

/* ── Table constants ───────────────────────────────────────── */

const TH = 'px-3 py-[10px] bg-bg text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap text-left'
const TD = 'px-3 text-[13.5px] text-ink-2'

/* ── Filter chip ───────────────────────────────────────────── */

function FilterChip({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1 px-2.5 py-[5px] text-[12.5px] border border-border rounded-pill bg-surface hover:bg-surface-2 hover:border-border-strong text-ink-2 transition-colors shrink-0"
    >
      <span className="text-ink-3">{label}:</span>
      <span className="font-medium text-ink">{value}</span>
      <ChevronDown size={11} strokeWidth={1.75} className="text-ink-4 ml-0.5" />
    </button>
  )
}

/* ── Detail row (inside drawer) ────────────────────────────── */

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 py-1.5 border-b border-border-subtle last:border-0">
      <span className="text-[12.5px] text-ink-3">{label}</span>
      <span className="text-[13px] text-ink font-medium">{value ?? '—'}</span>
    </div>
  )
}

/* ── Receipt preview card ──────────────────────────────────── */

function ReceiptCard({ payment, voided = false }: { payment: PaymentRow; voided?: boolean }) {
  const isAdvance     = payment.type === 'advance'
  const balanceBefore = payment.billBalanceAfter + payment.amountPHP
  const maxAdvance    = payment.amountPHP // mock: treat full amount as max for coverage %

  return (
    <div className="relative">
      <div className={[
        'border border-border rounded-btn bg-surface overflow-hidden',
        voided ? 'opacity-70' : '',
      ].join(' ')}>

        {/* ── Property header ── */}
        <div className="text-center px-5 pt-5 pb-4 border-b-2 border-border">
          <p className="text-[15px] font-bold text-ink leading-tight tracking-[-0.01em]">
            {payment.property}
          </p>
          <p className="text-[11.5px] text-ink-4 mt-0.5">Maria Dela Cruz</p>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">

          {/* ── Type badge + OR number ── */}
          <div className="flex flex-col items-center gap-1.5">
            {isAdvance && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.05em] uppercase bg-accent/10 text-accent border border-accent/20">
                Advance Payment
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-2 border border-border font-mono text-[11.5px] text-ink-3">
              Official Receipt · <span className="font-semibold text-ink">{payment.receiptNo}</span>
            </span>
          </div>

          {/* ── Amount hero ── */}
          <div className="text-center rounded-btn border border-border bg-surface-2 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-ink-4 mb-1">
              {isAdvance ? 'Advance Paid' : 'Amount Paid'}
            </p>
            <p className="font-mono text-[28px] font-bold text-ink leading-tight">
              {fmtPHP(payment.amountPHP)}
            </p>
            {isAdvance && payment.advancePeriod && (
              <p className="text-[11.5px] text-ink-3 mt-1">Applied to {payment.advancePeriod}</p>
            )}
          </div>

          {/* ── Details grid ── */}
          <div className="flex flex-col divide-y divide-border border border-border rounded-btn overflow-hidden">
            {[
              { label: 'Bill reference', value: payment.billId },
              { label: 'Tenant',         value: payment.tenantFull },
              { label: 'Room',           value: 'A-101' },
              { label: isAdvance ? 'Applied to period' : 'Billing period', value: payment.period },
              { label: 'Payment date',   value: `${payment.date}, 2026` },
              { label: 'Method',         value: payment.mode.charAt(0).toUpperCase() + payment.mode.slice(1) },
              { label: 'Recorded by',    value: payment.recordedBy },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between px-3 py-1.5 bg-surface">
                <span className="text-[11.5px] text-ink-3">{row.label}</span>
                <span className="text-[12px] text-ink font-medium">{row.value}</span>
              </div>
            ))}
          </div>

          {/* ── Balance / coverage summary ── */}
          <div className="flex flex-col divide-y divide-border border border-border rounded-btn overflow-hidden">
            {isAdvance ? (
              <>
                <div className="flex items-center justify-between px-3 py-1.5 bg-surface">
                  <span className="text-[11.5px] text-ink-3">Amount paid</span>
                  <span className="font-mono text-[12px] text-success">{fmtPHP(payment.amountPHP)}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-surface-2">
                  <span className="text-[12px] font-semibold text-ink">Coverage</span>
                  <span className="font-mono text-[13px] font-bold text-ink">
                    {Math.round((payment.amountPHP / maxAdvance) * 100)}%
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between px-3 py-1.5 bg-surface">
                  <span className="text-[11.5px] text-ink-3">Balance before</span>
                  <span className="font-mono text-[12px] text-ink">{fmtPHP(balanceBefore)}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-1.5 bg-surface">
                  <span className="text-[11.5px] text-ink-3">Amount paid</span>
                  <span className="font-mono text-[12px] text-success">− {fmtPHP(payment.amountPHP)}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-surface-2">
                  <span className="text-[12px] font-semibold text-ink">Remaining balance</span>
                  <span className={`font-mono text-[13px] font-bold ${payment.billBalanceAfter > 0 ? 'text-danger' : 'text-success'}`}>
                    {fmtPHP(payment.billBalanceAfter)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <p className="text-center text-[11px] text-ink-4 border-t border-border pt-3">
            {voided
              ? 'This receipt has been voided and is no longer valid.'
              : `Issued by ${payment.recordedBy} · BillBee`
            }
          </p>

        </div>
      </div>

      {/* VOID watermark */}
      {voided && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[52px] font-black text-danger opacity-[0.15] rotate-[-18deg] select-none tracking-[0.15em]">
            VOID
          </span>
        </div>
      )}
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

export function PaymentsReceipts() {
  const navigate                         = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [payments,      setPayments]      = useState<PaymentRow[]>(PAYMENTS)
  const [selected,    setSelected]    = useState<PaymentRow | null>(null)
  const [voidTarget,  setVoidTarget]  = useState<PaymentRow | null>(null)
  const [voidReason,  setVoidReason]  = useState('')
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const highlightRowRef = useRef<HTMLTableRowElement | null>(null)

  // On mount: inject new row from query params and highlight it
  useEffect(() => {
    const orNumber = searchParams.get('highlight')
    if (!orNumber) return

    // Strip params from URL immediately
    setSearchParams({}, { replace: true })

    const amount  = parseFloat(searchParams.get('amount') ?? '0')
    const period  = searchParams.get('period') ?? ''
    const modeRaw = searchParams.get('mode') ?? 'CASH'
    const tenant  = searchParams.get('tenant') ?? ''
    const billId  = searchParams.get('billId') ?? ''

    // Check if already exists (e.g. page refresh)
    const existing = PAYMENTS.find(p => p.receiptNo === orNumber)
    let targetRow: PaymentRow

    if (existing) {
      targetRow = existing
    } else {
      const today = new Date()
      targetRow = {
        id:              orNumber,
        date:            today.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
        tenant,
        tenantFull:      tenant,
        billId,
        type:            'advance',
        advancePeriod:   period,
        amountPHP:       amount,
        mode:            toTableMode(modeRaw),
        receiptNo:       orNumber,
        emailStatus:     'not-sent',
        status:          'active',
        recordedBy:      'Maria',
        property:        'Sunset Apartments',
        period,
        billBalanceAfter: 0,
      }
      setPayments(prev => [targetRow, ...prev])
    }

    setHighlightId(targetRow.id)
    const timer = setTimeout(() => setHighlightId(null), 3000)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll highlighted row into view once it renders
  useEffect(() => {
    if (highlightId && highlightRowRef.current) {
      highlightRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightId])

  const failedCount = payments.filter(p => p.emailStatus === 'failed' && p.status === 'active').length

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

      <PageHead
        title="Payment History"
        subtitle="Every payment you've recorded, with the receipt it generated"
        actions={
          <>
            <Button variant="default">
              <Download size={13} strokeWidth={1.75} /> Export
            </Button>
            {failedCount > 0 && (
              <Button variant="default">
                Resend receipts ({failedCount} failed)
              </Button>
            )}
          </>
        }
      />

      {/* Filter chip bar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <FilterChip label="date"     value="last 30d"          />
        <FilterChip label="property" value="all"               />
        <FilterChip label="mode"     value="any"               />
        <FilterChip label="type"     value="regular + advance" />
        <FilterChip label="email"    value="any"               />
        <FilterChip label="status"   value="active"            />
        <span className="ml-auto text-[12.5px] text-ink-4">{payments.length} results</span>
      </div>

      {/* Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b border-border">
                <th className={TH}>Date</th>
                <th className={TH}>Tenant</th>
                <th className={`${TH} text-right`}>Amount</th>
                <th className={TH}>Method</th>
                <th className={TH}>Receipt #</th>
                {/* Secondary columns — less emphasis */}
                <th className={TH}>Type</th>
                <th className={TH}>Receipt sent</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(row => {
                const isVoid      = row.status === 'void'
                const isSelected  = selected?.id === row.id
                const isHighlight = highlightId === row.id
                const { label: emailLabel, variant: emailVariant } = EMAIL_PILL[row.emailStatus]

                return (
                  <tr
                    key={row.id}
                    ref={isHighlight ? highlightRowRef : null}
                    onClick={() => setSelected(row)}
                    className={[
                      'border-b border-border-subtle cursor-pointer transition-colors duration-700',
                      isVoid      ? 'opacity-50'             : '',
                      isHighlight ? 'bg-accent/10 animate-pulse' :
                      isSelected  ? 'bg-accent-tint'         : 'hover:bg-surface-2',
                    ].join(' ')}
                  >
                    {/* Primary columns */}
                    <td className={`${TD} py-[var(--pad-row)] font-mono text-[12px] text-ink-3 whitespace-nowrap`}>
                      {row.date}
                    </td>
                    <td className={`${TD} py-[var(--pad-row)]`}>
                      <div className="font-medium text-ink">{row.tenant}</div>
                      <div className="text-[11.5px] text-ink-4 font-mono">{row.billId}</div>
                    </td>
                    <td className={`${TD} py-[var(--pad-row)] text-right font-mono font-semibold text-ink`}>
                      {fmtPHP(row.amountPHP)}
                      {isVoid && <div className="text-[11px] text-danger font-sans font-medium">Void</div>}
                    </td>
                    <td className={`${TD} py-[var(--pad-row)] capitalize text-ink-2`}>{row.mode}</td>
                    <td className={`${TD} py-[var(--pad-row)] font-mono text-[12.5px] text-ink-2`}>
                      {row.receiptNo}
                    </td>
                    {/* Secondary columns */}
                    <td className={`${TD} py-[var(--pad-row)]`}>
                      {row.type === 'advance'
                        ? <Pill variant="accent">Advance</Pill>
                        : <Pill variant="neutral">Regular</Pill>
                      }
                    </td>
                    <td className={`${TD} py-[var(--pad-row)]`}>
                      <Pill variant={emailVariant}>{emailLabel}</Pill>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Detail drawer ── */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        side="right"
        width={400}
        title={selected ? `${selected.tenantFull} · ${selected.type === 'advance' ? selected.advancePeriod ?? selected.period : selected.period}` : 'Payment record'}
        subtitle={selected ? `Receipt ${selected.receiptNo}` : ''}
        actions={
          selected && selected.type !== 'advance' ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setSelected(null)
                navigate(`/landlord/billing/posted/${selected.billId}`)
              }}
            >
              Open bill <ChevronRight size={12} strokeWidth={2} />
            </Button>
          ) : selected?.type === 'advance' ? (
            <span className="text-[11.5px] text-ink-4 italic">Advance · future period</span>
          ) : undefined
        }
      >
        {selected && (
          <div className="flex flex-col gap-5">

            {/* Payment details */}
            <div>
              <DetailRow label="Date"        value={`${selected.date}, 2026`} />
              <DetailRow label="Tenant"      value={selected.tenantFull} />
              <DetailRow label="Bill #"      value={selected.billId} />
              <DetailRow label="Amount"      value={fmtPHP(selected.amountPHP)} />
              <DetailRow label="Mode"        value={selected.mode.charAt(0).toUpperCase() + selected.mode.slice(1)} />
              <DetailRow label="Reference"   />
              <DetailRow label="Recorded by" value={selected.recordedBy} />
              <DetailRow label="Proof"       value="—" />
            </div>

            {/* Void button — only for active payments */}
            {selected.status === 'active' && (
              <Button
                variant="accent"
                className="w-full justify-center text-danger border-danger-soft hover:bg-danger-soft hover:border-danger"
                onClick={() => { setVoidTarget(selected); setVoidReason('') }}
              >
                Void payment
              </Button>
            )}

            {/* Receipt */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
                  Receipt {selected.receiptNo}
                </p>
                <div className="flex items-center gap-1">
                  <IconButton aria-label="Copy receipt"><Copy size={13} strokeWidth={1.75} /></IconButton>
                  <IconButton aria-label="Email receipt"><Mail size={13} strokeWidth={1.75} /></IconButton>
                  <IconButton aria-label="Print receipt"><Printer size={13} strokeWidth={1.75} /></IconButton>
                </div>
              </div>
              <ReceiptCard payment={selected} voided={selected.status === 'void'} />
            </div>

          </div>
        )}
      </Drawer>

      {/* ── Void modal ── */}
      <Modal
        open={!!voidTarget}
        onClose={() => setVoidTarget(null)}
        width={500}
        title="Void payment"
        subtitle={voidTarget ? `${voidTarget.receiptNo} · ${voidTarget.date}, 2026 · ${fmtPHP(voidTarget.amountPHP)}` : ''}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="default" onClick={() => setVoidTarget(null)}>Cancel</Button>
            <Button
              variant="accent"
              disabled={!voidReason.trim()}
            >
              Void
            </Button>
          </div>
        }
      >
        {voidTarget && (
          <div className="flex flex-col gap-4">

            {/* Reason */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
                Reason <span className="text-danger ml-0.5">*</span>
              </label>
              <input
                type="text"
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                placeholder="Why are you voiding this?"
                className="border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface focus:outline-none focus:border-accent transition-colors w-full placeholder:text-ink-4"
                autoFocus
              />
            </div>

            {/* Receipt preview with VOID watermark */}
            <ReceiptCard payment={voidTarget} voided />

            {/* Consequences */}
            <Callout variant="warning" icon={<AlertTriangle size={16} strokeWidth={1.75} />}>
              <ul className="flex flex-col gap-1 text-[13px] text-ink-2">
                <li>The linked receipt will be marked Void.</li>
                <li>Bill balance will be restored.</li>
                <li>Payment can't be voided twice.</li>
              </ul>
            </Callout>

          </div>
        )}
      </Modal>

    </main>
  )
}
