import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RecordPaymentDrawer } from './RecordPaymentDrawer'
import { RecordAdvanceDrawer } from './RecordAdvanceDrawer'
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
import { StatusBadge } from '../../components/ui/StatusBadge'

/* ── Types ─────────────────────────────────────────────────── */

type ChargeSource = 'room' | 'room-csv' | 'tenant' | 'imported'

interface BillLine {
  id: string
  name: string
  source: ChargeSource
  detail: string
  amount: number
}

interface BillSection {
  id: string
  label: string
  lines: BillLine[]
}

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(value: number): string {
  return `₱${Math.abs(value).toLocaleString('en-PH')}`
}

/* ── Source tag ────────────────────────────────────────────── */

const SOURCE_LABEL: Record<ChargeSource, string> = {
  'room':     'FROM ROOM',
  'room-csv': 'FROM ROOM-CSV',
  'tenant':   'FROM TENANT',
  'imported': 'IMPORTED',
}

function SourceTag({ source }: { source: ChargeSource }) {
  const accent = source === 'imported'
  return (
    <span
      className={[
        'inline-flex items-center px-1.5 py-px rounded border text-[10px] font-mono font-medium shrink-0',
        accent
          ? 'bg-accent-soft text-accent-2 border-accent-soft'
          : 'bg-surface-2 text-ink-4 border-border',
      ].join(' ')}
    >
      {SOURCE_LABEL[source]}
    </span>
  )
}

/* ── Collapsible section (read-only) ───────────────────────── */

function SectionBlock({ label, lines }: { label: string; lines: BillLine[] }) {
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
        <span className="font-mono text-[12.5px] text-ink-3">{fmtPHP(sectionTotal)}</span>
      </button>

      {open && (
        <div className="pb-1.5">
          {lines.map(line => (
            <div key={line.id} className="flex items-center gap-2.5 px-4 py-1.5">
              <span className="flex-1 text-[13px] text-ink-2">{line.name}</span>
              <span className="text-[12px] text-ink-4 font-mono hidden sm:block">{line.detail}</span>
              <SourceTag source={line.source} />
              <span className="font-mono text-[13px] w-[72px] text-right shrink-0 text-ink">
                {fmtPHP(line.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
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

const SECTIONS: BillSection[] = [
  {
    id: 'rent',
    label: 'Rent',
    lines: [
      { id: 'r1', name: 'Rent share', source: 'room', detail: 'A-101 ₱6,000 ÷ 2', amount: 3000 },
    ],
  },
  {
    id: 'fixed',
    label: 'Fixed Charges',
    lines: [
      { id: 'f1', name: 'Wi-Fi share', source: 'room', detail: '₱200 ÷ 2', amount: 100 },
    ],
  },
  {
    id: 'nonfixed',
    label: 'Non-Fixed Charges',
    lines: [
      { id: 'nf1', name: 'Water share', source: 'room-csv', detail: '₱300 ÷ 2', amount: 150 },
      { id: 'nf2', name: 'Elec. share', source: 'room-csv', detail: '₱800 ÷ 2', amount: 400 },
    ],
  },
  {
    id: 'tenant',
    label: 'Tenant-Specific / Additional Charges',
    lines: [
      { id: 'ts1', name: 'Parking Fee', source: 'tenant', detail: 'fixed',            amount: 500 },
      { id: 'ts2', name: 'Laptop fee',  source: 'tenant', detail: 'tenant-specific',   amount: 100 },
    ],
  },
]

/* ── Page ──────────────────────────────────────────────────── */

export function PostedBill() {
  const balance = BILL.totalPHP - BILL.paidPHP
  const [paymentDrawerOpen,  setPaymentDrawerOpen]  = useState(false)
  const [advanceDrawerOpen,  setAdvanceDrawerOpen]  = useState(false)

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

      {/* Page header */}
      <div className="flex items-start gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-[24px] font-semibold tracking-[-0.02em] text-ink leading-tight mb-0.5">
            Bill
            <span className="text-ink-3 font-normal mx-2">·</span>
            {BILL.id}
          </h1>
          <div className="flex items-center gap-2.5 flex-wrap">
            <StatusBadge status="posted" />
            <span className="text-[13px] text-ink-3">
              {BILL.tenant} · {BILL.room} · period {BILL.period} · due {BILL.dueDate}
            </span>
          </div>
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

      {/* Bill statement card */}
      <Card noPadding>

        {/* Card header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border flex-wrap">
          <div className="flex items-baseline gap-3 min-w-0">
            <h2 className="text-[13.5px] font-semibold text-ink">Bill statement</h2>
            <span className="text-[11.5px] text-ink-4 font-mono">
              generated {BILL.generatedOn} · invoice locked
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="accent" onClick={() => setPaymentDrawerOpen(true)}>+ Record payment</Button>
            <Button size="sm" variant="default" onClick={() => setAdvanceDrawerOpen(true)}>+ Record advance</Button>
          </div>
        </div>

        {/* Collapsible charge sections */}
        {SECTIONS.map(section => (
          <SectionBlock key={section.id} label={section.label} lines={section.lines} />
        ))}

        {/* Summary rows */}
        <div className="border-t-2 border-border-strong">

          {/* Total amount due */}
          <div className="flex items-center justify-between px-4 py-3 bg-surface-2">
            <span className="text-[13.5px] font-semibold text-ink">Total amount due</span>
            <span className="font-mono text-[17px] font-bold text-ink">{fmtPHP(BILL.totalPHP)}</span>
          </div>

          {/* Paid so far */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
            <span className="text-[13px] text-ink-3">Paid so far</span>
            <span className="font-mono text-[13px] text-ink-3">{fmtPHP(BILL.paidPHP)}</span>
          </div>

          {/* Current balance */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-[13.5px] font-semibold text-ink">Current balance</span>
            <span
              className={`font-mono text-[15px] font-bold ${
                balance > 0 ? 'text-danger' : 'text-success'
              }`}
            >
              {fmtPHP(balance)}
            </span>
          </div>

        </div>
      </Card>

      {/* PDF preview link */}
      <div className="flex justify-end mt-3">
        <Button size="sm" variant="ghost">
          view PDF preview <ChevronRight size={12} strokeWidth={2} />
        </Button>
      </div>

      <RecordAdvanceDrawer
        open={advanceDrawerOpen}
        onClose={() => setAdvanceDrawerOpen(false)}
        billId={BILL.id}
        tenant={BILL.tenant}
        period={BILL.period}
      />
      <RecordPaymentDrawer
        open={paymentDrawerOpen}
        onClose={() => setPaymentDrawerOpen(false)}
        billId={BILL.id}
        tenant={BILL.tenant}
        period={BILL.period}
        balancePHP={balance}
        dueDateLabel={`${BILL.dueDate}, 2026`}
      />
    </main>
  )
}
