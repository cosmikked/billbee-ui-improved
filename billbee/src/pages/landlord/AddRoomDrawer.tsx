import { useState } from 'react'
import { Check, Plus, Trash2, Zap } from 'lucide-react'
import { MOCK_PROPERTIES, MOCK_CHARGES } from '../../data/mock'
import type { RentMode, RoomStatus } from '../../types/rooms'
import type { ChargeScope } from '../../types/charges'
// RoomStatus kept for the status state type
import { Drawer } from '../../components/ui/Drawer'
import { Button } from '../../components/ui/Button'
import { SegmentedControl } from '../../components/ui/SegmentedControl'

/* â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface AddRoomDrawerProps {
  open: boolean
  onClose: () => void
}

/* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

/* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const ROOM_LEVEL_SCOPES: ChargeScope[] = ['room-level', 'room-fixed']

function scopeLabel(scope: ChargeScope) {
  if (scope === 'room-level') return 'Room-level'
  if (scope === 'room-fixed') return 'Room-fixed'
  return scope
}

function fmtPHP(n: number) {
  return `â‚±${n.toLocaleString('en-PH')}`
}

/* â”€â”€ Custom charge type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface CustomCharge {
  id: string
  name: string
  amount: string
}

function newCustomCharge(): CustomCharge {
  return { id: crypto.randomUUID(), name: '', amount: '' }
}

/* â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const RENT_MODES: readonly RentMode[] = ['Room Total (Split)', 'Per-Tenant']

export function AddRoomDrawer({ open, onClose }: AddRoomDrawerProps) {
  const [name,            setName]            = useState('')
  const [propertyId,      setPropertyId]      = useState(MOCK_PROPERTIES[0]?.id ?? '')
  const [capacity,        setCapacity]        = useState('1')
  const [rent,            setRent]            = useState('')
  const [rentMode,        setRentMode]        = useState<RentMode>('Room Total (Split)')
  const [status,          setStatus]          = useState<RoomStatus>('active')
  const [notes,           setNotes]           = useState('')
  const [assignedCharges, setAssignedCharges] = useState<Set<string>>(new Set())
  const [customCharges,   setCustomCharges]   = useState<CustomCharge[]>([])

  // Room-level charges for the selected property
  const roomCharges = MOCK_CHARGES.filter(
    c => c.propertyId === propertyId
      && ROOM_LEVEL_SCOPES.includes(c.scope)
      && c.status === 'active',
  )

  function toggleCharge(id: string) {
    setAssignedCharges(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function addCustomCharge() {
    setCustomCharges(prev => [...prev, newCustomCharge()])
  }

  function updateCustomCharge(id: string, field: 'name' | 'amount', value: string) {
    setCustomCharges(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  function removeCustomCharge(id: string) {
    setCustomCharges(prev => prev.filter(c => c.id !== id))
  }

  function handleClose() {
    setName('')
    setPropertyId(MOCK_PROPERTIES[0]?.id ?? '')
    setCapacity('1')
    setRent('')
    setRentMode('Room Total (Split)')
    setStatus('active')
    setNotes('')
    setAssignedCharges(new Set())
    setCustomCharges([])
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
      width="50vw"
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
          <Field label="Capacity" required hint="â‰¥ active tenants">
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
                â‚±
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

        {/* â”€â”€ Assign charges â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex flex-col gap-2">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
              Assign charges
            </label>
            <p className="text-[11.5px] text-ink-4 mt-0.5">
              Room-level charges from this property's catalog
            </p>
          </div>

          {roomCharges.length === 0 ? (
            <div className="flex items-center gap-2 rounded-btn border border-dashed border-border px-4 py-3 text-[13px] text-ink-4">
              <Zap size={14} strokeWidth={1.75} className="shrink-0" />
              No room-level charges defined for this property yet.
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {roomCharges.map(charge => {
                const checked = assignedCharges.has(charge.id)
                return (
                  <button
                    key={charge.id}
                    type="button"
                    onClick={() => toggleCharge(charge.id)}
                    className={[
                      'w-full text-left flex items-center gap-3 rounded-btn border px-3 py-2.5 transition-ui',
                      checked
                        ? 'border-accent bg-accent/5'
                        : 'border-border bg-surface hover:bg-surface-2 hover:border-border-strong',
                    ].join(' ')}
                  >
                    {/* Checkbox */}
                    <span className={[
                      'shrink-0 w-4 h-4 rounded flex items-center justify-center border transition-ui',
                      checked
                        ? 'bg-accent border-accent'
                        : 'border-border-strong bg-surface',
                    ].join(' ')}>
                      {checked && <Check size={10} strokeWidth={3} className="text-white" />}
                    </span>

                    {/* Charge info */}
                    <span className="flex-1 min-w-0">
                      <span className="text-[13.5px] font-medium text-ink">{charge.name}</span>
                      <span className="text-[11.5px] text-ink-4 ml-2">{scopeLabel(charge.scope)}</span>
                    </span>

                    {/* Amount or variable */}
                    {charge.defaultAmountPHP !== null ? (
                      <span className="shrink-0 font-mono text-[12.5px] text-ink-2">
                        {fmtPHP(charge.defaultAmountPHP)}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[11.5px] text-ink-4 italic">variable</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Custom charges */}
          {customCharges.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              {customCharges.map(c => (
                <div key={c.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={c.name}
                    onChange={e => updateCustomCharge(c.id, 'name', e.target.value)}
                    placeholder="Charge name"
                    className={`${INPUT_CLS} flex-1`}
                  />
                  <div className="relative w-[110px] shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-3 pointer-events-none">â‚±</span>
                    <input
                      type="number"
                      min={0}
                      value={c.amount}
                      onChange={e => updateCustomCharge(c.id, 'amount', e.target.value)}
                      placeholder="0"
                      className={`${INPUT_CLS} pl-6`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomCharge(c.id)}
                    className="shrink-0 p-1.5 text-ink-4 hover:text-danger transition-colors"
                    aria-label="Remove charge"
                  >
                    <Trash2 size={14} strokeWidth={1.75} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add custom charge button */}
          <button
            type="button"
            onClick={addCustomCharge}
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-3 hover:text-accent transition-colors self-start mt-0.5"
          >
            <Plus size={13} strokeWidth={2} />
            Add one-time charge
          </button>
        </div>

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


