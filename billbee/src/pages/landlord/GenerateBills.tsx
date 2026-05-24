import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight, X, Download, AlertTriangle, ArrowRight, ArrowLeft, Info,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardHead } from '../../components/ui/Card'
import { Pill } from '../../components/ui/Pill'
import { Callout } from '../../components/ui/Callout'

/* ── Mock data ─────────────────────────────────────────────── */

type RowStatus = 'valid' | 'blank-elec' | 'no-tenants' | 'error'

const VALIDATION_ROWS: {
  room: string; occ: number; water: number | null; elec: number | null; status: RowStatus
}[] = [
  { room: 'A-101', occ: 2, water: 300,  elec: 800,  status: 'valid'      },
  { room: 'A-102', occ: 1, water: 200,  elec: null, status: 'blank-elec' },
  { room: 'A-103', occ: 0, water: 400,  elec: 600,  status: 'no-tenants' },
  { room: 'A-104', occ: 2, water: 350,  elec: 900,  status: 'valid'      },
  { room: 'B-201', occ: 3, water: 600,  elec: 1200, status: 'valid'      },
  { room: 'B-203', occ: 2, water: 400,  elec: 850,  status: 'valid'      },
]

const SAMPLE_ROWS = [
  { label: 'Rent share',  amount: 3000, source: 'room'     },
  { label: 'Wi-Fi share', amount: 100,  source: 'room'     },
  { label: 'Water share', amount: 150,  source: 'room·csv' },
  { label: 'Elec. share', amount: 400,  source: 'room·csv' },
  { label: 'Parking',     amount: 500,  source: 'tenant'   },
  { label: 'Laptop fee',  amount: 100,  source: 'tenant'   },
]

const ALL_DRAFTS = [
  { name: 'J. Cruz',       amount: 4250 },
  { name: 'R. Lim',        amount: 4350 },
  { name: 'A. Tan',        amount: 5900 },
  { name: 'D. Cruz',       amount: 4650 },
  { name: 'L. Yu',         amount: 4650 },
  { name: 'B. So',         amount: 3800 },
  { name: 'C. Mendez',     amount: 3950 },
  { name: 'P. Reyes',      amount: 3950 },
  { name: 'E. Ong',        amount: 4100 },
  { name: 'M. Sy',         amount: 4100 },
  { name: 'K. Dela Cruz',  amount: 4100 },
]

const TOTAL_EST      = ALL_DRAFTS.reduce((s, d) => s + d.amount, 0)
const AVG_PER_TENANT = Math.round(TOTAL_EST / ALL_DRAFTS.length)
const DRAFT_COUNT    = ALL_DRAFTS.length

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(n: number) {
  return `₱${n.toLocaleString('en-PH')}`
}

/* ── Shared table classes ──────────────────────────────────── */

const TH   = 'px-3 py-[8px] bg-bg text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap text-left'
const TD   = 'px-3 text-ink-2 text-[13px]'
const PDROW = { paddingTop: 'var(--pad-row)', paddingBottom: 'var(--pad-row)' } as const

/* ── Row status config ─────────────────────────────────────── */

const ROW_STATUS: Record<RowStatus, { label: string; variant: 'up' | 'accent' | 'down' }> = {
  'valid':      { label: 'Valid',      variant: 'up'     },
  'blank-elec': { label: 'Blank elec', variant: 'accent' },
  'no-tenants': { label: 'No tenants', variant: 'accent' },
  'error':      { label: 'Error',      variant: 'down'   },
}

/* ── Step indicator ────────────────────────────────────────── */

const STEPS = ['Setup', 'Template', 'Upload', 'Generate'] as const

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="grid mb-8 w-full" style={{ gridTemplateColumns: `repeat(${STEPS.length}, 1fr)` }}>
      {STEPS.map((label, i) => {
        const num    = i + 1
        const done   = num < current
        const active = num === current
        return (
          <div key={label} className="flex flex-col items-center relative">
            {/* Left connecting line */}
            {i > 0 && (
              <div className="absolute h-px bg-border" style={{ top: '14px', left: 0, right: '50%' }} />
            )}
            {/* Right connecting line */}
            {i < STEPS.length - 1 && (
              <div className="absolute h-px bg-border" style={{ top: '14px', left: '50%', right: 0 }} />
            )}

            {/* Circle */}
            <span className={[
              'relative z-10 w-7 h-7 rounded-pill text-[12px] font-semibold flex items-center justify-center shrink-0',
              done   ? 'bg-accent text-white'                                    :
              active ? 'border-2 border-dashed border-accent text-accent bg-surface' :
                       'border-2 border-border text-ink-4 bg-surface',
            ].join(' ')}>
              {done ? '✓' : num}
            </span>

            {/* Label */}
            <span className={`mt-1.5 text-[12.5px] font-medium ${
              active ? 'text-accent font-semibold' :
              done   ? 'text-accent'               :
                       'text-ink-4'
            }`}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Step 1: Setup ─────────────────────────────────────────── */

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <>
      <Card>
        <CardHead title="Step 1 · Setup" subtitle="Confirm the billing run details." />
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-[13.5px] mb-5">
          {[
            { label: 'Property',          value: 'Sunset Apartments' },
            { label: 'Period',            value: 'March 2026'        },
            { label: 'Billing day',       value: '15th'              },
            { label: 'Active tenants',    value: '11'                },
            { label: 'Rooms (CSV needed)',value: '6'                 },
            { label: 'Fixed-only rooms',  value: '2'                 },
          ].map(r => (
            <div key={r.label} className="flex flex-col gap-0.5">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">
                {r.label}
              </dt>
              <dd className="font-medium text-ink">{r.value}</dd>
            </div>
          ))}
        </dl>
        <Callout variant="info" icon={<Info size={16} strokeWidth={1.75} />}>
          <p className="text-[13px]">
            <strong className="font-semibold text-ink">Non-fixed charges</strong>{' '}
            (Water, Electricity) require CSV values in step 3.
            Fixed charges are automatically included.
          </p>
        </Callout>
      </Card>
      <div className="flex justify-end mt-4">
        <Button variant="primary" onClick={onNext}>
          Next <ArrowRight size={13} strokeWidth={1.75} />
        </Button>
      </div>
    </>
  )
}

/* ── Step 2: Template ──────────────────────────────────────── */

function Step2({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <>
      <Card>
        <CardHead
          title="Step 2 · Download template"
          subtitle="Fill in the non-fixed charge amounts for each room, then upload in step 3."
        />

        {/* Template preview */}
        <div className="rounded-btn border border-border overflow-hidden mb-5">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className={TH}>Room</th>
                <th className={`${TH} text-right`}>Occupants</th>
                <th className={`${TH} text-right`}>Water (₱)</th>
                <th className={`${TH} text-right`}>Electricity (₱)</th>
              </tr>
            </thead>
            <tbody>
              {['A-101','A-102','A-103','A-104','B-201','B-203'].map(room => (
                <tr key={room} className="border-b border-border-subtle last:border-b-0">
                  <td className={TD} style={PDROW}>
                    <span className="font-mono text-ink font-medium">{room}</span>
                  </td>
                  <td className={`${TD} text-right text-ink-4`} style={PDROW}>—</td>
                  <td className={`${TD} text-right text-ink-4`} style={PDROW}>—</td>
                  <td className={`${TD} text-right text-ink-4`} style={PDROW}>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button variant="default">
          <Download size={14} strokeWidth={1.75} />
          Download sunset-mar-2026.csv
        </Button>

        <Callout variant="info" icon={<Info size={16} strokeWidth={1.75} />} className="mt-4">
          <p className="text-[13px]">
            Enter the <strong className="font-semibold text-ink">total bill amount</strong>{' '}
            (not meter reading) per room. Leave a cell blank to bill ₱0 — you'll see a warning.
          </p>
        </Callout>
      </Card>

      <div className="flex justify-between mt-4">
        <Button variant="default" onClick={onBack}>
          <ArrowLeft size={13} strokeWidth={1.75} /> Back
        </Button>
        <Button variant="primary" onClick={onNext}>
          Next <ArrowRight size={13} strokeWidth={1.75} />
        </Button>
      </div>
    </>
  )
}

/* ── Step 3: Upload & review ───────────────────────────────── */

function Step3({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [fileLoaded, setFileLoaded] = useState(false)

  const validCount = VALIDATION_ROWS.filter(r => r.status === 'valid').length
  const warnCount  = VALIDATION_ROWS.filter(r => r.status !== 'valid' && r.status !== 'error').length
  const errCount   = VALIDATION_ROWS.filter(r => r.status === 'error').length

  return (
    <>
      <Card>
        <CardHead
          title="Step 3 · Upload & review"
          subtitle="Drop your filled CSV below to validate."
        />

        {/* Drop zone */}
        <button
          type="button"
          onClick={() => setFileLoaded(v => !v)}
          className={[
            'w-full border-2 border-dashed rounded-btn p-8 text-center mb-4 transition-ui',
            fileLoaded
              ? 'border-success bg-success-soft'
              : 'border-border-strong bg-bg hover:border-accent hover:bg-accent-tint',
          ].join(' ')}
        >
          {fileLoaded ? (
            <>
              <p className="text-[22px] mb-1">✓</p>
              <p className="text-[13.5px] font-medium text-success">sunset-mar-2026.csv loaded</p>
              <p className="font-mono text-[11.5px] text-ink-4 mt-0.5">click to replace</p>
            </>
          ) : (
            <>
              <Download className="mx-auto text-ink-3 mb-2" size={22} strokeWidth={1.5} />
              <p className="text-[13.5px] text-ink-2">
                Drop CSV here or{' '}
                <span className="text-accent-2 font-semibold underline underline-offset-2">browse</span>
              </p>
              <p className="font-mono text-[11.5px] text-ink-4 mt-1">sunset-mar-2026.csv</p>
            </>
          )}
        </button>

        {/* Validation summary */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Total',  value: String(VALIDATION_ROWS.length), cls: 'text-ink'    },
            { label: 'Valid',  value: String(validCount),              cls: 'text-success' },
            { label: 'Warn',   value: String(warnCount),               cls: 'text-warning' },
            { label: 'Errors', value: String(errCount),                cls: 'text-danger'  },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-btn p-3 text-center">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-1">
                {s.label}
              </div>
              <div className={`font-display text-[22px] font-bold leading-none ${s.cls}`}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Validation table */}
        <div className="rounded-btn border border-border overflow-hidden mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className={TH}>Room</th>
                <th className={`${TH} text-right`}>Occupants</th>
                <th className={`${TH} text-right`}>Water (₱)</th>
                <th className={`${TH} text-right`}>Electricity (₱)</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {VALIDATION_ROWS.map(row => {
                const { label, variant } = ROW_STATUS[row.status]
                return (
                  <tr key={row.room} className="border-b border-border-subtle last:border-b-0">
                    <td className={TD} style={PDROW}>
                      <span className="font-mono text-ink font-medium">{row.room}</span>
                    </td>
                    <td className={`${TD} text-right font-mono`} style={PDROW}>{row.occ}</td>
                    <td className={`${TD} text-right font-mono`} style={PDROW}>
                      {row.water != null ? fmtPHP(row.water) : <span className="text-ink-4">—</span>}
                    </td>
                    <td className={`${TD} text-right font-mono`} style={PDROW}>
                      {row.elec != null ? fmtPHP(row.elec) : <span className="text-ink-4">—</span>}
                    </td>
                    <td className={TD} style={PDROW}>
                      <Pill variant={variant}>{label}</Pill>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Warnings */}
        <Callout variant="warning" icon={<AlertTriangle size={16} strokeWidth={1.75} />}>
          <div className="flex flex-col gap-1 text-[13px]">
            <p>A-102: blank electricity — will bill ₱0 if confirmed.</p>
            <p>A-103: no active tenants — row skipped.</p>
          </div>
        </Callout>
      </Card>

      <div className="flex justify-between mt-4">
        <Button variant="default" onClick={onBack}>
          <ArrowLeft size={13} strokeWidth={1.75} /> Back
        </Button>
        <Button variant="primary" onClick={onNext}>
          Next <ArrowRight size={13} strokeWidth={1.75} />
        </Button>
      </div>
    </>
  )
}

/* ── Step 4: Generate ──────────────────────────────────────── */

function Step4({ onBack, onGenerate }: { onBack: () => void; onGenerate: () => void }) {
  return (
    <>
      <Card>
        <CardHead title="Step 4 · Generate" subtitle="Review the summary then confirm." />

        <div className="flex flex-col divide-y divide-border-subtle mb-5">
          {[
            { label: 'Drafts to generate',   value: String(DRAFT_COUNT)       },
            { label: 'Total billed (est.)',   value: fmtPHP(TOTAL_EST)         },
            { label: 'Avg per tenant',        value: fmtPHP(AVG_PER_TENANT)    },
            { label: 'Replaces existing',     value: '2 drafts'                },
            { label: 'Warnings',              value: '2 (will proceed)'        },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-3">
              <span className="text-[13.5px] text-ink-3">{r.label}</span>
              <span className="font-mono font-medium text-ink text-[13.5px]">{r.value}</span>
            </div>
          ))}
        </div>

        <Callout variant="warning" icon={<AlertTriangle size={16} strokeWidth={1.75} />}>
          <p className="text-[13px]">
            <strong className="font-semibold text-ink">2 existing drafts</strong>{' '}
            will be replaced by this run. This cannot be undone.
          </p>
        </Callout>
      </Card>

      <div className="flex justify-between mt-4">
        <Button variant="default" onClick={onBack}>
          <ArrowLeft size={13} strokeWidth={1.75} /> Back
        </Button>
        <Button variant="accent" onClick={onGenerate}>
          Generate {DRAFT_COUNT} drafts <ArrowRight size={13} strokeWidth={1.75} />
        </Button>
      </div>
    </>
  )
}

/* ── Live preview panel ────────────────────────────────────── */

const SOURCE_COLOR: Record<string, string> = {
  'room':     'text-ink-4',
  'room·csv': 'text-accent-2',
  'tenant':   'text-info',
}

function LivePreview() {
  const [selectedIdx, setSelectedIdx] = useState(0)

  const selected    = ALL_DRAFTS[selectedIdx]
  const sampleTotal = SAMPLE_ROWS.reduce((s, r) => s + r.amount, 0)
  // Scale sample rows proportionally to the selected draft's total
  const scale       = selected.amount / sampleTotal
  const scaledRows  = SAMPLE_ROWS.map(r => ({ ...r, amount: Math.round(r.amount * scale) }))
  const scaledTotal = scaledRows.reduce((s, r) => s + r.amount, 0)

  return (
    <div className="sticky top-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[16px] font-semibold text-ink tracking-[-0.01em]">
          Live preview
        </h2>
        <Pill variant="accent">{DRAFT_COUNT} drafts</Pill>
      </div>

      {/* Totals summary */}
      <Card>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-ink-3">Total billed (est.)</span>
            <span className="font-display text-[20px] font-bold text-ink tracking-[-0.02em]">
              {fmtPHP(TOTAL_EST)}
            </span>
          </div>
          <div className="border-t border-border-subtle pt-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-3">Avg per tenant</span>
              <span className="font-mono font-medium text-ink-2 text-[13px]">{fmtPHP(AVG_PER_TENANT)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-3">Replaces existing drafts</span>
              <span className="font-mono font-medium text-ink-2 text-[13px]">2</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Sample bill — updates on draft selection */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-2">
          Sample · {selected.name}
        </p>
        <Card noPadding>
          <table className="w-full border-collapse">
            <tbody>
              {scaledRows.map(row => (
                <tr key={row.label} className="border-b border-border-subtle">
                  <td className="px-3 text-[13px] text-ink-2" style={PDROW}>{row.label}</td>
                  <td className="px-3 text-right font-mono text-[13px] text-ink-2" style={PDROW}>
                    {fmtPHP(row.amount)}
                  </td>
                </tr>
              ))}
              <tr className="bg-surface-2">
                <td className="px-3 text-[13px] font-semibold text-ink" style={PDROW}>Total</td>
                <td className="px-3 text-right font-mono font-semibold text-[13px] text-ink" style={PDROW}>
                  {fmtPHP(scaledTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      {/* All drafts — clickable rows */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-2">
          All drafts
        </p>
        <Card noPadding>
          <div className="max-h-[200px] overflow-y-auto">
            {ALL_DRAFTS.map((d, i) => {
              const isSelected = i === selectedIdx
              return (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => setSelectedIdx(i)}
                  className={[
                    'w-full flex items-center justify-between px-3 transition-ui text-left',
                    i < ALL_DRAFTS.length - 1 ? 'border-b border-border-subtle' : '',
                    isSelected
                      ? 'bg-accent-tint'
                      : 'hover:bg-surface-2',
                  ].join(' ')}
                  style={PDROW}
                >
                  <span className={`text-[13px] ${isSelected ? 'text-ink font-medium' : 'text-ink-2'}`}>
                    {d.name}
                  </span>
                  <span className={`font-mono text-[13px] ${isSelected ? 'text-accent-2 font-medium' : 'text-ink-2'}`}>
                    {fmtPHP(d.amount)}
                  </span>
                </button>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

export function GenerateBills() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  return (
    <main className="px-8 pt-7 pb-16 max-w-[1320px] mx-auto w-full">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-[12.5px] text-ink-3 mb-3 flex-wrap">
        <Link to="/landlord/billing" className="hover:text-ink transition-ui">billing</Link>
        <ChevronRight size={12} strokeWidth={1.75} className="text-ink-4" />
        <span>cycles</span>
        <ChevronRight size={12} strokeWidth={1.75} className="text-ink-4" />
        <span>sunset</span>
        <ChevronRight size={12} strokeWidth={1.75} className="text-ink-4" />
        <Link to="/landlord/billing/cycle/sunset-mar-2026" className="hover:text-ink transition-ui">
          mar 2026
        </Link>
        <ChevronRight size={12} strokeWidth={1.75} className="text-ink-4" />
        <span className="text-ink-2">generate</span>
      </nav>

      {/* Page head */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-[28px] font-bold text-ink tracking-[-0.02em] leading-tight mb-1">
            New billing run
          </h1>
          <p className="text-[13.5px] text-ink-3">
            Mar 2026 ·{' '}
            <span className="text-ink-2 font-medium">Sunset Apartments</span>
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/landlord/billing')}>
          <X size={14} strokeWidth={2} /> Cancel
        </Button>
      </div>

      {/* Split layout */}
      <div className="flex gap-6 items-start">

        {/* Left: stepper + step content */}
        <div className="flex-1 min-w-0">
          <StepIndicator current={step} />
          {step === 1 && <Step1 onNext={() => setStep(2)} />}
          {step === 2 && <Step2 onBack={() => setStep(1)} onNext={() => setStep(3)} />}
          {step === 3 && <Step3 onBack={() => setStep(2)} onNext={() => setStep(4)} />}
          {step === 4 && (
            <Step4
              onBack={() => setStep(3)}
              onGenerate={() => navigate('/landlord/billing/cycle/sunset-mar-2026')}
            />
          )}
        </div>

        {/* Right: live preview (sticky) */}
        <div className="w-[340px] shrink-0">
          <LivePreview />
        </div>

      </div>
    </main>
  )
}
