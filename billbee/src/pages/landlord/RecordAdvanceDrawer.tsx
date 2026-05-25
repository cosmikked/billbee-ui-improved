import { useState, useCallback } from 'react'
import { CheckCircle2, Printer, Download, Upload } from 'lucide-react'
import { Drawer } from '../../components/ui/Drawer'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Pill } from '../../components/ui/Pill'

/* ── Types ─────────────────────────────────────────────────── */

type PaymentMode = 'CASH' | 'GCASH' | 'BANK' | 'CHEQUE' | 'OTHER'
type Phase = 'form' | 'receipt'

export interface AdvanceSuccessData {
  period: string
  orNumber: string
  amount: number
  mode: PaymentMode
  tenant: string
  billId: string
}

interface RecordAdvanceDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess: (data: AdvanceSuccessData) => void
  billId: string
  tenant: string
  period: string
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

function toTitleCase(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase()
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

/* ── Mock data ─────────────────────────────────────────────── */

const BREAKDOWN = {
  rent:        3000,
  fixedRoom:    100,
  fixedTenant:  700,
}

const PERIODS = ['APR 2026', 'MAY 2026', 'JUN 2026']

const PROPERTY_NAME = 'Sunset Apartments'
const LANDLORD_NAME = 'Maria Dela Cruz'
const MOCK_ROOM     = 'A-101'

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

/* ── Receipt HTML builder ──────────────────────────────────── */

function buildReceiptHTML(data: {
  orNumber: string
  billId: string
  tenant: string
  period: string
  futurePeriod: string
  room: string
  amountPaid: number
  maxAdvance: number
  mode: PaymentMode
  refNo: string
  date: string
  propertyName: string
  landlordName: string
}): string {
  const fmt = (n: number) =>
    `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${data.orNumber} – Advance Receipt</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #111; background: #fff; padding: 40px; max-width: 480px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #111; padding-bottom: 16px; }
    .header h1 { font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
    .header p  { font-size: 12px; color: #555; margin-top: 2px; }
    .type-badge { text-align: center; margin: 12px 0 4px; }
    .type-badge span { display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 99px; padding: 3px 10px; }
    .or-number { text-align: center; margin: 10px 0 20px; }
    .or-number span { display: inline-block; font-family: monospace; font-size: 12px; font-weight: 600; background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 4px; padding: 4px 10px; letter-spacing: 0.04em; }
    .amount-block { text-align: center; margin: 0 0 20px; padding: 16px; border: 1px solid #e4e4e7; border-radius: 6px; background: #fafafa; }
    .amount-block .label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: #888; margin-bottom: 4px; }
    .amount-block .value { font-size: 32px; font-weight: 800; font-family: monospace; letter-spacing: -0.02em; }
    .amount-block .sub   { font-size: 11.5px; color: #888; margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    td { padding: 6px 0; vertical-align: top; }
    td:first-child { color: #555; width: 44%; font-size: 11.5px; }
    td:last-child  { font-weight: 500; text-align: right; font-size: 12px; }
    .divider { border: none; border-top: 1px solid #e4e4e7; margin: 16px 0; }
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

  <div class="type-badge"><span>Advance Payment</span></div>
  <div class="or-number"><span>Official Receipt · ${data.orNumber}</span></div>

  <div class="amount-block">
    <div class="label">Advance Paid</div>
    <div class="value">${fmt(data.amountPaid)}</div>
    <div class="sub">Applied to ${data.futurePeriod}</div>
  </div>

  <table>
    <tr><td>Bill reference</td><td>${data.billId}</td></tr>
    <tr><td>Tenant</td><td>${data.tenant}</td></tr>
    <tr><td>Room</td><td>${data.room}</td></tr>
    <tr><td>Current period</td><td>${data.period}</td></tr>
    <tr><td>Applied to period</td><td>${data.futurePeriod}</td></tr>
    <tr><td>Payment date</td><td>${data.date}</td></tr>
    <tr><td>Payment method</td><td>${MODE_LABEL[data.mode]}</td></tr>
    ${data.refNo ? `<tr><td>Reference #</td><td>${data.refNo}</td></tr>` : ''}
  </table>

  <hr class="divider" />

  <table>
    <tr><td>Max advance (${data.futurePeriod})</td><td style="font-family:monospace">${fmt(data.maxAdvance)}</td></tr>
    <tr><td>Amount paid</td><td style="font-family:monospace">${fmt(data.amountPaid)}</td></tr>
    <tr><td>Coverage</td><td style="font-family:monospace">${Math.round((data.amountPaid / data.maxAdvance) * 100)}%</td></tr>
  </table>

  <div class="footer">
    Generated on ${todayReadable()} · BillBee
  </div>

  <script>window.onload = () => window.print()</script>
</body>
</html>`
}

/* ── Component ─────────────────────────────────────────────── */

export function RecordAdvanceDrawer({
  open,
  onClose,
  onSuccess,
  billId,
  tenant,
  period,
}: RecordAdvanceDrawerProps) {
  const maxAdvance = BREAKDOWN.rent + BREAKDOWN.fixedRoom + BREAKDOWN.fixedTenant

  const [phase,          setPhase]          = useState<Phase>('form')
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[1])
  const [amount,         setAmount]         = useState('')
  const [date,           setDate]           = useState(todayISO())
  const [receiptNo,      setReceiptNo]      = useState('RCT-0184')
  const [mode,           setMode]           = useState<PaymentMode>('CASH')
  const [refNo,          setRefNo]          = useState('')
  const [notes,          setNotes]          = useState('')
  const [orNumber,       setOrNumber]       = useState('')

  const parsedAmount  = parseFloat(amount) || 0
  const amountInvalid = parsedAmount <= 0 || parsedAmount > maxAdvance
  const canSubmit     = !amountInvalid && date && receiptNo.trim()

  function reset() {
    setPhase('form')
    setSelectedPeriod(PERIODS[1])
    setAmount('')
    setDate(todayISO())
    setReceiptNo('RCT-0184')
    setMode('CASH')
    setRefNo('')
    setNotes('')
    setOrNumber('')
  }

  function handleClose() {
    if (phase === 'receipt') onSuccess({ period: selectedPeriod, orNumber, amount: parsedAmount, mode, tenant, billId })
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
      futurePeriod: selectedPeriod,
      room:         MOCK_ROOM,
      amountPaid:   parsedAmount,
      maxAdvance,
      mode,
      refNo,
      date:         dateReadable(date),
      propertyName: PROPERTY_NAME,
      landlordName: LANDLORD_NAME,
    })

    if (autoPrint) {
      const win = window.open('', '_blank', 'width=600,height=700')
      win?.document.write(html)
      win?.document.close()
    } else {
      const blob = new Blob([html], { type: 'text/html' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${orNumber}.html`
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [orNumber, billId, tenant, period, selectedPeriod, parsedAmount, maxAdvance, mode, refNo, date])

  /* ── Render ── */

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      side="right"
      width={460}
      title={phase === 'receipt' ? 'Advance recorded' : 'Record advance'}
      subtitle={`${billId} · ${tenant} · ${period}`}
      actions={<Pill variant="info">Future</Pill>}
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
              Record advance payment
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
              <p className="text-[13.5px] font-semibold text-ink">Advance payment recorded</p>
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
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-4 mb-1">Advance paid</p>
            <p className="font-mono text-[32px] font-bold text-ink leading-tight">{fmtPHP(parsedAmount)}</p>
            <p className="text-[12px] text-ink-3 mt-1">{dateReadable(date)} · {MODE_LABEL[mode]}</p>
          </Card>

          {/* Details grid */}
          <div className="flex flex-col divide-y divide-border border border-border rounded-btn overflow-hidden">
            {[
              { label: 'Bill reference',    value: billId },
              { label: 'Tenant',            value: tenant },
              { label: 'Room',              value: MOCK_ROOM },
              { label: 'Current period',    value: period },
              { label: 'Applied to period', value: selectedPeriod },
              ...(refNo ? [{ label: 'Reference #', value: refNo }] : []),
              ...(notes ? [{ label: 'Notes',       value: notes }] : []),
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between px-3 py-2 bg-surface">
                <span className="text-[12px] text-ink-3">{row.label}</span>
                <span className="text-[12.5px] text-ink font-medium">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Coverage summary */}
          <div className="flex flex-col divide-y divide-border border border-border rounded-btn overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-surface">
              <span className="text-[12px] text-ink-3">Max advance ({selectedPeriod})</span>
              <span className="font-mono text-[12.5px] text-ink">{fmtPHP(maxAdvance)}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-surface">
              <span className="text-[12px] text-ink-3">Amount paid</span>
              <span className="font-mono text-[12.5px] text-success">{fmtPHP(parsedAmount)}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 bg-surface-2">
              <span className="text-[12.5px] font-semibold text-ink">Coverage</span>
              <span className="font-mono text-[14px] font-bold text-ink">
                {Math.round((parsedAmount / maxAdvance) * 100)}%
              </span>
            </div>
          </div>

        </div>
      ) : (
        /* ════════════════════════════════════════════
           FORM PHASE
           ════════════════════════════════════════════ */
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

          {/* Breakdown / max advance context */}
          <AdvanceContextCard selectedPeriod={selectedPeriod} />

          {/* Amount */}
          <Field
            label="Amount"
            required
            labelRight={
              <button
                type="button"
                onClick={() => setAmount(String(maxAdvance))}
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
            {amount !== '' && (
              amountInvalid
                ? <p className="text-[11.5px] text-danger">
                    {parsedAmount <= 0
                      ? 'Amount must be greater than ₱0'
                      : `Exceeds max advance by ${fmtPHP(parsedAmount - maxAdvance)}`}
                  </p>
                : <p className="text-[11.5px] text-ink-3 font-mono">
                    {Math.round((parsedAmount / maxAdvance) * 100)}% of max advance
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
      )}
    </Drawer>
  )
}
