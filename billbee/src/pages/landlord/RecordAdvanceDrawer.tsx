import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Drawer } from '../../components/ui/Drawer'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Pill } from '../../components/ui/Pill'

/* ── Types ─────────────────────────────────────────────────── */

type PaymentMode = 'CASH' | 'BANK' | 'E-WALLET' | 'OTHER'

interface RecordAdvanceDrawerProps {
  open: boolean
  onClose: () => void
  billId: string
  tenant: string
  period: string
}

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(value: number): string {
  return `₱${value.toLocaleString('en-PH')}`
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function toTitleCase(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase()
}

/* ── Mock breakdown ────────────────────────────────────────── */

const BREAKDOWN = {
  rent:        3000,
  fixedRoom:    100,
  fixedTenant:  700,
}

const PERIODS = ['APR 2026', 'MAY 2026', 'JUN 2026']

/* ── Field wrapper ─────────────────────────────────────────── */

function Field({
  label,
  required = false,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11.5px] text-ink-4">{hint}</p>}
    </div>
  )
}

/* ── Input ─────────────────────────────────────────────────── */

const INPUT_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full placeholder:text-ink-4'

/* ── Advance context card ──────────────────────────────────── */

function AdvanceContextCard({ selectedPeriod }: { selectedPeriod: string }) {
  const total     = BREAKDOWN.rent + BREAKDOWN.fixedRoom + BREAKDOWN.fixedTenant
  const monthWord = toTitleCase(selectedPeriod.split(' ')[0])

  return (
    <Card>
      <div className="flex items-baseline justify-between py-1">
        <span className="text-[13px] text-ink-2">Monthly rent (share)</span>
        <span className="font-mono text-[13px] text-ink">{fmtPHP(BREAKDOWN.rent)}</span>
      </div>
      <div className="flex items-baseline justify-between py-1">
        <span className="text-[13px] text-ink-3">+ Fixed room charges</span>
        <span className="font-mono text-[13px] text-ink-2">{fmtPHP(BREAKDOWN.fixedRoom)}</span>
      </div>
      <div className="flex items-baseline justify-between py-1 border-b border-dashed border-border pb-2">
        <span className="text-[13px] text-ink-3">+ Fixed tenant charges</span>
        <span className="font-mono text-[13px] text-ink-2">{fmtPHP(BREAKDOWN.fixedTenant)}</span>
      </div>
      <div className="flex items-baseline justify-between pt-2.5">
        <span className="text-[13.5px] font-semibold text-ink">Max advance for {monthWord}</span>
        <span className="font-mono text-[15px] font-bold text-ink">{fmtPHP(total)}</span>
      </div>
    </Card>
  )
}

/* ── Component ─────────────────────────────────────────────── */

export function RecordAdvanceDrawer({
  open,
  onClose,
  billId,
  tenant,
  period,
}: RecordAdvanceDrawerProps) {
  const maxAdvance = BREAKDOWN.rent + BREAKDOWN.fixedRoom + BREAKDOWN.fixedTenant

  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[1])
  const [amount,         setAmount]         = useState(String(maxAdvance))
  const [date,           setDate]           = useState(todayISO())
  const [receiptNo,      setReceiptNo]      = useState('RCT-0184')
  const [mode,           setMode]           = useState<PaymentMode>('CASH')
  const [refNo,          setRefNo]          = useState('')
  const [notes,          setNotes]          = useState('')

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      width={460}
      title="Record advance"
      subtitle={`${billId} · ${tenant} · ${period}`}
      actions={<Pill variant="info">Future</Pill>}
      footer={
        <Button variant="accent" className="w-full justify-center">
          Record advance payment
        </Button>
      }
    >
      <div className="flex flex-col gap-4">

        {/* Future billing period */}
        <Field label="Future billing period" required>
          <div className="flex items-center gap-2 flex-wrap">
            {PERIODS.map(p => (
              <Button
                key={p}
                size="sm"
                variant={selectedPeriod === p ? 'accent' : 'default'}
                onClick={() => setSelectedPeriod(p)}
              >
                {p}{selectedPeriod === p ? ' ✓' : ''}
              </Button>
            ))}
          </div>
        </Field>

        {/* Breakdown card */}
        <AdvanceContextCard selectedPeriod={selectedPeriod} />

        {/* Amount + Date */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount" required>
            <input
              type="text"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={INPUT_CLS}
              placeholder="0"
            />
          </Field>
          <Field label="Date" required>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={INPUT_CLS}
            />
          </Field>
        </div>

        {/* Mode */}
        <Field label="Mode" required>
          <select
            value={mode}
            onChange={e => setMode(e.target.value as PaymentMode)}
            className={INPUT_CLS}
          >
            <option value="CASH">Cash</option>
            <option value="BANK">Bank transfer</option>
            <option value="E-WALLET">E-wallet</option>
            <option value="OTHER">Other</option>
          </select>
        </Field>

        {/* Receipt # */}
        <Field label="Receipt #" required hint="must be unique">
          <input
            type="text"
            value={receiptNo}
            onChange={e => setReceiptNo(e.target.value)}
            className={INPUT_CLS}
            placeholder="RCT-0001"
          />
        </Field>

        {/* Reference # */}
        <Field label="Reference #" hint="optional · txn id">
          <input
            type="text"
            value={refNo}
            onChange={e => setRefNo(e.target.value)}
            className={INPUT_CLS}
            placeholder="—"
          />
        </Field>

        {/* Proof of payment */}
        <Field label="Proof of payment">
          <div className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-border rounded-btn py-6 text-[13px] text-ink-3 hover:border-border-strong hover:bg-surface-2 transition-colors cursor-pointer">
            <Upload size={18} strokeWidth={1.5} className="text-ink-4" />
            <span>Drop file or <span className="text-accent font-medium">browse</span></span>
          </div>
        </Field>

        {/* Notes */}
        <Field label="Notes">
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className={INPUT_CLS}
            placeholder="optional"
          />
        </Field>

      </div>
    </Drawer>
  )
}
