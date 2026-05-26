import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Upload } from 'lucide-react'
import { MOCK_ROOMS } from '../../../data/mock'
import { Button } from '../../../components/ui/Button'

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(n: number) {
  return `₱${n.toLocaleString('en-PH')}`
}

/** Equal-split amount across N tenants, whole pesos. */
function splitAmount(total: number, n: number): number {
  return n > 0 ? Math.round(total / n) : 0
}

/* ── Data types ────────────────────────────────────────────── */

/** One row in Step 1 — room-level amounts entered by landlord. */
interface RoomEntry {
  roomId:      string
  roomName:    string
  tenants:     Array<{ id: string; name: string }>
  roomRentPHP: number   // full room rent (not yet split)
  waterPHP:    number   // room-level total, entered by landlord
  elecPHP:     number   // room-level total, entered by landlord
}

/** One bill produced for Step 2 review — per tenant, derived from RoomEntry. */
interface TenantBill {
  key:        string
  roomId:     string
  roomName:   string
  tenantName: string
  rentShare:  number
  waterShare: number
  elecShare:  number
}

function roomTotal(r: RoomEntry): number {
  return r.roomRentPHP + r.waterPHP + r.elecPHP
}

function billTotal(b: TenantBill): number {
  return b.rentShare + b.waterShare + b.elecShare
}

/** Expand room entries into individual tenant bills. */
function expandToBills(rooms: RoomEntry[]): TenantBill[] {
  return rooms.flatMap(room => {
    const n = room.tenants.length
    return room.tenants.map(t => ({
      key:        `${room.roomId}-${t.id}`,
      roomId:     room.roomId,
      roomName:   room.roomName,
      tenantName: t.name,
      rentShare:  splitAmount(room.roomRentPHP, n),
      waterShare: splitAmount(room.waterPHP,    n),
      elecShare:  splitAmount(room.elecPHP,     n),
    }))
  })
}

/* ── Shared table styles ───────────────────────────────────── */

const TH = 'px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3 text-left whitespace-nowrap'
const TD = 'px-4 py-3 text-[13.5px] align-middle'

/* ── Number input ──────────────────────────────────────────── */

function NumberInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center border border-border rounded-btn overflow-hidden focus-within:border-accent transition-ui bg-surface w-[110px]">
      <span className="pl-2.5 text-[13px] text-ink-4 select-none shrink-0">₱</span>
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

/* ── Step 1: Enter charges per room ───────────────────────── */

function Step1({
  rooms,
  onChange,
  onNext,
}: {
  rooms: RoomEntry[]
  onChange: (roomId: string, field: 'waterPHP' | 'elecPHP', value: number) => void
  onNext: () => void
}) {
  const totalBills = rooms.reduce((s, r) => s + r.tenants.length, 0)
  const grandTotal = rooms.reduce((s, r) => s + roomTotal(r), 0)

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5">
        <p className="text-[14px] text-ink-3 leading-relaxed">
          Enter the water and electricity reading for each room. The system will divide the amounts
          equally among the room's tenants when generating individual bills.
        </p>
        <button
          type="button"
          className="shrink-0 flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-accent border border-border hover:border-accent/40 rounded-btn px-3 py-1.5 transition-ui whitespace-nowrap"
        >
          <Upload size={13} strokeWidth={1.75} />
          Import from file
        </button>
      </div>

      <div className="border border-border rounded-btn overflow-hidden mb-5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              <th className={TH}>Room</th>
              <th className={TH}>Tenants</th>
              <th className={TH}>Room Rent</th>
              <th className={TH}>Water</th>
              <th className={TH}>Electricity</th>
              <th className={`${TH} text-right`}>Room Total</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr
                key={room.roomId}
                className="border-b border-border last:border-0 bg-surface"
              >
                <td className={`${TD} font-semibold text-ink`}>
                  {room.roomName}
                </td>
                <td className={`${TD} text-ink-3`}>
                  {room.tenants.length === 1
                    ? '1 tenant'
                    : `${room.tenants.length} tenants`}
                </td>
                <td className={`${TD} font-mono text-ink-2`}>
                  {fmtPHP(room.roomRentPHP)}
                </td>
                <td className={`${TD}`}>
                  <NumberInput
                    value={room.waterPHP}
                    onChange={v => onChange(room.roomId, 'waterPHP', v)}
                  />
                </td>
                <td className={`${TD}`}>
                  <NumberInput
                    value={room.elecPHP}
                    onChange={v => onChange(room.roomId, 'elecPHP', v)}
                  />
                </td>
                <td className={`${TD} text-right font-mono font-semibold text-ink`}>
                  {fmtPHP(roomTotal(room))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border-strong bg-surface-2">
              <td className={`${TD} font-semibold text-ink`} colSpan={5}>
                {rooms.length} rooms · {totalBills} bills will be created
              </td>
              <td className={`${TD} text-right font-mono text-[15px] font-bold text-ink`}>
                {fmtPHP(grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
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

/* ── Step 2: Review per-tenant bills ──────────────────────── */

function Step2({
  bills,
  rooms,
  dueDate,
  onDueDateChange,
  onBack,
  onConfirm,
}: {
  bills:            TenantBill[]
  rooms:            RoomEntry[]
  dueDate:          string
  onDueDateChange:  (d: string) => void
  onBack:           () => void
  onConfirm:        () => void
}) {
  const grandTotal = bills.reduce((s, b) => s + billTotal(b), 0)

  return (
    <div>
      <p className="text-[14px] text-ink-3 mb-5 leading-relaxed">
        Water and electricity have been split equally among room tenants. Review each bill
        below, set a due date, then confirm to create all drafts.
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

      {/* Per-tenant review table, grouped by room */}
      <div className="border border-border rounded-btn overflow-hidden mb-5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              <th className={TH}>Tenant</th>
              <th className={TH}>Room</th>
              <th className={`${TH} text-right`}>Rent</th>
              <th className={`${TH} text-right`}>Water</th>
              <th className={`${TH} text-right`}>Electricity</th>
              <th className={`${TH} text-right`}>Bill Total</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room, ri) => {
              const roomBills = bills.filter(b => b.roomId === room.roomId)

              return roomBills.map((bill, bi) => {
                const isLastInRoom = bi === roomBills.length - 1
                const isLastRoom   = ri === rooms.length - 1

                return (
                  <tr
                    key={bill.key}
                    className={[
                      'bg-surface transition-colors',
                      !isLastInRoom || !isLastRoom
                        ? isLastInRoom
                          ? 'border-b-2 border-border-strong'
                          : 'border-b border-border'
                        : '',
                    ].join(' ')}
                  >
                    <td className={`${TD} font-medium text-ink`}>
                      {bill.tenantName}
                    </td>
                    <td className={`${TD} text-ink-3`}>
                      {bill.roomName}
                    </td>
                    <td className={`${TD} text-right font-mono text-ink-2`}>
                      {fmtPHP(bill.rentShare)}
                    </td>
                    <td className={`${TD} text-right font-mono text-ink-2`}>
                      {fmtPHP(bill.waterShare)}
                    </td>
                    <td className={`${TD} text-right font-mono text-ink-2`}>
                      {fmtPHP(bill.elecShare)}
                    </td>
                    <td className={`${TD} text-right font-mono font-semibold text-ink`}>
                      {fmtPHP(billTotal(bill))}
                    </td>
                  </tr>
                )
              })
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border-strong bg-surface-2">
              <td className={`${TD} font-semibold text-ink`} colSpan={5}>
                {bills.length} bills · Grand total
              </td>
              <td className={`${TD} text-right font-mono text-[15px] font-bold text-ink`}>
                {fmtPHP(grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="md" onClick={onBack}>
          <ArrowLeft size={14} strokeWidth={1.75} />
          Back
        </Button>
        <Button variant="accent" size="md" onClick={onConfirm}>
          <Check size={14} strokeWidth={2} />
          Create {bills.length} bills
        </Button>
      </div>
    </div>
  )
}

/* ── Step indicator ────────────────────────────────────────── */

function StepBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-7">
      {([
        { n: 1 as const, label: 'Enter room charges' },
        { n: 2 as const, label: 'Review & confirm' },
      ]).map(({ n, label }, i, arr) => {
        const done   = step > n
        const active = step === n
        return (
          <div key={n} className="flex items-center gap-2">
            <div className={[
              'w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-ui',
              done   ? 'bg-success text-white' :
              active ? 'bg-ink text-white'     :
                       'bg-surface-2 text-ink-4 border border-border',
            ].join(' ')}>
              {done ? '✓' : n}
            </div>
            <span className={`text-[13.5px] font-medium ${active ? 'text-ink' : 'text-ink-3'}`}>
              {label}
            </span>
            {i < arr.length - 1 && (
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
        <div className="w-12 h-12 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-4">
          <Check size={22} strokeWidth={2} className="text-success" />
        </div>
        <p className="text-[20px] font-semibold text-ink">Bills created!</p>
        <p className="text-[14px] text-ink-3 mt-1">Taking you back to the cycle…</p>
      </div>
    </main>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

export function CreateBills() {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const propertyId     = searchParams.get('property') ?? 'sunset-mar-2026'

  /** Build initial room entries from occupied rooms in mock data. */
  const initialRooms = useMemo<RoomEntry[]>(() =>
    MOCK_ROOMS
      .filter(r => r.status === 'active' && r.tenants.length > 0)
      .map(room => ({
        roomId:      room.id,
        roomName:    room.name,
        tenants:     room.tenants.map(t => ({ id: t.id, name: t.name })),
        roomRentPHP: room.monthlyRentPHP,
        waterPHP:    0,
        elecPHP:     0,
      })),
  [])

  const [step,    setStep]    = useState<1 | 2>(1)
  const [rooms,   setRooms]   = useState<RoomEntry[]>(initialRooms)
  const [dueDate, setDueDate] = useState('2026-03-15')
  const [done,    setDone]    = useState(false)

  /** Derived per-tenant bills — recomputed whenever room entries change. */
  const bills = useMemo(() => expandToBills(rooms), [rooms])

  function handleChange(roomId: string, field: 'waterPHP' | 'elecPHP', value: number) {
    setRooms(prev =>
      prev.map(r => r.roomId === roomId ? { ...r, [field]: value } : r)
    )
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
        ? (
          <Step1
            rooms={rooms}
            onChange={handleChange}
            onNext={() => setStep(2)}
          />
        ) : (
          <Step2
            bills={bills}
            rooms={rooms}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
            onBack={() => setStep(1)}
            onConfirm={handleConfirm}
          />
        )
      }

    </main>
  )
}
