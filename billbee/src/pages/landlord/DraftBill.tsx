import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from 'lucide-react'
import { MOCK_CYCLE_DETAIL } from '../../data/mock'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Callout } from '../../components/ui/Callout'
import { Modal } from '../../components/ui/Modal'

/* ── Types ─────────────────────────────────────────────────── */

type ChargeType = 'fixed' | 'non-fixed'

interface ChargeLine {
  id: string
  name: string
  amount: number
  type: ChargeType
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

/* ── Collapsible charge section ────────────────────────────── */

function SectionBlock({
  label,
  lines,
  editingId,
  editingValue,
  onEdit,
  onEditChange,
  onEditSave,
  onEditCancel,
}: {
  label: string
  lines: ChargeLine[]
  editingId: string | null
  editingValue: string
  onEdit: (id: string, current: number) => void
  onEditChange: (v: string) => void
  onEditSave: () => void
  onEditCancel: () => void
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
          {lines.map(line => {
            const isEditing = editingId === line.id
            return (
              <div key={line.id} className="flex items-center gap-2.5 px-4 py-1.5">
                <span className="flex-1 text-[13px] text-ink-2 truncate">{line.name}</span>
                <TypeTag type={line.type} />

                {isEditing ? (
                  /* ── inline edit row ── */
                  <>
                    <div className="relative w-[90px] shrink-0">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-ink-3 pointer-events-none select-none">₱</span>
                      <input
                        type="number"
                        value={editingValue}
                        onChange={e => onEditChange(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter')  { e.preventDefault(); onEditSave() }
                          if (e.key === 'Escape') { e.preventDefault(); onEditCancel() }
                        }}
                        autoFocus
                        className="w-full pl-5 pr-2 py-0.5 text-[13px] font-mono text-ink border border-accent rounded focus:outline-none bg-surface"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={onEditSave}
                      className="shrink-0 px-1.5 py-0.5 rounded border border-accent bg-accent text-white text-[11px] font-medium hover:bg-accent/90 transition-colors"
                    >
                      save
                    </button>
                    <button
                      type="button"
                      onClick={onEditCancel}
                      className="shrink-0 px-1.5 py-0.5 rounded border border-border text-[11px] text-ink-3 hover:text-ink hover:border-border-strong transition-colors"
                    >
                      cancel
                    </button>
                  </>
                ) : (
                  /* ── display row ── */
                  <>
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
                        onClick={() => onEdit(line.id, line.amount)}
                        className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded border border-border text-[11px] text-ink-3 hover:text-ink hover:border-border-strong transition-colors"
                      >
                        <Pencil size={10} strokeWidth={1.75} />
                        edit
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })}
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
      { id: 'rent-1', name: 'Rent', amount: 3000, type: 'fixed' },
    ],
  },
  {
    id: 'utilities',
    label: 'Utilities',
    lines: [
      { id: 'util-1', name: 'Water',       amount: 150, type: 'non-fixed', locked: true },
      { id: 'util-2', name: 'Electricity', amount: 400, type: 'non-fixed', locked: true },
    ],
  },
  {
    id: 'amenities',
    label: 'Amenities',
    lines: [
      { id: 'am-1', name: 'Wi-Fi',      amount: 100, type: 'fixed' },
      { id: 'am-2', name: 'Parking',    amount: 500, type: 'fixed' },
      { id: 'am-3', name: 'Laptop fee', amount: 100, type: 'fixed' },
    ],
  },
  {
    id: 'penalty',
    label: 'Penalty',
    lines: [
      { id: 'pen-1', name: 'Prior balance adj.', amount: -200, type: 'fixed', locked: true },
    ],
  },
  {
    id: 'advance',
    label: 'Advance Coverage',
    lines: [
      { id: 'adv-1', name: 'Advance applied', amount: -500, type: 'fixed' },
    ],
  },
]

/* ── Page ──────────────────────────────────────────────────── */

// Draft bills in cycle order — used for prev/next navigation
const DRAFT_BILLS = MOCK_CYCLE_DETAIL.bills.filter(b => b.status === 'draft')

export function DraftBill() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()

  const [billingDate,   setBillingDate]   = useState('2026-03-01')
  const [dueDate,       setDueDate]       = useState('2026-03-15')
  const [sections,      setSections]      = useState(INITIAL_SECTIONS)
  const [deleteOpen,    setDeleteOpen]    = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [editingId,     setEditingId]     = useState<string | null>(null)
  const [editingValue,  setEditingValue]  = useState('')

  // Current bill & neighbours
  const currentIdx = DRAFT_BILLS.findIndex(b => b.id === id)
  const bill       = DRAFT_BILLS[currentIdx] ?? DRAFT_BILLS[0]
  const prevBill   = DRAFT_BILLS[currentIdx - 1] ?? null
  const nextBill   = DRAFT_BILLS[currentIdx + 1] ?? null

  const allLines   = sections.flatMap(s => s.lines)
  const grandTotal = allLines.reduce((s, l) => s + l.amount, 0)

  const sum = (sid: string) =>
    sections.find(s => s.id === sid)?.lines.reduce((a, l) => a + l.amount, 0) ?? 0

  const rentTotal      = sum('rent')
  const utilitiesTotal = sum('utilities')
  const amenitiesTotal = sum('amenities')
  const penaltyTotal   = sum('penalty')
  const advanceCovered = sum('advance')
  const subTotal       = rentTotal + utilitiesTotal + amenitiesTotal + penaltyTotal
  const totalDue       = subTotal + advanceCovered

  function handleEdit(id: string, current: number) {
    setEditingId(id)
    setEditingValue(String(current))
  }

  function handleEditSave() {
    if (!editingId) return
    const parsed = parseFloat(editingValue)
    if (isNaN(parsed)) { handleEditCancel(); return }
    setSections(prev =>
      prev.map(section => ({
        ...section,
        lines: section.lines.map(line =>
          line.id === editingId ? { ...line, amount: parsed } : line,
        ),
      })),
    )
    setEditingId(null)
    setEditingValue('')
  }

  function handleEditCancel() {
    setEditingId(null)
    setEditingValue('')
  }

  function handlePrev() {
    if (prevBill) navigate(`/landlord/billing/draft/${prevBill.id}`)
  }

  function handleNext() {
    if (nextBill) navigate(`/landlord/billing/draft/${nextBill.id}`)
  }

  function handleDelete() {
    setDeleting(true)
    // Simulate async delete
    setTimeout(() => {
      setDeleting(false)
      setDeleteOpen(false)
      // Navigate to next draft, or prev, or back to the cycle
      if (nextBill) navigate(`/landlord/billing/draft/${nextBill.id}`)
      else if (prevBill) navigate(`/landlord/billing/draft/${prevBill.id}`)
      else navigate('/landlord/billing/cycle/sunset-mar-2026')
    }, 800)
  }

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

      {/* Delete confirmation modal */}
      <Modal
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        title="Delete draft"
        subtitle={bill?.billNo}
        width={420}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="default" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p className="text-[13.5px] text-ink-2 leading-relaxed">
          Are you sure you want to delete{' '}
          <strong className="text-ink font-semibold">{bill?.billNo}</strong>?
          This action cannot be undone.
        </p>
      </Modal>

      {/* Page header */}
      <div className="flex items-start gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
            <h1 className="font-display text-[24px] font-semibold tracking-[-0.02em] text-ink leading-tight">
              Draft {bill?.billNo ?? 'DRAFT-001'}
            </h1>
            <StatusBadge status="draft" />
          </div>
          <p className="text-[13px] text-ink-3 mt-0.5">
            {bill?.tenant ?? 'Joseph Cruz'} · {bill?.room ?? 'A-101'} · period Mar 2026 · due Mar 15
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <Button
            size="sm"
            variant="default"
            onClick={handlePrev}
            disabled={!prevBill}
            title={prevBill ? `Go to ${prevBill.billNo}` : 'No previous draft'}
          >
            <ChevronLeft size={12} strokeWidth={2} /> prev
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={handleNext}
            disabled={!nextBill}
            title={nextBill ? `Go to ${nextBill.billNo}` : 'No next draft'}
          >
            next <ChevronRight size={12} strokeWidth={2} />
          </Button>
          <Button
            size="sm"
            variant="default"
            className="text-danger border-danger-soft hover:bg-danger-soft hover:border-danger"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={12} strokeWidth={1.75} /> Delete
          </Button>
          <Button size="sm" variant="accent">
            Post bill
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
                editingId={editingId}
                editingValue={editingValue}
                onEdit={handleEdit}
                onEditChange={setEditingValue}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
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
            <SummaryRow label="Rent"       value={fmtPHP(rentTotal)} />
            <SummaryRow label="Utilities"  value={fmtPHP(utilitiesTotal)} />
            <SummaryRow label="Amenities"  value={fmtPHP(amenitiesTotal)} />
            <SummaryRow label="Penalty"    value={signedFmt(penaltyTotal)} />

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
              <SummaryRow label="Due Date" value="Mar 15, 2026" />
            </div>
          </Card>

        </div>
      </div>
    </main>
  )
}
