import { useState } from 'react'
import { MOCK_PROPERTIES, MOCK_ROOMS } from '../../data/mock'
import { Drawer } from '../../components/ui/Drawer'
import { Button } from '../../components/ui/Button'

/* ── Props ─────────────────────────────────────────────────── */

interface AddTenantDrawerProps {
  open: boolean
  onClose: () => void
}

/* ── Helpers ───────────────────────────────────────────────── */

const INPUT_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full placeholder:text-ink-4'

const SEL_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full appearance-none'

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

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

/* ── Component ─────────────────────────────────────────────── */

export function AddTenantDrawer({ open, onClose }: AddTenantDrawerProps) {
  const [name,           setName]           = useState('')
  const [phone,          setPhone]          = useState('')
  const [email,          setEmail]          = useState('')
  const [emergencyName,  setEmergencyName]  = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [propertyId,     setPropertyId]     = useState(MOCK_PROPERTIES[0]?.id ?? '')
  const [roomId,         setRoomId]         = useState('')
  const [moveIn,         setMoveIn]         = useState(todayISO())

  // Rooms available for the selected property
  const availableRooms = MOCK_ROOMS.filter(
    r => r.propertyId === propertyId && r.status === 'active',
  )

  function handlePropertyChange(id: string) {
    setPropertyId(id)
    setRoomId('') // reset room when property changes
  }

  function handleClose() {
    setName('')
    setPhone('')
    setEmail('')
    setEmergencyName('')
    setEmergencyPhone('')
    setPropertyId(MOCK_PROPERTIES[0]?.id ?? '')
    setRoomId('')
    setMoveIn(todayISO())
    onClose()
  }

  function handleAdd() {
    // TODO: persist to backend
    handleClose()
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      side="right"
      width={480}
      title="Add tenant"
      subtitle="Fill in the details to register a new tenant"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="default" onClick={handleClose}>Cancel</Button>
          <Button variant="accent" onClick={handleAdd}>Add tenant</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">

        {/* Name */}
        <Field label="Full name" required>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={INPUT_CLS}
            placeholder="e.g. Juan dela Cruz"
            autoFocus
          />
        </Field>

        {/* Phone + Email */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone" required>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className={INPUT_CLS}
              placeholder="09XX XXX XXXX"
            />
          </Field>
          <Field label="Email" hint="optional">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={INPUT_CLS}
              placeholder="—"
            />
          </Field>
        </div>

        {/* Emergency contact */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
            Emergency contact <span className="text-ink-4 normal-case font-normal tracking-normal">optional</span>
          </span>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={emergencyName}
              onChange={e => setEmergencyName(e.target.value)}
              className={INPUT_CLS}
              placeholder="Name"
            />
            <input
              type="tel"
              value={emergencyPhone}
              onChange={e => setEmergencyPhone(e.target.value)}
              className={INPUT_CLS}
              placeholder="Phone"
            />
          </div>
        </div>

        {/* Property */}
        <Field label="Property" required>
          <select
            value={propertyId}
            onChange={e => handlePropertyChange(e.target.value)}
            className={SEL_CLS}
          >
            {MOCK_PROPERTIES.filter(p => p.status === 'active').map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>

        {/* Room */}
        <Field label="Room" hint="Only active rooms for the selected property are shown">
          <select
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            className={SEL_CLS}
            disabled={availableRooms.length === 0}
          >
            <option value="">— unassigned —</option>
            {availableRooms.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.tenants.length}/{r.capacity} occupied)
              </option>
            ))}
          </select>
          {availableRooms.length === 0 && (
            <p className="text-[11.5px] text-warning">No active rooms available for this property.</p>
          )}
        </Field>

        {/* Move-in date */}
        <Field label="Move-in date" required>
          <input
            type="date"
            value={moveIn}
            onChange={e => setMoveIn(e.target.value)}
            className={INPUT_CLS}
          />
        </Field>

      </div>
    </Drawer>
  )
}
