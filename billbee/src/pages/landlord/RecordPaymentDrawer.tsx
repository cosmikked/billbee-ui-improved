import { useState, useCallback } from 'react'
import { CheckCircle2, Printer, Download, Upload } from 'lucide-react'
import { Drawer } from '../../components/ui/Drawer'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'

/* ── Types ─────────────────────────────────────────────────── */

type PaymentMode = 'CASH' | 'GCASH' | 'BANK' | 'CHEQUE' | 'OTHER'
type Phase = 'form' | 'receipt'

interface RecordPaymentDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess: (amountPaid: number) => void
  billId: string
  tenant: string
  period: string
  balancePHP: number
  dueDateLabel: string
}

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(value: number): string {
  return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function todayReadable(): string {
  return new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
}

function dateReadable(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
}

function generateORNumber(): string {
  const seq = Math.floor(Math.random() * 90000) + 10000
  return `OR-2026-${seq}`
}

const MODE_LABEL: Record<PaymentMode, string> = {
  CASH:   'Cash',
  GCASH:  'GCash',
  BANK:   'Bank transfer',
  CHEQUE: 'Cheque',
  OTHER:  'Other',
}

/* ── Field wrapper ─────────────────────────────────────────── */

function Field({
  label,
  required = false,
  hint,
  labelRight,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  labelRight?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
        {labelRight}
      </div>
      {children}
      {hint && <p className="text-[11.5px] text-ink-4">{hint}</p>}
    </div>
  )
}

const INPUT_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full placeholder:text-ink-4'

/* ── Receipt HTML builder ──────────────────────────────────── */

function buildReceiptHTML(data: {
  orNumber: string
  billId: string
  tenant: string
  period: string
  room: string
  amountPaid: number
  mode: PaymentMode
  refNo: string
  date: string
  balanceBefore: number
  balanceAfter: number
  propertyName: string
  landlordName: string
}): string {
  const fmt = (n: number) =>
    `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${data.orNumber} – Payment Receipt</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #111; background: #fff; padding: 40px; max-width: 480px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #111; padding-bottom: 16px; }
    .header h1 { font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
    .header p  { font-size: 12px; color: #555; margin-top: 2px; }
    .or-number { text-align: center; margin: 16px 0; }
    .or-number span { display: inline-block; font-family: monospace; font-size: 12px; font-weight: 600; background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 4px; padding: 4px 10px; letter-spacing: 0.04em; }
    .amount-block { text-align: center; margin: 20px 0; padding: 16px; border: 1px solid #e4e4e7; border-radius: 6px; background: #fafafa; }
    .amount-block .label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: #888; margin-bottom: 4px; }
    .amount-block .value { font-size: 32px; font-weight: 800; font-family: monospace; letter-spacing: -0.02em; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    td { padding: 6px 0; vertical-align: top; }
    td:first-child { color: #555; width: 44%; font-size: 11.5px; }
    td:last-child  { font-weight: 500; text-align: right; font-size: 12px; }
    .divider { border: none; border-top: 1px solid #e4e4e7; margin: 16px 0; }
    .balance-row td { font-weight: 700; font-size: 13px; }
    .balance-row td:last-child { color: ${data.balanceAfter > 0 ? '#dc2626' : '#16a34a'}; font-family: monospace; }
    .footer { text-align: center; margin-top: 28px; font-size: 11px; color: #999; border-top: 1px solid #e4e4e7; padding-top: 14px; }
    @media print {
      body { padding: 20px; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.propertyName}</h1>
    <p>${data.landlordName}</p>
  </div>

  <div class="or-number">
    <span>Official Receipt · ${data.orNumber}</span>
  </div>

  <div class="amount-block">
    <div class="label">Amount Paid</div>
    <div class="value">${fmt(data.amountPaid)}</div>
  </div>

  <table>
    <tr><td>Bill ID</td><td>${data.billId}</td></tr>
    <tr><td>Tenant</td><td>${data.tenant}</td></tr>
    <tr><td>Room</td><td>${data.room}</td></tr>
    <tr><td>Billing Period</td><td>${data.period}</td></tr>
    <tr><td>Payment Date</td><td>${data.date}</td></tr>
    <tr><td>Payment Method</td><td>${MODE_LABEL[data.mode]}</td></tr>
    ${data.refNo ? `<tr><td>Reference #</td><td>${data.refNo}</td></tr>` : ''}
  </table>

  <hr class="divider" />

  <table>
    <tr><td>Balance before</td><td style="font-family:monospace">${fmt(data.balanceBefore)}</td></tr>
    <tr><td>Amount paid</td><td style="font-family:monospace">− ${fmt(data.amountPaid)}</td></tr>
    <tr class="balance-row"><td>Remaining balance</td><td>${fmt(data.balanceAfter)}</td></tr>
  </table>

  <div class="footer">
    Generated on ${todayReadable()} · BillBee
  </div>

  <script>window.onload = () => window.print()</script>
</body>
</html>`
}

/* ── Component ─────────────────────────────────────────────── */

// Hardcoded property/landlord context (replace with real data when wired to backend)
const PROPERTY_NAME  = 'Sunset Apartments'
const LANDLORD_NAME  = 'Maria Dela Cruz'
const MOCK_ROOM      = 'A-101'

export function RecordPaymentDrawer({
  open,
  onClose,
  onSuccess,
  billId,
  tenant,
  period,
  balancePHP,
  dueDateLabel,
}: RecordPaymentDrawerProps) {
  const [phase,     setPhase]     = useState<Phase>('form')
  const [amount,    setAmount]    = useState('')
  const [date,      setDate]      = useState(todayISO())
  const [receiptNo, setReceiptNo] = useState('RCT-0183')
  const [mode,      setMode]      = useState<PaymentMode>('CASH')
  const [refNo,     setRefNo]     = useState('')
  const [notes,     setNotes]     = useState('')
  const [orNumber,  setOrNumber]  = useState('')

  const parsedAmount  = parseFloat(amount) || 0
  const remaining     = balancePHP - parsedAmount
  const amountInvalid = parsedAmount <= 0 || parsedAmount > balancePHP
  const canSubmit     = !amountInvalid && date && receiptNo.trim()

  function reset() {
    setPhase('form')
    setAmount('')
    setDate(todayISO())
    setReceiptNo('RCT-0183')
    setMode('CASH')
    setRefNo('')
    setNotes('')
    setOrNumber('')
  }

  function handleClose() {
    if (phase === 'receipt') onSuccess(parsedAmount)
    reset()
    onClose()
  }

  function handleSubmit() {
    if (!canSubmit) return
    setOrNumber(generateORNumber())
    setPhase('receipt')
  }

  const openPrintWindow = useCallback((autoPrint: boolean) => {
    const html = buildReceiptHTML({
      orNumber,
      billId,
      tenant,
      period,
      room:          MOCK_ROOM,
      amountPaid:    parsedAmount,
      mode,
      refNo,
      date:          dateReadable(date),
      balanceBefore: balancePHP,
      balanceAfter:  Math.max(0, balancePHP - parsedAmount),
      propertyName:  PROPERTY_NAME,
      landlordName:  LANDLORD_NAME,
    })

    if (autoPrint) {
      // Open and auto-print (window.print() is called from inside the HTML)
      const win = window.open('', '_blank', 'width=600,height=700')
      win?.document.write(html)
      win?.document.close()
    } else {
      // "Save as PDF" — same window but without auto-print; user triggers Save as PDF manually
      const blob = new Blob([html], { type: 'text/html' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${orNumber}.html`
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [orNumber, billId, tenant, period, parsedAmount, mode, refNo, date, balancePHP])

  /* ── Render ── */

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      side="right"
      width={460}
      title={phase === 'receipt' ? 'Payment recorded' : 'Record payment'}
      subtitle={`${billId} · ${tenant} · ${period}`}
      actions={<StatusBadge status="posted" />}
      footer={
        phase === 'receipt' ? (
          <div className="flex gap-2 justify-end">
            <Button variant="default" onClick={() => openPrintWindow(false)}>
              <Download size={13} strokeWidth={1.75} /> Download PDF
            </Button>
            <Button variant="default" onClick={() => openPrintWindow(true)}>
              <Printer size={13} strokeWidth={1.75} /> Print receipt
            </Button>
            <Button variant="accent" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 justify-end">
            <Button variant="default" onClick={handleClose}>Cancel</Button>
            <Button variant="accent" onClick={handleSubmit} disabled={!canSubmit}>
              Record &amp; generate receipt
            </Button>
          </div>
        )
      }
    >
      {phase === 'receipt' ? (
        /* ════════════════════════════════════════════
           RECEIPT PHASE
           ════════════════════════════════════════════ */
        <div className="flex flex-col gap-4">

          {/* Success banner */}
          <div className="flex items-center gap-3 rounded-btn border border-success/30 bg-success/5 px-4 py-3">
            <CheckCircle2 size={18} strokeWidth={1.75} className="text-success shrink-0" />
            <div>
              <p className="text-[13.5px] font-semibold text-ink">Payment successfully recorded</p>
              <p className="text-[12px] text-ink-3 mt-0.5">Receipt is ready to print or download.</p>
            </div>
          </div>

          {/* OR number */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-btn bg-surface-2 border border-border">
            <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">Official Receipt #</span>
            <span className="font-mono text-[13px] font-semibold text-ink">{orNumber}</span>
          </div>

          {/* Amount paid — hero */}
          <Card>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-4 mb-1">Amount paid</p>
            <p className="font-mono text-[32px] font-bold text-ink leading-tight">{fmtPHP(parsedAmount)}</p>
            <p className="text-[12px] text-ink-3 mt-1">{dateReadable(date)} · {MODE_LABEL[mode]}</p>
          </Card>

          {/* Details grid */}
          <div className="flex flex-col divide-y divide-border border border-border rounded-btn overflow-hidden">
            {[
              { label: 'Bill ID',    value: billId },
              { label: 'Tenant',     value: tenant },
              { label: 'Room',       value: MOCK_ROOM },
              { label: 'Period',     value: period },
              ...(refNo ? [{ label: 'Reference #', value: refNo }] : []),
              ...(notes ? [{ label: 'Notes',       value: notes }] : []),
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between px-3 py-2 bg-surface">
                <span className="text-[12px] text-ink-3">{row.label}</span>
                <span className="text-[12.5px] text-ink font-medium">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Balance summary */}
          <div className="flex flex-col divide-y divide-border border border-border rounded-btn overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-surface">
              <span className="text-[12px] text-ink-3">Balance before</span>
              <span className="font-mono text-[12.5px] text-ink">{fmtPHP(balancePHP)}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-surface">
              <span className="text-[12px] text-ink-3">Amount paid</span>
              <span className="font-mono text-[12.5px] text-success">− {fmtPHP(parsedAmount)}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 bg-surface-2">
              <span className="text-[12.5px] font-semibold text-ink">Remaining balance</span>
              <span
                className={`font-mono text-[14px] font-bold ${
                  Math.max(0, balancePHP - parsedAmount) > 0 ? 'text-danger' : 'text-success'
                }`}
              >
                {fmtPHP(Math.max(0, balancePHP - parsedAmount))}
              </span>
            </div>
          </div>

        </div>
      ) : (
        /* ════════════════════════════════════════════
           FORM PHASE
           ════════════════════════════════════════════ */
        <>
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

            {/* Amount */}
            <Field
              label="Amount"
              required
              labelRight={
                <button
                  type="button"
                  onClick={() => setAmount(String(balancePHP))}
                  className="text-[11px] font-medium text-accent hover:underline"
                >
                  Pay in full
                </button>
              }
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-3 pointer-events-none select-none">₱</span>
                <input
                  type="number"
                  min={0}
                  max={balancePHP}
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className={`${INPUT_CLS} pl-7 ${
                    amount !== '' && amountInvalid ? 'border-danger focus:border-danger' : ''
                  }`}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              {/* Live remaining balance */}
              {amount !== '' && (
                amountInvalid
                  ? <p className="text-[11.5px] text-danger">
                      {parsedAmount <= 0
                        ? 'Amount must be greater than ₱0'
                        : `Exceeds balance by ${fmtPHP(parsedAmount - balancePHP)}`}
                    </p>
                  : <p className={`text-[11.5px] font-mono ${remaining === 0 ? 'text-success' : 'text-ink-3'}`}>
                      Remaining after payment: {fmtPHP(remaining)}
                    </p>
              )}
            </Field>

            {/* Date */}
            <Field label="Date" required>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={INPUT_CLS}
              />
            </Field>

            {/* Payment method */}
            <Field label="Payment method" required>
              <select
                value={mode}
                onChange={e => setMode(e.target.value as PaymentMode)}
                className={INPUT_CLS}
              >
                <option value="CASH">Cash</option>
                <option value="GCASH">GCash</option>
                <option value="BANK">Bank transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>

            {/* Receipt # */}
            <Field label="Receipt #" required hint="Must be unique — used as your official receipt number">
              <input
                type="text"
                value={receiptNo}
                onChange={e => setReceiptNo(e.target.value)}
                className={INPUT_CLS}
                placeholder="RCT-0001"
              />
            </Field>

            {/* Reference # — shown for non-cash methods */}
            {mode !== 'CASH' && (
              <Field label="Reference #" hint="Transaction ID from your bank or e-wallet">
                <input
                  type="text"
                  value={refNo}
                  onChange={e => setRefNo(e.target.value)}
                  className={INPUT_CLS}
                  placeholder="—"
                />
              </Field>
            )}

            {/* Proof of payment */}
            <Field label="Proof of payment" hint="optional · screenshot or scan">
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
        </>
      )}
    </Drawer>
  )
}
