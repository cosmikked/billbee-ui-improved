import { useState } from 'react'
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
import { Banner } from '../../components/ui/Banner'
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
  const isAdvance = payment.type === 'advance'

  return (
    <div className="relative">
      <Card className={voided ? 'opacity-70' : ''}>
        {/* Receipt header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-display text-[15px] font-semibold text-ink leading-tight">
              BillBee Receipt
            </p>
            <p className="text-[11px] text-ink-4 font-mono mt-0.5">{payment.property}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono text-[12px] text-ink-3">{payment.receiptNo}</p>
            <p className="font-mono text-[11px] text-ink-4">{payment.date}, 2026</p>
          </div>
        </div>

        <div className="border-t border-dashed border-border my-2" />

        {/* Fields */}
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex justify-between text-[12.5px]">
            <span className="text-ink-3">From</span>
            <span className="text-ink font-medium">{payment.tenantFull}</span>
          </div>
          <div className="flex justify-between text-[12.5px]">
            <span className="text-ink-3">{isAdvance ? 'For period' : 'For bill'}</span>
            <span className="text-ink font-mono text-[12px]">{payment.billId}</span>
          </div>
          <div className="flex justify-between text-[12.5px]">
            <span className="text-ink-3">Period</span>
            <span className="text-ink">{payment.period}</span>
          </div>
          <div className="flex justify-between text-[12.5px]">
            <span className="text-ink-3">Mode</span>
            <span className="text-ink capitalize">{payment.mode}</span>
          </div>
        </div>

        <div className="border-t border-border mt-2 pt-3 flex items-baseline justify-between">
          <span className="text-[12.5px] text-ink-3">Amount paid</span>
          <span className="font-mono text-[22px] font-bold text-ink">{fmtPHP(payment.amountPHP)}</span>
        </div>

        <div className="mt-2 pt-2 border-t border-border-subtle">
          {voided ? (
            <p className="text-[11.5px] text-ink-4">
              Void receipts stay visible. Cannot be emailed as active.
            </p>
          ) : (
            <p className="text-[11.5px] text-ink-3">
              Bill balance after: <span className="font-mono">{fmtPHP(payment.billBalanceAfter)}</span>
              {payment.billBalanceAfter === 0 && (
                <span className="text-success"> · marked Paid</span>
              )}
            </p>
          )}
          <p className="text-[11px] text-ink-4 mt-0.5">Issued by {payment.recordedBy} · billbee.app</p>
        </div>
      </Card>

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
  const [selected,    setSelected]    = useState<PaymentRow | null>(null)
  const [voidTarget,  setVoidTarget]  = useState<PaymentRow | null>(null)
  const [voidReason,  setVoidReason]  = useState('')
  const [bannerVisible, setBannerVisible] = useState(true)

  const failedCount = PAYMENTS.filter(p => p.emailStatus === 'failed' && p.status === 'active').length

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

      <PageHead
        title="Payments & Receipts"
        subtitle="audit list of every recorded payment + the receipt it generated · 1 row per payment"
        actions={
          <>
            <Button variant="default">
              <Download size={13} strokeWidth={1.75} /> Export
            </Button>
            {failedCount > 0 && (
              <Button variant="default">
                Resend failed ({failedCount})
              </Button>
            )}
          </>
        }
      />

      {/* Audit-only notice */}
      {bannerVisible && (
        <Banner variant="info" onDismiss={() => setBannerVisible(false)} className="mb-4">
          Recording happens on the bill — open any posted bill and use the inline Record Payment form.
          This page is for <strong>audit &amp; export</strong> only.
        </Banner>
      )}

      {/* Filter chip bar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <FilterChip label="date"     value="last 30d"          />
        <FilterChip label="property" value="all"               />
        <FilterChip label="mode"     value="any"               />
        <FilterChip label="type"     value="regular + advance" />
        <FilterChip label="email"    value="any"               />
        <FilterChip label="status"   value="active"            />
        <span className="ml-auto text-[12.5px] text-ink-4">{PAYMENTS.length} results</span>
      </div>

      {/* Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b border-border">
                <th className={TH}>Date</th>
                <th className={TH}>Tenant</th>
                <th className={TH}>Bill #</th>
                <th className={TH}>Type</th>
                <th className={`${TH} text-right`}>Amount</th>
                <th className={TH}>Mode</th>
                <th className={TH}>Receipt #</th>
                <th className={TH}>Email</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map(row => {
                const isVoid     = row.status === 'void'
                const isSelected = selected?.id === row.id
                const { label: emailLabel, variant: emailVariant } = EMAIL_PILL[row.emailStatus]

                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelected(row)}
                    className={[
                      'border-b border-border-subtle transition-ui cursor-pointer',
                      isVoid     ? 'opacity-50'      : '',
                      isSelected ? 'bg-accent-tint'  : 'hover:bg-surface-2',
                    ].join(' ')}
                  >
                    <td className={`${TD} py-[var(--pad-row)] font-mono text-[12px] text-ink-3`}>{row.date}</td>
                    <td className={`${TD} py-[var(--pad-row)]`}>{row.tenant}</td>
                    <td className={`${TD} py-[var(--pad-row)] font-mono text-[12.5px] text-ink font-medium`}>{row.billId}</td>
                    <td className={`${TD} py-[var(--pad-row)]`}>
                      {row.type === 'advance'
                        ? <Pill variant="accent">advance</Pill>
                        : <Pill variant="neutral">regular</Pill>
                      }
                    </td>
                    <td className={`${TD} py-[var(--pad-row)] text-right font-mono font-medium text-ink`}>
                      {fmtPHP(row.amountPHP)}
                    </td>
                    <td className={`${TD} py-[var(--pad-row)] capitalize`}>{row.mode}</td>
                    <td className={`${TD} py-[var(--pad-row)] font-mono text-[12.5px]`}>{row.receiptNo}</td>
                    <td className={`${TD} py-[var(--pad-row)]`}>
                      <Pill variant={emailVariant}>{emailLabel}</Pill>
                    </td>
                    <td className={`${TD} py-[var(--pad-row)]`}>
                      {isVoid
                        ? <Pill variant="neutral">Void</Pill>
                        : <Pill variant="neutral">Active</Pill>
                      }
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
        title="Payment record"
        subtitle={selected ? selected.receiptNo : ''}
        actions={
          selected ? (
            <Button size="sm" variant="primary">
              open bill <ChevronRight size={12} strokeWidth={2} />
            </Button>
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
                className="w-full justify-center"
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
