import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Drawer } from '../../components/ui/Drawer'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'

/* ── Types ─────────────────────────────────────────────────── */

type PaymentMode = 'CASH' | 'BANK' | 'E-WALLET' | 'OTHER'

interface RecordPaymentDrawerProps {
  open: boolean
  onClose: () => void
  billId: string
  tenant: string
  period: string
  balancePHP: number
  dueDateLabel: string
}

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(value: number): string {
  return `₱${value.toLocaleString('en-PH')}`
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

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

/* ── Component ─────────────────────────────────────────────── */

export function RecordPaymentDrawer({
  open,
  onClose,
  billId,
  tenant,
  period,
  balancePHP,
  dueDateLabel,
}: RecordPaymentDrawerProps) {
  const [amount,    setAmount]    = useState(String(balancePHP))
  const [date,      setDate]      = useState(todayISO())
  const [receiptNo, setReceiptNo] = useState('RCT-0183')
  const [mode,      setMode]      = useState<PaymentMode>('CASH')
  const [refNo,     setRefNo]     = useState('')
  const [notes,     setNotes]     = useState('')

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      width={460}
      title="Record payment"
      subtitle={`${billId} · ${tenant} · ${period}`}
      actions={<StatusBadge status="posted" />}
      footer={
        <Button variant="accent" className="w-full justify-center">
          Record &amp; generate receipt
        </Button>
      }
    >
      {/* Balance context */}
      <Card className="mb-5">
        <div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 items-baseline">
          <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">Balance</span>
          <span className="font-mono text-[20px] font-bold text-ink text-right leading-tight">{fmtPHP(balancePHP)}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">Due date</span>
          <span className="font-mono text-[13px] text-ink-3 text-right">{dueDateLabel}</span>
        </div>
      </Card>

      <div className="flex flex-col gap-4">

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

        {/* Mode — full row */}
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

        {/* Receipt # — full row */}
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
