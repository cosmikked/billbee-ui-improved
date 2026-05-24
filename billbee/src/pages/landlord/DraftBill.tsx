import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Callout } from '../../components/ui/Callout'

/* ── Types ─────────────────────────────────────────────────── */

type ChargeSource = 'room' | 'room-csv' | 'tenant' | 'imported'

interface ChargeLine {
  id: string
  name: string
  amount: number
  source: ChargeSource
  locked?: boolean
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

/* ── Collapsible charge section ────────────────────────────── */

function SectionBlock({
  label,
  lines,
  onEdit,
}: {
  label: string
  lines: ChargeLine[]
  onEdit: (id: string) => void
}) {
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
              <SourceTag source={line.source} />
              <span
                className={[
                  'font-mono text-[13px] w-[68px] text-right shrink-0',
                  line.amount < 0 ? 'text-success' : 'text-ink',
                ].join(' ')}
              >
                {signedFmt(line.amount)}
              </span>
              {line.locked ? (
                <span className="w-[44px] shrink-0" />
              ) : (
                <button
                  type="button"
                  onClick={() => onEdit(line.id)}
                  className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded border border-border text-[11px] text-ink-3 hover:text-ink hover:border-border-strong transition-colors"
                >
                  <Pencil size={10} strokeWidth={1.75} />
                  edit
                </button>
              )}
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

const INITIAL_SECTIONS: ChargeSection[] = [
  {
    id: 'rent',
    label: 'Rent',
    lines: [
      { id: 'rent-1', name: 'Rent', amount: 3000, source: 'room' },
    ],
  },
  {
    id: 'fixed',
    label: 'Fixed Charges',
    lines: [
      { id: 'fixed-1', name: 'Wi-Fi', amount: 100, source: 'room' },
    ],
  },
  {
    id: 'nonfixed',
    label: 'Non-Fixed Charges',
    lines: [
      { id: 'nf-1', name: 'Water',       amount: 150, source: 'room-csv', locked: true },
      { id: 'nf-2', name: 'Electricity', amount: 400, source: 'room-csv', locked: true },
    ],
  },
  {
    id: 'tenant',
    label: 'Tenant-Specific / Additional Charges',
    lines: [
      { id: 'ts-1', name: 'Parking',           amount:  500, source: 'tenant' },
      { id: 'ts-2', name: 'Laptop fee',         amount:  100, source: 'tenant' },
      { id: 'ts-3', name: 'Prior balance adj.', amount: -200, source: 'imported', locked: true },
    ],
  },
  {
    id: 'advance',
    label: 'Advance Payment Coverage',
    lines: [
      { id: 'adv-1', name: 'Advance applied', amount: -500, source: 'tenant' },
    ],
  },
]

/* ── Page ──────────────────────────────────────────────────── */

export function DraftBill() {
  const [billingDate, setBillingDate] = useState('2026-03-01')
  const [dueDate, setDueDate]         = useState('2026-03-15')
  const [sections]                    = useState(INITIAL_SECTIONS)

  const allLines   = sections.flatMap(s => s.lines)
  const grandTotal = allLines.reduce((s, l) => s + l.amount, 0)

  const sum = (id: string) =>
    sections.find(s => s.id === id)?.lines.reduce((a, l) => a + l.amount, 0) ?? 0

  const rentTotal     = sum('rent')
  const fixedTotal    = sum('fixed')
  const nonfixedTotal = sum('nonfixed')
  const tenantLines   = sections.find(s => s.id === 'tenant')?.lines ?? []
  const tenantSpec    = tenantLines.filter(l => l.source === 'tenant').reduce((a, l) => a + l.amount, 0)
  const additional    = tenantLines.filter(l => l.source === 'imported').reduce((a, l) => a + l.amount, 0)
  const advanceCovered = sum('advance')
  const subTotal      = rentTotal + fixedTotal + nonfixedTotal + tenantSpec + additional
  const totalDue      = subTotal + advanceCovered

  const handleEdit = (_id: string) => { /* stub: open edit modal */ }

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

      {/* Page header */}
      <div className="flex items-start gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
            <h1 className="font-display text-[24px] font-semibold tracking-[-0.02em] text-ink leading-tight">
              Draft DRAFT-001
            </h1>
            <StatusBadge status="draft" />
          </div>
          <p className="text-[13px] text-ink-3 mt-0.5">
            Joseph Cruz · A-101 · period Mar 2026 · due Mar 15
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <Button size="sm" variant="default">
            <ChevronLeft size={12} strokeWidth={2} /> prev
          </Button>
          <Button size="sm" variant="default">
            next <ChevronRight size={12} strokeWidth={2} />
          </Button>
          <Button
            size="sm"
            variant="default"
            className="text-danger border-danger-soft hover:bg-danger-soft hover:border-danger"
          >
            <Trash2 size={12} strokeWidth={1.75} /> delete
          </Button>
          <Button size="sm" variant="default">
            <RefreshCw size={12} strokeWidth={1.75} /> regenerate
          </Button>
          <Button size="sm" variant="accent">
            Post bill <ChevronRight size={12} strokeWidth={2} />
          </Button>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex gap-6 items-start">

        {/* ── LEFT composition panel ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Date inputs */}
          <Card>
            <div className="flex gap-5">
              <label className="flex flex-col gap-1.5 flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
                  Billing Date
                </span>
                <input
                  type="date"
                  value={billingDate}
                  onChange={e => setBillingDate(e.target.value)}
                  className="border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface focus:outline-none focus:border-accent transition-colors"
                />
              </label>
              <label className="flex flex-col gap-1.5 flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
                  Due Date
                </span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface focus:outline-none focus:border-accent transition-colors"
                />
              </label>
            </div>
          </Card>

          {/* Current Charges */}
          <Card noPadding>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-[13.5px] font-semibold text-ink">Current Charges</h2>
              <span className="font-mono text-[13px] font-semibold text-ink">{fmtPHP(grandTotal)}</span>
            </div>

            {sections.map(section => (
              <SectionBlock
                key={section.id}
                label={section.label}
                lines={section.lines}
                onEdit={handleEdit}
              />
            ))}

            <div className="flex items-center justify-between px-4 py-3 border-t-2 border-border-strong bg-surface-2">
              <span className="text-[13.5px] font-semibold text-ink">Total</span>
              <span className="font-mono text-[15px] font-bold text-ink">{fmtPHP(grandTotal)}</span>
            </div>
          </Card>

          {/* Add line buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="default">+ add adjustment</Button>
            <Button size="sm" variant="default">+ add discount</Button>
            <Button size="sm" variant="default">+ add penalty</Button>
          </div>

          {/* CSV import warning */}
          <Callout variant="warning" icon={<AlertTriangle size={16} strokeWidth={1.75} />}>
            <span className="text-[13px]">
              Non-fixed charges (water, electricity) were imported from a CSV upload and{' '}
              <strong className="font-semibold text-ink">cannot be edited here</strong>.{' '}
              To update these values, re-upload a corrected CSV from the Generate Bills flow.
            </span>
          </Callout>
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
            <SummaryRow label="Rent"               value={fmtPHP(rentTotal)} />
            <SummaryRow label="Fixed Charges"      value={fmtPHP(fixedTotal)} />
            <SummaryRow label="Non-Fixed Charges"  value={fmtPHP(nonfixedTotal)} />
            <SummaryRow label="Tenant-Specific"    value={fmtPHP(tenantSpec)} />
            <SummaryRow label="Additional Charges" value={signedFmt(additional)} />

            <div className="border-t border-border my-2" />
            <SummaryRow label="Sub Total"            value={fmtPHP(subTotal)} strong />
            <SummaryRow label="Tax (0%)"             value="₱0" muted />
            <SummaryRow label="Withholding Tax (0%)" value="₱0" muted />
            <SummaryRow label="Advance Covered"      value={signedFmt(advanceCovered)} />

            <div className="border-t-2 border-border-strong mt-2 pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-semibold text-ink">Total Amount Due</span>
                <span className="font-mono text-[20px] font-bold text-ink">{fmtPHP(totalDue)}</span>
              </div>
            </div>

            <div className="border-t border-border mt-3 pt-2.5">
              <SummaryRow label="Due Date" value="Mar 15, 2026" />
            </div>
          </Card>

        </div>
      </div>
    </main>
  )
}
