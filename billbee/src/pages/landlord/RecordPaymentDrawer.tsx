import { useState, useCallback } from 'react'
import { CheckCircle2, Printer, Download, Upload } from 'lucide-react'
import { Drawer } from '../../components/ui/Drawer'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

/* ── Types ─────────────────────────────────────────────────── */

type PaymentMode   = 'CASH' | 'GCASH' | 'BANK' | 'CHEQUE' | 'OTHER'
type PaymentTarget = 'bill' | 'advance'
type Phase         = 'form' | 'receipt'

/** Unified result — caller receives this after Done is clicked. */
export type PaymentResult =
  | { kind: 'regular'; amountPaid: number }
  | { kind: 'advance'; period: string; orNumber: string; amount: number; mode: PaymentMode; tenant: string; billId: string }

interface RecordPaymentDrawerProps {
  open: boolean
  onClose: () => void
  /** Called once when the user clicks Done on the receipt screen. */
  onSuccess: (result: PaymentResult) => void
  billId: string
  tenant: string
  period: string       // current billing period, e.g. "Mar 2026"
  balancePHP: number
  dueDateLabel: string
}

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(v: number) {
  return `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function todayISO()      { return new Date().toISOString().split('T')[0] }
function todayReadable() { return new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) }
function dateReadable(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
}
function generateORNumber() {
  return `OR-2026-${Math.floor(Math.random() * 90000) + 10000}`
}

const MODE_LABEL: Record<PaymentMode, string> = {
  CASH:   'Cash',
  GCASH:  'GCash',
  BANK:   'Bank transfer',
  CHEQUE: 'Cheque',
  OTHER:  'Other',
}

/* ── Advance data (mock — replace with real room/tenant lookup) */

const FUTURE_PERIODS = ['APR 2026', 'MAY 2026', 'JUN 2026']

const ADV_BREAKDOWN = { rent: 3000, fixedRoom: 100, fixedTenant: 700 }
const MAX_ADVANCE   = ADV_BREAKDOWN.rent + ADV_BREAKDOWN.fixedRoom + ADV_BREAKDOWN.fixedTenant

/* ── Property context (hardcoded until wired to backend) ─── */

const PROPERTY_NAME = 'Sunset Apartments'
const LANDLORD_NAME = 'Maria Dela Cruz'
const MOCK_ROOM     = 'A-101'

/* ── Receipt HTML ──────────────────────────────────────────── */

function buildReceiptHTML(data: {
  orNumber: string; billId: string; tenant: string; period: string
  room: string; amountPaid: number; mode: PaymentMode; refNo: string; date: string
  propertyName: string; landlordName: string
  // regular-only
  balanceBefore?: number; balanceAfter?: number
  // advance-only
  futurePeriod?: string; maxAdvance?: number
}): string {
  const fmt = (n: number) =>
    `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const isAdvance = !!data.futurePeriod

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${data.orNumber} – ${isAdvance ? 'Advance' : 'Payment'} Receipt</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#111;background:#fff;padding:40px;max-width:480px;margin:0 auto}
    .header{text-align:center;margin-bottom:24px;border-bottom:2px solid #111;padding-bottom:16px}
    .header h1{font-size:18px;font-weight:700;letter-spacing:-.01em}
    .header p{font-size:12px;color:#555;margin-top:2px}
    .badge{text-align:center;margin:12px 0 4px}
    .badge span{display:inline-block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:99px;padding:3px 10px}
    .or{text-align:center;margin:10px 0 20px}
    .or span{display:inline-block;font-family:monospace;font-size:12px;font-weight:600;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:4px;padding:4px 10px;letter-spacing:.04em}
    .amount-block{text-align:center;margin:0 0 20px;padding:16px;border:1px solid #e4e4e7;border-radius:6px;background:#fafafa}
    .amount-block .label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#888;margin-bottom:4px}
    .amount-block .value{font-size:32px;font-weight:800;font-family:monospace;letter-spacing:-.02em}
    .amount-block .sub{font-size:11.5px;color:#888;margin-top:6px}
    table{width:100%;border-collapse:collapse;margin:16px 0}
    td{padding:6px 0;vertical-align:top}
    td:first-child{color:#555;width:44%;font-size:11.5px}
    td:last-child{font-weight:500;text-align:right;font-size:12px}
    .divider{border:none;border-top:1px solid #e4e4e7;margin:16px 0}
    .balance-row td{font-weight:700;font-size:13px}
    .balance-row td:last-child{color:${(data.balanceAfter ?? 0) > 0 ? '#dc2626' : '#16a34a'};font-family:monospace}
    .footer{text-align:center;margin-top:28px;font-size:11px;color:#999;border-top:1px solid #e4e4e7;padding-top:14px}
    @media print{body{padding:20px}@page{margin:12mm}}
  </style>
</head>
<body>
  <div class="header"><h1>${data.propertyName}</h1><p>${data.landlordName}</p></div>
  ${isAdvance ? '<div class="badge"><span>Advance Payment</span></div>' : ''}
  <div class="or"><span>Official Receipt · ${data.orNumber}</span></div>
  <div class="amount-block">
    <div class="label">${isAdvance ? 'Advance Paid' : 'Amount Paid'}</div>
    <div class="value">${fmt(data.amountPaid)}</div>
    ${isAdvance ? `<div class="sub">Applied to ${data.futurePeriod}</div>` : ''}
  </div>
  <table>
    <tr><td>Bill reference</td><td>${data.billId}</td></tr>
    <tr><td>Tenant</td><td>${data.tenant}</td></tr>
    <tr><td>Room</td><td>${data.room}</td></tr>
    <tr><td>${isAdvance ? 'Current period' : 'Billing period'}</td><td>${data.period}</td></tr>
    ${isAdvance ? `<tr><td>Applied to period</td><td>${data.futurePeriod}</td></tr>` : ''}
    <tr><td>Payment date</td><td>${data.date}</td></tr>
    <tr><td>Payment method</td><td>${MODE_LABEL[data.mode]}</td></tr>
    ${data.refNo ? `<tr><td>Reference #</td><td>${data.refNo}</td></tr>` : ''}
  </table>
  <hr class="divider"/>
  ${isAdvance ? `
  <table>
    <tr><td>Max advance (${data.futurePeriod})</td><td style="font-family:monospace">${fmt(data.maxAdvance!)}</td></tr>
    <tr><td>Amount paid</td><td style="font-family:monospace">${fmt(data.amountPaid)}</td></tr>
    <tr><td>Coverage</td><td style="font-family:monospace">${Math.round((data.amountPaid / data.maxAdvance!) * 100)}%</td></tr>
  </table>
  ` : `
  <table>
    <tr><td>Balance before</td><td style="font-family:monospace">${fmt(data.balanceBefore!)}</td></tr>
    <tr><td>Amount paid</td><td style="font-family:monospace">− ${fmt(data.amountPaid)}</td></tr>
    <tr class="balance-row"><td>Remaining balance</td><td>${fmt(data.balanceAfter!)}</td></tr>
  </table>
  `}
  <div class="footer">Generated on ${todayReadable()} · BillBee</div>
  <script>window.onload=()=>window.print()</script>
</body>
</html>`
}

/* ── Field wrapper ─────────────────────────────────────────── */

function Field({
  label, required = false, hint, labelRight, children,
}: {
  label: string; required?: boolean; hint?: string
  labelRight?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
          {label}{required && <span className="text-danger ml-0.5">*</span>}
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

/* ── Component ─────────────────────────────────────────────── */

export function RecordPaymentDrawer({
  open, onClose, onSuccess,
  billId, tenant, period, balancePHP, dueDateLabel,
}: RecordPaymentDrawerProps) {

  const [phase,         setPhase]         = useState<Phase>('form')
  const [target,        setTarget]        = useState<PaymentTarget>('bill')
  const [futurePeriod,  setFuturePeriod]  = useState(FUTURE_PERIODS[0])
  const [amount,        setAmount]        = useState('')
  const [date,          setDate]          = useState(todayISO())
  const [mode,          setMode]          = useState<PaymentMode>('CASH')
  const [refNo,         setRefNo]         = useState('')
  const [notes,         setNotes]         = useState('')
  const [orNumber,      setOrNumber]      = useState('')

  const isAdvance    = target === 'advance'
  const cap          = isAdvance ? MAX_ADVANCE : balancePHP
  const parsedAmount = parseFloat(amount) || 0
  const remaining    = balancePHP - parsedAmount
  const amountInvalid = parsedAmount <= 0 || parsedAmount > cap
  const canSubmit    = !amountInvalid && !!date

  function reset() {
    setPhase('form'); setTarget('bill'); setFuturePeriod(FUTURE_PERIODS[0])
    setAmount(''); setDate(todayISO()); setMode('CASH')
    setRefNo(''); setNotes(''); setOrNumber('')
  }

  function handleClose() {
    if (phase === 'receipt') {
      if (isAdvance) {
        onSuccess({ kind: 'advance', period: futurePeriod, orNumber, amount: parsedAmount, mode, tenant, billId })
      } else {
        onSuccess({ kind: 'regular', amountPaid: parsedAmount })
      }
    }
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
      orNumber, billId, tenant, period,
      room: MOCK_ROOM, amountPaid: parsedAmount, mode, refNo,
      date: dateReadable(date), propertyName: PROPERTY_NAME, landlordName: LANDLORD_NAME,
      ...(isAdvance
        ? { futurePeriod, maxAdvance: MAX_ADVANCE }
        : { balanceBefore: balancePHP, balanceAfter: Math.max(0, balancePHP - parsedAmount) }),
    })

    if (autoPrint) {
      const win = window.open('', '_blank', 'width=600,height=700')
      win?.document.write(html)
      win?.document.close()
    } else {
      const blob = new Blob([html], { type: 'text/html' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `${orNumber}.html`; a.click()
      URL.revokeObjectURL(url)
    }
  }, [orNumber, billId, tenant, period, futurePeriod, parsedAmount, mode, refNo, date, balancePHP, isAdvance])

  /* ── Render ── */

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      side="right"
      width={460}
      title={phase === 'receipt' ? (isAdvance ? 'Advance recorded ✓' : 'Payment recorded ✓') : 'Record payment'}
      subtitle={`${tenant} · ${period}`}
      footer={
        phase === 'receipt' ? (
          <div className="flex gap-2 justify-end">
            <Button variant="default" onClick={() => openPrintWindow(false)}>
              <Download size={13} strokeWidth={1.75} /> Download PDF
            </Button>
            <Button variant="default" onClick={() => openPrintWindow(true)}>
              <Printer size={13} strokeWidth={1.75} /> Print receipt
            </Button>
            <Button variant="accent" onClick={handleClose}>Done</Button>
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
        /* ════ RECEIPT PHASE ════ */
        <div className="flex flex-col gap-4">

          {/* Success banner */}
          <div className="flex items-center gap-3 rounded-btn border border-success/30 bg-success/5 px-4 py-3">
            <CheckCircle2 size={18} strokeWidth={1.75} className="text-success shrink-0" />
            <div>
              <p className="text-[13.5px] font-semibold text-ink">
                {isAdvance ? 'Advance payment recorded' : 'Payment successfully recorded'}
              </p>
              <p className="text-[12px] text-ink-3 mt-0.5">Receipt is ready to print or download.</p>
            </div>
          </div>

          {/* OR number */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-btn bg-surface-2 border border-border">
            <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">Official Receipt #</span>
            <span className="font-mono text-[13px] font-semibold text-ink">{orNumber}</span>
          </div>

          {/* Amount hero */}
          <Card>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-4 mb-1">
              {isAdvance ? 'Advance paid' : 'Amount paid'}
            </p>
            <p className="font-mono text-[32px] font-bold text-ink leading-tight">{fmtPHP(parsedAmount)}</p>
            <p className="text-[12px] text-ink-3 mt-1">
              {dateReadable(date)} · {MODE_LABEL[mode]}
              {isAdvance && ` · Applied to ${futurePeriod}`}
            </p>
          </Card>

          {/* Details grid */}
          <div className="flex flex-col divide-y divide-border border border-border rounded-btn overflow-hidden">
            {[
              { label: 'Bill reference',                              value: billId },
              { label: 'Tenant',                                      value: tenant },
              { label: 'Room',                                        value: MOCK_ROOM },
              { label: isAdvance ? 'Applied to period' : 'Period',   value: isAdvance ? futurePeriod : period },
              ...(refNo  ? [{ label: 'Reference #', value: refNo  }] : []),
              ...(notes  ? [{ label: 'Notes',       value: notes  }] : []),
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between px-3 py-2 bg-surface">
                <span className="text-[12px] text-ink-3">{row.label}</span>
                <span className="text-[12.5px] text-ink font-medium">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Balance / coverage summary */}
          <div className="flex flex-col divide-y divide-border border border-border rounded-btn overflow-hidden">
            {isAdvance ? (
              <>
                <div className="flex items-center justify-between px-3 py-2 bg-surface">
                  <span className="text-[12px] text-ink-3">Max advance ({futurePeriod})</span>
                  <span className="font-mono text-[12.5px] text-ink">{fmtPHP(MAX_ADVANCE)}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-surface">
                  <span className="text-[12px] text-ink-3">Amount paid</span>
                  <span className="font-mono text-[12.5px] text-success">{fmtPHP(parsedAmount)}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 bg-surface-2">
                  <span className="text-[12.5px] font-semibold text-ink">Coverage</span>
                  <span className="font-mono text-[14px] font-bold text-ink">
                    {Math.round((parsedAmount / MAX_ADVANCE) * 100)}%
                  </span>
                </div>
              </>
            ) : (
              <>
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
                  <span className={`font-mono text-[14px] font-bold ${
                    Math.max(0, balancePHP - parsedAmount) > 0 ? 'text-danger' : 'text-success'
                  }`}>
                    {fmtPHP(Math.max(0, balancePHP - parsedAmount))}
                  </span>
                </div>
              </>
            )}
          </div>

        </div>
      ) : (
        /* ════ FORM PHASE ════ */
        <div className="flex flex-col gap-5">

          {/* ── Which month? ── */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3 mb-2">
              Which month is this payment for?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: 'bill',    title: 'This bill',     sub: period },
                { key: 'advance', title: 'A future month', sub: 'Apr, May, Jun…' },
              ] as const).map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => { setTarget(opt.key); setAmount('') }}
                  className={[
                    'flex flex-col items-center gap-0.5 px-3 py-3 rounded-btn border text-center transition-ui',
                    target === opt.key
                      ? 'bg-ink border-ink text-white'
                      : 'border-border bg-surface text-ink-2 hover:bg-surface-2 hover:border-border-strong',
                  ].join(' ')}
                >
                  <span className="text-[13px] font-semibold">{opt.title}</span>
                  <span className={`text-[11.5px] ${target === opt.key ? 'text-white/60' : 'text-ink-4'}`}>
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Advance: period picker + context card ── */}
          {isAdvance && (
            <>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3 mb-2">
                  Which future month?
                </p>
                <div className="flex gap-2">
                  {FUTURE_PERIODS.map(p => (
                    <Button
                      key={p}
                      size="sm"
                      variant={futurePeriod === p ? 'accent' : 'default'}
                      onClick={() => setFuturePeriod(p)}
                    >
                      {p}{futurePeriod === p ? ' ✓' : ''}
                    </Button>
                  ))}
                </div>
              </div>

              <Card>
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3 mb-2">
                  Estimated charges for {futurePeriod}
                </p>
                <div className="flex items-baseline justify-between py-1">
                  <span className="text-[13px] text-ink-2">Monthly rent (share)</span>
                  <span className="font-mono text-[13px] text-ink">{fmtPHP(ADV_BREAKDOWN.rent)}</span>
                </div>
                <div className="flex items-baseline justify-between py-1 border-b border-dashed border-border pb-2">
                  <span className="text-[13px] text-ink-3">+ Fixed charges</span>
                  <span className="font-mono text-[13px] text-ink-2">
                    {fmtPHP(ADV_BREAKDOWN.fixedRoom + ADV_BREAKDOWN.fixedTenant)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-2">
                  <span className="text-[13.5px] font-semibold text-ink">
                    Max advance for {futurePeriod.split(' ')[0].charAt(0) + futurePeriod.split(' ')[0].slice(1).toLowerCase()}
                  </span>
                  <span className="font-mono text-[15px] font-bold text-ink">{fmtPHP(MAX_ADVANCE)}</span>
                </div>
              </Card>
            </>
          )}

          {/* ── Regular: balance context ── */}
          {!isAdvance && (
            <div className="flex items-center justify-between px-4 py-3 rounded-btn border border-border bg-surface">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">Balance due</p>
                <p className="font-mono text-[22px] font-bold text-ink leading-tight">{fmtPHP(balancePHP)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">Due date</p>
                <p className="text-[13px] text-ink-2 mt-0.5">{dueDateLabel}</p>
              </div>
            </div>
          )}

          {/* ── Amount ── */}
          <Field
            label="Amount"
            required
            labelRight={
              <button
                type="button"
                onClick={() => setAmount(String(cap))}
                className="text-[11px] font-medium text-accent hover:underline"
              >
                {isAdvance ? 'Pay full advance' : 'Pay in full'}
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
                className={`${INPUT_CLS} pl-7 ${amount !== '' && amountInvalid ? 'border-danger' : ''}`}
                placeholder="0.00"
                autoFocus
              />
            </div>
            {amount !== '' && (
              amountInvalid
                ? <p className="text-[11.5px] text-danger">
                    {parsedAmount <= 0
                      ? 'Amount must be greater than ₱0'
                      : isAdvance
                        ? `Exceeds max advance by ${fmtPHP(parsedAmount - cap)}`
                        : `Exceeds balance by ${fmtPHP(parsedAmount - cap)}`}
                  </p>
                : <p className={`text-[11.5px] font-mono ${
                    isAdvance
                      ? 'text-ink-3'
                      : remaining === 0 ? 'text-success' : 'text-ink-3'
                  }`}>
                    {isAdvance
                      ? `${Math.round((parsedAmount / cap) * 100)}% of max advance`
                      : `Remaining after payment: ${fmtPHP(remaining)}`}
                  </p>
            )}
          </Field>

          {/* ── Date ── */}
          <Field label="Date" required>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={INPUT_CLS}
            />
          </Field>

          {/* ── Payment method ── */}
          <Field label="How did they pay?" required>
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

          {/* ── Reference # (non-cash only) ── */}
          {mode !== 'CASH' && (
            <Field label="Reference #" hint="Transaction ID from your bank or e-wallet">
              <input
                type="text"
                value={refNo}
                onChange={e => setRefNo(e.target.value)}
                className={INPUT_CLS}
                placeholder="e.g. 2026031509483712"
              />
            </Field>
          )}

          {/* ── Proof of payment ── */}
          <Field label="Proof of payment" hint="optional — screenshot or scan">
            <div className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-border rounded-btn py-5 text-[13px] text-ink-3 hover:border-border-strong hover:bg-surface-2 transition-colors cursor-pointer">
              <Upload size={18} strokeWidth={1.5} className="text-ink-4" />
              <span>Drop file or <span className="text-accent font-medium">browse</span></span>
            </div>
          </Field>

          {/* ── Notes ── */}
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
