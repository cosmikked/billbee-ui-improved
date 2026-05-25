import { useState } from 'react'
import { Check, Plus, Trash2, Zap } from 'lucide-react'
import { MOCK_PROPERTIES, MOCK_ROOMS, MOCK_CHARGES } from '../../data/mock'
import type { ChargeScope } from '../../types/charges'
import { Drawer } from '../../components/ui/Drawer'
import { Button } from '../../components/ui/Button'
import { DatePicker } from '../../components/ui/DatePicker'

/* â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface AddTenantDrawerProps {
  open: boolean
  onClose: () => void
  /** When set, the property field is shown as read-only (drawer opened from within a property) */
  lockedPropertyId?: string
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

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

const TENANT_LEVEL_SCOPES: ChargeScope[] = ['tenant-level', 'tenant-specific']

function scopeLabel(scope: ChargeScope) {
  if (scope === 'tenant-level')    return 'Tenant-level'
  if (scope === 'tenant-specific') return 'Tenant-specific'
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

export function AddTenantDrawer({ open, onClose, lockedPropertyId }: AddTenantDrawerProps) {
  const [name,            setName]            = useState('')
  const [phone,           setPhone]           = useState('')
  const [email,           setEmail]           = useState('')
  const [emergencyName,   setEmergencyName]   = useState('')
  const [emergencyPhone,  setEmergencyPhone]  = useState('')
  const [propertyId,      setPropertyId]      = useState(lockedPropertyId ?? MOCK_PROPERTIES[0]?.id ?? '')
  const [roomId,          setRoomId]          = useState('')
  const [moveIn,          setMoveIn]          = useState(todayISO())
  const [assignedCharges, setAssignedCharges] = useState<Set<string>>(new Set())
  const [customCharges,   setCustomCharges]   = useState<CustomCharge[]>([])

  // Rooms available for the selected property
  const availableRooms = MOCK_ROOMS.filter(
    r => r.propertyId === propertyId && r.status === 'active',
  )

  // Tenant-level charges for the selected property
  const tenantCharges = MOCK_CHARGES.filter(
    c => c.propertyId === propertyId
      && TENANT_LEVEL_SCOPES.includes(c.scope)
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

  function handlePropertyChange(id: string) {
    setPropertyId(id)
    setRoomId('')
    setAssignedCharges(new Set())
    setCustomCharges([])
  }

  function handleClose() {
    setName('')
    setPhone('')
    setEmail('')
    setEmergencyName('')
    setEmergencyPhone('')
    setPropertyId(lockedPropertyId ?? MOCK_PROPERTIES[0]?.id ?? '')
    setRoomId('')
    setMoveIn(todayISO())
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
              placeholder="â€”"
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
          {lockedPropertyId ? (
            <div className={`${INPUT_CLS} text-ink-3 cursor-default select-none`}>
              {MOCK_PROPERTIES.find(p => p.id === lockedPropertyId)?.name ?? lockedPropertyId}
            </div>
          ) : (
            <select
              value={propertyId}
              onChange={e => handlePropertyChange(e.target.value)}
              className={SEL_CLS}
            >
              {MOCK_PROPERTIES.filter(p => p.status === 'active').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </Field>

        {/* Room */}
        <Field label="Room" hint="Only active rooms for the selected property are shown">
          <select
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            className={SEL_CLS}
            disabled={availableRooms.length === 0}
          >
            <option value="">â€” unassigned â€”</option>
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
          <DatePicker
            value={moveIn}
            onChange={setMoveIn}
            placeholder="Select move-in date"
          />
        </Field>

        {/* â”€â”€ Assign charges â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex flex-col gap-2">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
              Assign charges
            </label>
            <p className="text-[11.5px] text-ink-4 mt-0.5">
              Tenant-level charges from this property's catalog
            </p>
          </div>

          {tenantCharges.length === 0 ? (
            <div className="flex items-center gap-2 rounded-btn border border-dashed border-border px-4 py-3 text-[13px] text-ink-4">
              <Zap size={14} strokeWidth={1.75} className="shrink-0" />
              No tenant-level charges defined for this property yet.
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {tenantCharges.map(charge => {
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

      </div>
    </Drawer>
  )
}


