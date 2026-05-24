import { useState } from 'react'
import { MOCK_PROPERTIES } from '../../data/mock'
import type { RentMode, RoomStatus } from '../../types/rooms'
// RoomStatus kept for the status state type
import { Drawer } from '../../components/ui/Drawer'
import { Button } from '../../components/ui/Button'
import { SegmentedControl } from '../../components/ui/SegmentedControl'

/* ── Props ─────────────────────────────────────────────────── */

interface AddRoomDrawerProps {
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

/* ── Component ─────────────────────────────────────────────── */

const RENT_MODES: readonly RentMode[] = ['Room Total (Split)', 'Per-Tenant']

export function AddRoomDrawer({ open, onClose }: AddRoomDrawerProps) {
  const [name,       setName]       = useState('')
  const [propertyId, setPropertyId] = useState(MOCK_PROPERTIES[0]?.id ?? '')
  const [capacity,   setCapacity]   = useState('1')
  const [rent,       setRent]       = useState('')
  const [rentMode,   setRentMode]   = useState<RentMode>('Room Total (Split)')
  const [status,     setStatus]     = useState<RoomStatus>('active')
  const [notes,      setNotes]      = useState('')

  function handleClose() {
    setName('')
    setPropertyId(MOCK_PROPERTIES[0]?.id ?? '')
    setCapacity('1')
    setRent('')
    setRentMode('Room Total (Split)')
    setStatus('active')
    setNotes('')
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
      title="Add room"
      subtitle="Fill in the details to add a new room"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="default" onClick={handleClose}>Cancel</Button>
          <Button variant="accent" onClick={handleAdd}>Add room</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">

        <Field label="Property" required>
          <select
            value={propertyId}
            onChange={e => setPropertyId(e.target.value)}
            className={SEL_CLS}
          >
            {MOCK_PROPERTIES.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Room name / number" required hint="e.g. A-101, Unit 3B">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={INPUT_CLS}
            placeholder="e.g. A-101"
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Capacity" required hint="≥ active tenants">
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={e => setCapacity(e.target.value)}
              className={INPUT_CLS}
            />
          </Field>

          <Field label="Monthly rent" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13.5px] text-ink-3 pointer-events-none">
                ₱
              </span>
              <input
                type="number"
                min={0}
                value={rent}
                onChange={e => setRent(e.target.value)}
                className={`${INPUT_CLS} pl-6`}
                placeholder="0"
              />
            </div>
          </Field>
        </div>

        <Field label="Rent mode" required>
          <SegmentedControl
            options={RENT_MODES}
            value={rentMode}
            onChange={setRentMode}
          />
        </Field>

        <Field label="Status" required>
          <SegmentedControl
            options={['Active', 'Inactive', 'Maintenance']}
            value={status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : 'Maintenance'}
            onChange={v => setStatus(v === 'Active' ? 'active' : v === 'Inactive' ? 'inactive' : 'maintenance')}
          />
        </Field>

        <Field label="Notes">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="optional"
            rows={3}
            className={`${INPUT_CLS} resize-none`}
          />
        </Field>

      </div>
    </Drawer>
  )
}
