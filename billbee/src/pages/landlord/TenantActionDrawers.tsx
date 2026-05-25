import { useState } from 'react'
import { AlertTriangle, ArrowRight, Info } from 'lucide-react'
import { MOCK_ROOMS } from '../../data/mock'
import { Drawer } from '../../components/ui/Drawer'
import { Button } from '../../components/ui/Button'
import { Callout } from '../../components/ui/Callout'
import { Pill } from '../../components/ui/Pill'
import type { Tenant } from '../../types/tenants'

/* â”€â”€ Shared helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const INPUT_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full placeholder:text-ink-4'

const TEXTAREA_CLS = INPUT_CLS + ' resize-none'

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

function fmtPHP(n: number) {
  return `â‚±${n.toLocaleString('en-PH')}`
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

/* â”€â”€ Move-out drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface MoveOutDrawerProps {
  open: boolean
  onClose: () => void
  tenant: Tenant
}

const MOVE_OUT_REASONS = [
  'Contract ended',
  'Personal reasons',
  'Relocated',
  'Non-payment',
  'Other',
]

export function MoveOutDrawer({ open, onClose, tenant }: MoveOutDrawerProps) {
  const [moveOutDate, setMoveOutDate] = useState(todayISO())
  const [reason,      setReason]      = useState('')
  const [notes,       setNotes]       = useState('')

  function handleClose() {
    setMoveOutDate(todayISO())
    setReason('')
    setNotes('')
    onClose()
  }

  function handleConfirm() {
    // TODO: persist to backend
    handleClose()
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      side="right"
      width="50vw"
      title="Move out"
      subtitle={`Close ${tenant.name}'s assignment and keep posted bills payable`}
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="default" onClick={handleClose}>Cancel</Button>
          <Button variant="accent" onClick={handleConfirm}>Confirm move out</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">

        {/* Tenant summary (read-only) */}
        <div className="rounded-btn border border-border bg-surface-2 px-4 py-3 flex flex-col gap-1">
          <span className="text-[13.5px] font-semibold text-ink">{tenant.name}</span>
          <span className="text-[12.5px] text-ink-3">
            {tenant.propertyName} Â· {tenant.roomCode ?? '--'} Â· since {tenant.moveInLabel}
          </span>
        </div>

        {/* Move-out date */}
        <Field label="Move-out date" required>
          <input
            type="date"
            value={moveOutDate}
            onChange={e => setMoveOutDate(e.target.value)}
            className={INPUT_CLS}
          />
        </Field>

        {/* Reason */}
        <Field label="Reason">
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className={INPUT_CLS + ' appearance-none'}
          >
            <option value="">â€” select a reason â€”</option>
            {MOVE_OUT_REASONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>

        {/* Notes */}
        <Field label="Notes">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className={TEXTAREA_CLS}
            placeholder="optional"
          />
        </Field>

        {/* Warning callout */}
        <Callout variant="warning" icon={<AlertTriangle size={16} strokeWidth={1.75} />}>
          This will close the tenant's room assignment. Any unpaid posted bills will remain payable.
        </Callout>

      </div>
    </Drawer>
  )
}

/* â”€â”€ Transfer room drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface TransferRoomDrawerProps {
  open: boolean
  onClose: () => void
  tenant: Tenant
}

export function TransferRoomDrawer({ open, onClose, tenant }: TransferRoomDrawerProps) {
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [effectiveDate,  setEffectiveDate]  = useState(todayISO())

  // Rooms in same property, active, with capacity, excluding current room
  const availableRooms = MOCK_ROOMS.filter(
    r =>
      r.propertyId !== undefined &&
      r.status === 'active' &&
      r.tenants.length < r.capacity &&
      r.name !== tenant.roomCode,
  )

  const selectedRoom = availableRooms.find(r => r.id === selectedRoomId)

  function handleClose() {
    setSelectedRoomId('')
    setEffectiveDate(todayISO())
    onClose()
  }

  function handleTransfer() {
    // TODO: persist to backend
    handleClose()
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      side="right"
      width="50vw"
      title="Transfer room"
      subtitle="Move tenant to an active room with available capacity"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="default" onClick={handleClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleTransfer}
          >
            Transfer
            <ArrowRight size={13} strokeWidth={1.75} />
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">

        {/* Tenant summary (read-only) */}
        <div className="rounded-btn border border-border bg-surface-2 px-4 py-3 flex flex-col gap-1">
          <span className="text-[13.5px] font-semibold text-ink">{tenant.name}</span>
          <span className="text-[12.5px] text-ink-3">
            {tenant.propertyName} Â· {tenant.roomCode ?? '--'} Â· since {tenant.moveInLabel}
          </span>
        </div>

        {/* From (read-only) */}
        <Field label="From">
          <div className="rounded-btn border border-border bg-surface-2 px-3 py-2 flex items-center justify-between gap-3">
            <span className="text-[13.5px] text-ink">
              {tenant.propertyName}
              {tenant.roomCode && (
                <span className="font-mono ml-1.5 text-ink-2">Â· {tenant.roomCode}</span>
              )}
            </span>
            <Pill variant="neutral">current</Pill>
          </div>
        </Field>

        {/* To â€” room selector */}
        <Field
          label="To"
          required
          hint="Only active rooms with available capacity are shown"
        >
          <div className="flex flex-col gap-2">
            {availableRooms.length === 0 ? (
              <p className="text-[12.5px] text-warning">
                No other active rooms with capacity available.
              </p>
            ) : (
              availableRooms.map(room => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setSelectedRoomId(room.id)}
                  className={[
                    'border rounded-btn px-3 py-2.5 flex items-center justify-between gap-3 transition-colors text-left',
                    selectedRoomId === room.id
                      ? 'bg-accent/10 border-accent text-ink'
                      : 'bg-surface border-border text-ink hover:bg-surface-2 hover:border-border-strong',
                  ].join(' ')}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-[13.5px] font-medium">{room.name}</span>
                    <span className="text-[12px] text-ink-3">
                      {room.tenants.length}/{room.capacity} occupied Â· {fmtPHP(room.monthlyRentPHP)}/mo
                    </span>
                  </div>
                  {selectedRoomId === room.id && (
                    <Pill variant="info">selected</Pill>
                  )}
                </button>
              ))
            )}
          </div>
        </Field>

        {/* Effective date */}
        <Field label="Effective date" required>
          <input
            type="date"
            value={effectiveDate}
            onChange={e => setEffectiveDate(e.target.value)}
            className={INPUT_CLS}
          />
        </Field>

        {/* Info callout â€” shown when a room is selected */}
        {selectedRoom && (
          <Callout variant="info" icon={<Info size={16} strokeWidth={1.75} />}>
            New rent share at <span className="font-mono font-medium">{selectedRoom.name}</span>:{' '}
            <span className="font-mono font-semibold">
              {fmtPHP(Math.round(selectedRoom.monthlyRentPHP / (selectedRoom.tenants.length + 1)))}
            </span>
            /mo (estimated with {selectedRoom.tenants.length + 1} tenants).
          </Callout>
        )}

      </div>
    </Drawer>
  )
}


