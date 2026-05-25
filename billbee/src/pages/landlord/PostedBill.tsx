import { useState } from 'react'
import { CheckCircle2, ChevronDown, Download, Mail, Printer, X } from 'lucide-react'
import { RecordPaymentDrawer } from './RecordPaymentDrawer'
import type { PaymentResult } from './RecordPaymentDrawer'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'

/* ── Types ─────────────────────────────────────────────────── */

interface ChargeLine {
  id: string
  name: string
  amount: number
}

interface ChargeSection {
  id: string
  label: string
  lines: ChargeLine[]
}

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(value: number): string {
  return `₱${Math.abs(value).toLocaleString('en-PH')}`
}

function signedFmt(value: number): string {
  return value < 0 ? `-${fmtPHP(value)}` : fmtPHP(value)
}

/* ── Collapsible section (read-only) ───────────────────────── */

function SectionBlock({ label, lines }: { label: string; lines: ChargeLine[] }) {
  const [open, setOpen] = useState(true)
  const sectionTotal = lines.reduce((s, l) => s + l.amount, 0)

  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-surface-2 transition-colors text-left"
      >
        <ChevronDown
          size={13}
          strokeWidth={1.75}
          className={`text-ink-4 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`}
        />
        <span className="flex-1 text-[13px] font-semibold text-ink">{label}</span>
        <span className="font-mono text-[12.5px] text-ink-3">{signedFmt(sectionTotal)}</span>
      </button>

      {open && (
        <div className="pb-1.5">
          {lines.map(line => (
            <div key={line.id} className="flex items-center gap-2.5 px-4 py-1.5">
              <span className="flex-1 text-[13px] text-ink-2 truncate">{line.name}</span>
              <span
                className={[
                  'font-mono text-[13px] w-[80px] text-right shrink-0',
                  line.amount < 0 ? 'text-success' : 'text-ink',
                ].join(' ')}
              >
                {signedFmt(line.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Sidebar summary row ───────────────────────────────────── */

function SummaryRow({
  label, value, muted = false, strong = false,
}: {
  label: string; value: string; muted?: boolean; strong?: boolean
}) {
  return (
    <div className={`flex items-baseline justify-between py-1.5 ${muted ? 'opacity-40' : ''}`}>
      <span className={`text-[12.5px] ${strong ? 'font-semibold text-ink' : 'text-ink-3'}`}>{label}</span>
      <span className={`font-mono ${strong ? 'text-[13.5px] font-semibold text-ink' : 'text-[13px] text-ink-2'}`}>
        {value}
      </span>
    </div>
  )
}

/* ── Mock data ─────────────────────────────────────────────── */

const BILL = {
  id:          'BILL-26-00041',
  tenant:      'J. Cruz',
  tenantFull:  'Joseph Cruz',
  room:        'A-101',
  period:      'Mar 2026',
  dueDate:     'Mar 15',
  generatedOn: 'Mar 9',
  paidPHP:     0,
}

const SECTIONS: ChargeSection[] = [
  {
    id: 'rent',
    label: 'Rent',
    lines: [{ id: 'r1', name: 'Monthly rent', amount: 3000 }],
  },
  {
    id: 'utilities',
    label: 'Utilities',
    lines: [
      { id: 'u1', name: 'Water',       amount: 150 },
      { id: 'u2', name: 'Electricity', amount: 400 },
    ],
  },
  {
    id: 'amenities',
    label: 'Amenities',
    lines: [
      { id: 'am1', name: 'Wi-Fi',      amount: 100 },
      { id: 'am2', name: 'Parking',    amount: 500 },
      { id: 'am3', name: 'Laptop fee', amount: 100 },
    ],
  },
  {
    id: 'penalty',
    label: 'Adjustments',
    lines: [
      { id: 'pen1', name: 'Prior balance adj.', amount: -200 },
      { id: 'adv1', name: 'Advance applied',    amount: -500 },
    ],
  },
]

/* ── Page ──────────────────────────────────────────────────── */

interface AdvanceStrip {
  period: string
  amount: number
  orNumber: string
}

export function PostedBill() {
  const [drawerOpen,    setDrawerOpen]    = useState(false)
  const [paidPHP,       setPaidPHP]       = useState(BILL.paidPHP)
  const [advanceStrip,  setAdvanceStrip]  = useState<AdvanceStrip | null>(null)

  const allLines   = SECTIONS.flatMap(s => s.lines)
  const grandTotal = allLines.reduce((s, l) => s + l.amount, 0)

  const sum = (sid: string) =>
    SECTIONS.find(s => s.id === sid)?.lines.reduce((a, l) => a + l.amount, 0) ?? 0

  const rentTotal       = sum('rent')
  const utilitiesTotal  = sum('utilities')
  const amenitiesTotal  = sum('amenities')
  const adjustments     = sum('penalty')
  const balance         = grandTotal - paidPHP
  const isPaid          = balance <= 0

  function handleSuccess(result: PaymentResult) {
    if (result.kind === 'regular') {
      setPaidPHP(prev => prev + result.amountPaid)
    } else {
      setAdvanceStrip({
        period:   result.period,
        amount:   result.amount,
        orNumber: result.orNumber,
      })
    }
  }

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

      {/* Page header — tenant-first title */}
      <div className="flex items-start gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
            <h1 className="font-display text-[24px] font-semibold tracking-[-0.02em] text-ink leading-tight">
              {BILL.tenantFull} — {BILL.period}
            </h1>
            <StatusBadge status={isPaid ? 'paid' : 'posted'} />
          </div>
          <p className="text-[13px] text-ink-3 mt-0.5">
            Room {BILL.room} · due {BILL.dueDate} · bill {BILL.id}
          </p>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <Button size="sm" variant="default">
            <Download size={12} strokeWidth={1.75} /> PDF
          </Button>
          <Button size="sm" variant="default">
            <Printer size={12} strokeWidth={1.75} /> Print
          </Button>
          <Button
            size="sm"
            variant="default"
            className="text-danger border-danger-soft hover:bg-danger-soft hover:border-danger"
          >
            Void
          </Button>
          <Button size="sm" variant="default">
            <Mail size={12} strokeWidth={1.75} /> Send to tenant
          </Button>
        </div>
      </div>

      {/* Advance payment strip */}
      {advanceStrip && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-btn border border-success/30 bg-success/5">
          <CheckCircle2 size={16} strokeWidth={1.75} className="text-success shrink-0" />
          <p className="flex-1 text-[13.5px] text-ink">
            <strong className="font-semibold">Advance of ₱{advanceStrip.amount.toLocaleString('en-PH')} recorded</strong>
            {' '}for {advanceStrip.period}.{' '}
            <span className="text-ink-3 font-mono text-[12px]">{advanceStrip.orNumber}</span>
          </p>
          <button
            type="button"
            onClick={() => setAdvanceStrip(null)}
            className="text-ink-4 hover:text-ink transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} strokeWidth={1.75} />
          </button>
        </div>
      )}

      {/* Split layout */}
      <div className="flex gap-6 items-start">

        {/* ── LEFT: bill statement ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <Card noPadding>
            {/* Card header with single Record payment button */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-baseline gap-3 min-w-0">
                <h2 className="text-[13.5px] font-semibold text-ink">Bill statement</h2>
                <span className="text-[11.5px] text-ink-4 font-mono">
                  generated {BILL.generatedOn} · locked
                </span>
              </div>
              <Button
                size="sm"
                variant="accent"
                onClick={() => setDrawerOpen(true)}
                disabled={isPaid}
                title={isPaid ? 'Bill is fully paid' : undefined}
              >
                + Record payment
              </Button>
            </div>

            {SECTIONS.map(section => (
              <SectionBlock key={section.id} label={section.label} lines={section.lines} />
            ))}

            <div className="flex items-center justify-between px-4 py-3 border-t-2 border-border-strong bg-surface-2">
              <span className="text-[13.5px] font-semibold text-ink">Total</span>
              <span className="font-mono text-[15px] font-bold text-ink">{fmtPHP(grandTotal)}</span>
            </div>
          </Card>
        </div>

        {/* ── RIGHT: sidebar ── */}
        <div className="w-[260px] shrink-0 sticky top-6 flex flex-col gap-4">

          {/* Bill breakdown */}
          <Card>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-4 mb-3">
              Breakdown
            </p>
            <SummaryRow label="Rent"        value={fmtPHP(rentTotal)} />
            <SummaryRow label="Utilities"   value={fmtPHP(utilitiesTotal)} />
            <SummaryRow label="Amenities"   value={fmtPHP(amenitiesTotal)} />
            {adjustments !== 0 && (
              <SummaryRow label="Adjustments" value={signedFmt(adjustments)} />
            )}
            <div className="border-t-2 border-border-strong mt-2 pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-semibold text-ink">Amount Due</span>
                <span className="font-mono text-[20px] font-bold text-ink">{fmtPHP(grandTotal)}</span>
              </div>
              <p className="text-[12px] text-ink-4 mt-0.5">Due {BILL.dueDate}, 2026</p>
            </div>
          </Card>

          {/* Payment status */}
          <Card>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-4 mb-3">
              Payment status
            </p>
            <SummaryRow label="Amount due" value={fmtPHP(grandTotal)} />
            <SummaryRow label="Paid so far" value={fmtPHP(paidPHP)} />
            <div className="border-t-2 border-border-strong mt-2 pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-semibold text-ink">Balance</span>
                <span
                  className={`font-mono text-[22px] font-bold ${
                    isPaid ? 'text-success' : 'text-danger'
                  }`}
                >
                  {isPaid ? '₱0 — Paid ✓' : fmtPHP(balance)}
                </span>
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* Unified payment / advance drawer */}
      <RecordPaymentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={handleSuccess}
        billId={BILL.id}
        tenant={BILL.tenant}
        period={BILL.period}
        balancePHP={balance}
        dueDateLabel={`${BILL.dueDate}, 2026`}
      />
    </main>
  )
}
