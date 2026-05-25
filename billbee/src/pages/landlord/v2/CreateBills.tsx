import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Upload } from 'lucide-react'
import { MOCK_ROOMS } from '../../../data/mock'
import { Button } from '../../../components/ui/Button'

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(n: number) {
  return `₱${n.toLocaleString('en-PH')}`
}

/* ── Types ─────────────────────────────────────────────────── */

interface TenantBillEntry {
  key:        string
  roomName:   string
  tenantName: string
  rentPHP:    number
  waterPHP:   number
  elecPHP:    number
}

function rowTotal(e: TenantBillEntry) {
  return e.rentPHP + e.waterPHP + e.elecPHP
}

/* ── Shared table styles ───────────────────────────────────── */

const COL5 = 'grid-cols-[2fr_1fr_1fr_1fr_1.2fr]'
const HEAD_CELL = 'px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3'

/* ── Step 1: Enter charges ─────────────────────────────────── */

function NumberInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center border border-border rounded-btn overflow-hidden focus-within:border-accent transition-ui bg-surface">
      <span className="pl-2.5 text-[13px] text-ink-4 select-none">₱</span>
      <input
        type="number"
        min={0}
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="flex-1 px-2 py-1.5 text-[13.5px] font-mono text-ink bg-transparent outline-none min-w-0 w-full"
      />
    </div>
  )
}

function Step1({
  entries,
  onChange,
  onNext,
}: {
  entries: TenantBillEntry[]
  onChange: (key: string, field: 'waterPHP' | 'elecPHP', value: number) => void
  onNext: () => void
}) {
  const grandTotal = entries.reduce((s, e) => s + rowTotal(e), 0)

  return (
    <div>
      {/* Subtitle + import button */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <p className="text-[14px] text-ink-3 leading-relaxed">
          Rent is pre-filled from your room settings. Enter water and electricity charges for each tenant, then click <strong className="text-ink font-medium">Review bills</strong>.
        </p>
        <button
          type="button"
          className="shrink-0 flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-accent border border-border hover:border-accent/40 rounded-btn px-3 py-1.5 transition-ui whitespace-nowrap"
        >
          <Upload size={13} strokeWidth={1.75} />
          Import from file
        </button>
      </div>

      {/* Table */}
      <div className="border border-border rounded-btn overflow-hidden mb-5">
        {/* Header */}
        <div className={`grid ${COL5} bg-surface-2 border-b border-border`}>
          {['Tenant / Room', 'Rent', 'Water (₱)', 'Electricity (₱)', 'Total'].map(h => (
            <div key={h} className={HEAD_CELL}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {entries.map(entry => (
          <div
            key={entry.key}
            className={`grid ${COL5} border-b border-border last:border-0 items-center bg-surface`}
          >
            <div className="px-4 py-3">
              <p className="text-[13.5px] font-medium text-ink">{entry.tenantName}</p>
              <p className="text-[12px] text-ink-4">Room {entry.roomName}</p>
            </div>
            <div className="px-4 py-3">
              <span className="font-mono text-[13.5px] text-ink-2">{fmtPHP(entry.rentPHP)}</span>
            </div>
            <div className="px-3 py-2">
              <NumberInput value={entry.waterPHP} onChange={v => onChange(entry.key, 'waterPHP', v)} />
            </div>
            <div className="px-3 py-2">
              <NumberInput value={entry.elecPHP} onChange={v => onChange(entry.key, 'elecPHP', v)} />
            </div>
            <div className="px-4 py-3">
              <span className="font-mono text-[14px] font-semibold text-ink">{fmtPHP(rowTotal(entry))}</span>
            </div>
          </div>
        ))}

        {/* Footer total */}
        <div className={`grid ${COL5} bg-surface-2 border-t border-border`}>
          <div className="px-4 py-3 col-span-4">
            <span className="text-[13px] font-semibold text-ink">
              {entries.length} bills · Grand total
            </span>
          </div>
          <div className="px-4 py-3">
            <span className="font-mono text-[15px] font-bold text-ink">{fmtPHP(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="accent" size="md" onClick={onNext}>
          Review bills
          <ArrowRight size={14} strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  )
}

/* ── Step 2: Review & confirm ──────────────────────────────── */

const COL5_R = 'grid-cols-[2fr_1fr_1fr_1fr_1.2fr]'

function Step2({
  entries,
  dueDate,
  onDueDateChange,
  onBack,
  onConfirm,
}: {
  entries: TenantBillEntry[]
  dueDate: string
  onDueDateChange: (d: string) => void
  onBack: () => void
  onConfirm: () => void
}) {
  const grandTotal = entries.reduce((s, e) => s + rowTotal(e), 0)

  return (
    <div>
      <p className="text-[14px] text-ink-3 mb-5 leading-relaxed">
        Once you confirm, a <strong className="text-ink font-medium">draft bill</strong> will be created for each tenant. You can review each one before sending it to your tenants.
      </p>

      {/* Due date */}
      <div className="flex items-center gap-3 mb-5 px-4 py-3 border border-border rounded-btn bg-surface">
        <span className="text-[13.5px] font-medium text-ink">Due date</span>
        <input
          type="date"
          value={dueDate}
          onChange={e => onDueDateChange(e.target.value)}
          className="border border-border rounded-btn px-3 py-1.5 text-[13.5px] text-ink bg-surface focus:outline-none focus:border-accent transition-ui"
        />
        <span className="text-[12px] text-ink-4 ml-auto">Tenants will see this on their bill</span>
      </div>

      {/* Review table */}
      <div className="border border-border rounded-btn overflow-hidden mb-5">
        <div className={`grid ${COL5_R} bg-surface-2 border-b border-border`}>
          {['Tenant / Room', 'Rent', 'Water', 'Electricity', 'Total'].map(h => (
            <div key={h} className={HEAD_CELL}>{h}</div>
          ))}
        </div>

        {entries.map(entry => (
          <div
            key={entry.key}
            className={`grid ${COL5_R} border-b border-border last:border-0 items-center bg-surface`}
          >
            <div className="px-4 py-2.5">
              <p className="text-[13.5px] font-medium text-ink">{entry.tenantName}</p>
              <p className="text-[12px] text-ink-4">Room {entry.roomName}</p>
            </div>
            <div className="px-4 py-2.5 font-mono text-[13.5px] text-ink-2">{fmtPHP(entry.rentPHP)}</div>
            <div className="px-4 py-2.5 font-mono text-[13.5px] text-ink-2">{fmtPHP(entry.waterPHP)}</div>
            <div className="px-4 py-2.5 font-mono text-[13.5px] text-ink-2">{fmtPHP(entry.elecPHP)}</div>
            <div className="px-4 py-2.5 font-mono text-[14px] font-semibold text-ink">{fmtPHP(rowTotal(entry))}</div>
          </div>
        ))}

        <div className={`grid ${COL5_R} bg-surface-2 border-t border-border`}>
          <div className="px-4 py-3 col-span-4">
            <span className="text-[13px] font-semibold text-ink">
              {entries.length} bills · Grand total
            </span>
          </div>
          <div className="px-4 py-3">
            <span className="font-mono text-[15px] font-bold text-ink">{fmtPHP(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="md" onClick={onBack}>
          <ArrowLeft size={14} strokeWidth={1.75} />
          Back
        </Button>
        <Button variant="accent" size="md" onClick={onConfirm}>
          <Check size={14} strokeWidth={2} />
          Create {entries.length} bills
        </Button>
      </div>
    </div>
  )
}

/* ── Step indicator ────────────────────────────────────────── */

function StepBar({ step }: { step: 1 | 2 }) {
  const steps = [
    { n: 1, label: 'Enter charges' },
    { n: 2, label: 'Review & confirm' },
  ]
  return (
    <div className="flex items-center gap-3 mb-7">
      {steps.map(({ n, label }, i) => {
        const done   = step > n
        const active = step === n
        return (
          <div key={n} className="flex items-center gap-2">
            <div
              className={[
                'w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-ui',
                done   ? 'bg-success text-white' :
                active ? 'bg-ink text-white'     :
                         'bg-surface-2 text-ink-4 border border-border',
              ].join(' ')}
            >
              {done ? '✓' : n}
            </div>
            <span className={`text-[13.5px] font-medium ${active ? 'text-ink' : 'text-ink-3'}`}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <ArrowRight size={13} strokeWidth={1.75} className="text-ink-4 ml-1 shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Success screen ────────────────────────────────────────── */

function SuccessScreen() {
  return (
    <main className="flex items-center justify-center min-h-[40vh]">
      <div className="text-center">
        <p className="text-[48px] mb-3">✅</p>
        <p className="text-[20px] font-semibold text-ink">Bills created!</p>
        <p className="text-[14px] text-ink-3 mt-1">Taking you back to the cycle…</p>
      </div>
    </main>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

export function CreateBills() {
  const navigate      = useNavigate()
  const [searchParams] = useSearchParams()
  const propertyId    = searchParams.get('property') ?? 'sunset-mar-2026'

  /* Build tenant rows from occupied rooms */
  const initialEntries = useMemo<TenantBillEntry[]>(() =>
    MOCK_ROOMS
      .filter(r => r.status === 'active' && r.tenants.length > 0)
      .flatMap(room =>
        room.tenants.map(t => ({
          key:        `${room.id}-${t.id}`,
          roomName:   room.name,
          tenantName: t.name,
          rentPHP:    Math.round(room.monthlyRentPHP / Math.max(1, room.tenants.length)),
          waterPHP:   0,
          elecPHP:    0,
        }))
      ),
  [])

  const [step,    setStep]    = useState<1 | 2>(1)
  const [entries, setEntries] = useState<TenantBillEntry[]>(initialEntries)
  const [dueDate, setDueDate] = useState('2026-03-15')
  const [done,    setDone]    = useState(false)

  function handleChange(key: string, field: 'waterPHP' | 'elecPHP', value: number) {
    setEntries(prev => prev.map(e => e.key === key ? { ...e, [field]: value } : e))
  }

  function handleConfirm() {
    setDone(true)
    setTimeout(() => navigate(`/landlord/billing-v2/cycle/${propertyId}`), 1400)
  }

  if (done) return <SuccessScreen />

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1100px] mx-auto w-full">

      {/* Back */}
      <button
        type="button"
        onClick={() => (step === 2 ? setStep(1) : navigate(-1))}
        className="flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink transition-colors mb-5"
      >
        <ArrowLeft size={14} strokeWidth={1.75} />
        {step === 2 ? 'Back to entry' : 'Back'}
      </button>

      {/* Header */}
      <div className="mb-5">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink leading-tight">
          Create March 2026 Bills
        </h1>
        <p className="text-[14px] text-ink-3 mt-0.5">Sunset Apartments</p>
      </div>

      <StepBar step={step} />

      {step === 1
        ? <Step1 entries={entries} onChange={handleChange} onNext={() => setStep(2)} />
        : <Step2
            entries={entries}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
            onBack={() => setStep(1)}
            onConfirm={handleConfirm}
          />
      }

    </main>
  )
}
