import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RecordPaymentDrawer } from './RecordPaymentDrawer'
import { RecordAdvanceDrawer } from './RecordAdvanceDrawer'
import type { AdvanceSuccessData } from './RecordAdvanceDrawer'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  Printer,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { StatusBadge } from '../../components/ui/StatusBadge'

/* ── Types ─────────────────────────────────────────────────── */

type ChargeType = 'fixed' | 'non-fixed'

interface ChargeLine {
  id: string
  name: string
  amount: number
  type: ChargeType
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

/* ── Charge type tag ───────────────────────────────────────── */

function TypeTag({ type }: { type: ChargeType }) {
  return (
    <span
      className={[
        'inline-flex items-center px-1.5 py-px rounded border text-[10px] font-mono font-medium shrink-0',
        type === 'non-fixed'
          ? 'bg-accent-soft text-accent-2 border-accent-soft'
          : 'bg-surface-2 text-ink-4 border-border',
      ].join(' ')}
    >
      {type === 'non-fixed' ? 'NON-FIXED' : 'FIXED'}
    </span>
  )
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
              <TypeTag type={line.type} />
              <span
                className={[
                  'font-mono text-[13px] w-[68px] text-right shrink-0',
                  line.amount < 0 ? 'text-success' : 'text-ink',
                ].join(' ')}
              >
                {signedFmt(line.amount)}
              </span>
              {/* Spacer to align with DraftBill's edit button column */}
              <span className="w-[44px] shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Sidebar summary row ───────────────────────────────────── */

function SummaryRow({
  label,
  value,
  muted = false,
  strong = false,
}: {
  label: string
  value: string
  muted?: boolean
  strong?: boolean
}) {
  return (
    <div className={`flex items-baseline justify-between py-1.5 ${muted ? 'opacity-50' : ''}`}>
      <span className={`text-[12.5px] ${strong ? 'font-semibold text-ink' : 'text-ink-3'}`}>
        {label}
      </span>
      <span
        className={`font-mono ${strong ? 'text-[13.5px] font-semibold text-ink' : 'text-[13px] text-ink-2'}`}
      >
        {value}
      </span>
    </div>
  )
}

/* ── Mock data ─────────────────────────────────────────────── */

const BILL = {
  id:          'BILL-26-00041',
  tenant:      'J. Cruz',
  room:        'A-101',
  period:      'Mar 2026',
  dueDate:     'Mar 15',
  generatedOn: 'Mar 9',
  totalPHP:    4250,
  paidPHP:     0,
}

const SECTIONS: ChargeSection[] = [
  {
    id: 'rent',
    label: 'Rent',
    lines: [
      { id: 'r1', name: 'Rent', amount: 3000, type: 'fixed' },
    ],
  },
  {
    id: 'utilities',
    label: 'Utilities',
    lines: [
      { id: 'u1', name: 'Water',       amount: 150, type: 'non-fixed' },
      { id: 'u2', name: 'Electricity', amount: 400, type: 'non-fixed' },
    ],
  },
  {
    id: 'amenities',
    label: 'Amenities',
    lines: [
      { id: 'am1', name: 'Wi-Fi',      amount: 100, type: 'fixed' },
      { id: 'am2', name: 'Parking',    amount: 500, type: 'fixed' },
      { id: 'am3', name: 'Laptop fee', amount: 100, type: 'fixed' },
    ],
  },
  {
    id: 'penalty',
    label: 'Penalty',
    lines: [
      { id: 'pen1', name: 'Prior balance adj.', amount: -200, type: 'fixed' },
    ],
  },
  {
    id: 'advance',
    label: 'Advance Coverage',
    lines: [
      { id: 'adv1', name: 'Advance applied', amount: -500, type: 'fixed' },
    ],
  },
]

/* ── Page ──────────────────────────────────────────────────── */

export function PostedBill() {
  const navigate = useNavigate()

  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false)
  const [advanceDrawerOpen, setAdvanceDrawerOpen] = useState(false)
  const [paidPHP,           setPaidPHP]           = useState(BILL.paidPHP)
  const [advanceConfirm,    setAdvanceConfirm]     = useState<AdvanceSuccessData | null>(null)

  const allLines   = SECTIONS.flatMap(s => s.lines)
  const grandTotal = allLines.reduce((s, l) => s + l.amount, 0)

  const sum = (sid: string) =>
    SECTIONS.find(s => s.id === sid)?.lines.reduce((a, l) => a + l.amount, 0) ?? 0

  const rentTotal      = sum('rent')
  const utilitiesTotal = sum('utilities')
  const amenitiesTotal = sum('amenities')
  const penaltyTotal   = sum('penalty')
  const advanceCovered = sum('advance')
  const subTotal       = rentTotal + utilitiesTotal + amenitiesTotal + penaltyTotal
  const totalDue       = subTotal + advanceCovered
  const balance        = totalDue - paidPHP
  const isPaid         = balance <= 0

  function handlePaymentSuccess(amountPaid: number) {
    setPaidPHP(prev => prev + amountPaid)
  }

  function handleAdvanceSuccess(data: AdvanceSuccessData) {
    setAdvanceConfirm(data)
  }

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

      {/* Page header */}
      <div className="flex items-start gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
            <h1 className="font-display text-[24px] font-semibold tracking-[-0.02em] text-ink leading-tight">
              {BILL.id}
            </h1>
            <StatusBadge status={isPaid ? 'paid' : 'posted'} />
          </div>
          <p className="text-[13px] text-ink-3 mt-0.5">
            {BILL.tenant} · {BILL.room} · period {BILL.period} · due {BILL.dueDate}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <Button size="sm" variant="default">
            <ChevronLeft size={12} strokeWidth={2} /> prev
          </Button>
          <Button size="sm" variant="default">
            next <ChevronRight size={12} strokeWidth={2} />
          </Button>
          <Button size="sm" variant="default">
            <Download size={12} strokeWidth={1.75} /> PDF
          </Button>
          <Button size="sm" variant="default">
            <Printer size={12} strokeWidth={1.75} /> print
          </Button>
          <Button
            size="sm"
            variant="default"
            className="text-danger border-danger-soft hover:bg-danger-soft hover:border-danger"
          >
            void
          </Button>
          <Button size="sm" variant="accent">
            <Mail size={12} strokeWidth={1.75} /> Send notice
          </Button>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex gap-6 items-start">

        {/* ── LEFT bill panel ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Bill statement card */}
          <Card noPadding>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-baseline gap-3 min-w-0">
                <h2 className="text-[13.5px] font-semibold text-ink">Bill statement</h2>
                <span className="text-[11.5px] text-ink-4 font-mono">
                  generated {BILL.generatedOn} · invoice locked
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => setPaymentDrawerOpen(true)}
                  disabled={isPaid}
                  title={isPaid ? 'Bill is fully paid' : undefined}
                >
                  + Record payment
                </Button>
                <Button size="sm" variant="default" onClick={() => setAdvanceDrawerOpen(true)}>
                  + Record advance
                </Button>
              </div>
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

        {/* ── RIGHT sidebar ── */}
        <div className="w-[280px] shrink-0 sticky top-6 flex flex-col gap-4">

          {/* Previous Period */}
          <Card>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-4 mb-3">
              Previous Period
            </p>
            <SummaryRow label="Amount Due from Previous Period" value={fmtPHP(0)} />
            <div className="border-t border-border my-1" />
            <SummaryRow label="Remaining Balance Due Immediately" value={fmtPHP(0)} strong />
          </Card>

          {/* Current Period breakdown */}
          <Card>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-4 mb-3">
              Current Period
            </p>
            <SummaryRow label="Rent"      value={fmtPHP(rentTotal)} />
            <SummaryRow label="Utilities" value={fmtPHP(utilitiesTotal)} />
            <SummaryRow label="Amenities" value={fmtPHP(amenitiesTotal)} />
            <SummaryRow label="Penalty"   value={signedFmt(penaltyTotal)} />

            <div className="border-t border-border my-2" />
            <SummaryRow label="Sub Total"            value={fmtPHP(subTotal)} strong />
            <SummaryRow label="Tax (0%)"             value="₱0" muted />
            <SummaryRow label="Withholding Tax (0%)" value="₱0" muted />
            <SummaryRow label="Advance Coverage"     value={signedFmt(advanceCovered)} />

            <div className="border-t-2 border-border-strong mt-2 pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-semibold text-ink">Total Amount Due</span>
                <span className="font-mono text-[20px] font-bold text-ink">{fmtPHP(totalDue)}</span>
              </div>
            </div>

            <div className="border-t border-border mt-3 pt-2.5">
              <SummaryRow label="Due Date" value={`${BILL.dueDate}, 2026`} />
            </div>
          </Card>

          {/* Payment status */}
          <Card>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-4 mb-3">
              Payment Status
            </p>
            <SummaryRow label="Total Amount Due" value={fmtPHP(totalDue)} />
            <SummaryRow label="Paid so far"      value={fmtPHP(paidPHP)} />
            <div className="border-t-2 border-border-strong mt-2 pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-semibold text-ink">Current Balance</span>
                <span
                  className={`font-mono text-[20px] font-bold ${
                    balance > 0 ? 'text-danger' : 'text-success'
                  }`}
                >
                  {fmtPHP(balance)}
                </span>
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* Advance confirmation modal */}
      <Modal
        open={advanceConfirm !== null}
        onClose={() => setAdvanceConfirm(null)}
        title="Advance payment recorded"
        subtitle={advanceConfirm ? `Applied to ${advanceConfirm.period}` : undefined}
        width={400}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="default" onClick={() => setAdvanceConfirm(null)}>
              Close
            </Button>
            <Button
              variant="accent"
              onClick={() => {
                if (!advanceConfirm) return
                const p = new URLSearchParams({
                  highlight: advanceConfirm.orNumber,
                  amount:    String(advanceConfirm.amount),
                  period:    advanceConfirm.period,
                  mode:      advanceConfirm.mode,
                  tenant:    advanceConfirm.tenant,
                  billId:    advanceConfirm.billId,
                })
                setAdvanceConfirm(null)
                navigate(`/landlord/payments?${p.toString()}`)
              }}
            >
              View payment record →
            </Button>
          </div>
        }
      >
        {advanceConfirm && (
          <div className="flex flex-col gap-3">
            <p className="text-[13.5px] text-ink-2 leading-relaxed">
              An advance of{' '}
              <strong className="text-ink font-semibold">{fmtPHP(advanceConfirm.amount)}</strong>{' '}
              has been recorded and will be applied to the{' '}
              <strong className="text-ink font-semibold">{advanceConfirm.period}</strong> billing period.
            </p>
            <div className="flex items-center justify-between px-3 py-2 rounded-btn bg-surface-2 border border-border">
              <span className="text-[11.5px] text-ink-3">Official Receipt #</span>
              <span className="font-mono text-[12.5px] font-semibold text-ink">{advanceConfirm.orNumber}</span>
            </div>
          </div>
        )}
      </Modal>

      <RecordAdvanceDrawer
        open={advanceDrawerOpen}
        onClose={() => setAdvanceDrawerOpen(false)}
        onSuccess={handleAdvanceSuccess}
        billId={BILL.id}
        tenant={BILL.tenant}
        period={BILL.period}
      />
      <RecordPaymentDrawer
        open={paymentDrawerOpen}
        onClose={() => setPaymentDrawerOpen(false)}
        onSuccess={handlePaymentSuccess}
        billId={BILL.id}
        tenant={BILL.tenant}
        period={BILL.period}
        balancePHP={balance}
        dueDateLabel={`${BILL.dueDate}, 2026`}
      />
    </main>
  )
}
