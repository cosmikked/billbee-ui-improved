import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import { MOCK_PROPERTIES } from '../../data/mock'
import type { Charge, ChargeScope, ChargeType } from '../../types/charges'
import { Drawer } from '../../components/ui/Drawer'
import { Button } from '../../components/ui/Button'
import { Callout } from '../../components/ui/Callout'
import { SegmentedControl } from '../../components/ui/SegmentedControl'

/* â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface EditChargeDrawerProps {
  charge: Charge | null
  onClose: () => void
  onSave: (updated: Charge) => void
}

/* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const INPUT_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full placeholder:text-ink-4'

const SEL_CLS = INPUT_CLS + ' appearance-none'

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

/* â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const CHARGE_TYPES: readonly ChargeType[] = ['fixed', 'non-fixed', 'tenant-specific']
const CHARGE_TYPE_LABELS: Record<ChargeType, string> = {
  'fixed':           'Fixed',
  'non-fixed':       'Non-fixed',
  'tenant-specific': 'Tenant-specific',
}

const CHARGE_SCOPES: readonly ChargeScope[] = ['room-level', 'room-fixed', 'tenant-level']
const CHARGE_SCOPE_LABELS: Record<ChargeScope, string> = {
  'room-level':   'Room-level',
  'room-fixed':   'Room-fixed',
  'tenant-level': 'Tenant-level',
}

const SCOPE_HINT: Record<ChargeScope, string> = {
  'room-level':   'Split among all active tenants in the room each billing cycle.',
  'room-fixed':   'Fixed charge attached to the room regardless of tenant count.',
  'tenant-level': 'Billed directly to individual tenants.',
}

const TYPE_SCOPE_MAP: Record<ChargeType, ChargeScope> = {
  'fixed':           'room-level',
  'non-fixed':       'room-level',
  'tenant-specific': 'tenant-level',
}

const SUGGESTED_CATEGORIES = [
  'Utilities', 'Rent', 'Internet', 'Parking', 'Laundry', 'Maintenance', 'Other',
]

/* â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function EditChargeDrawer({ charge, onClose, onSave }: EditChargeDrawerProps) {
  const [propertyId, setPropertyId] = useState('')
  const [name,       setName]       = useState('')
  const [category,   setCategory]   = useState('')
  const [customCat,  setCustomCat]  = useState('')
  const [type,       setType]       = useState<ChargeType>('fixed')
  const [scope,      setScope]      = useState<ChargeScope>('room-level')
  const [amount,     setAmount]     = useState('')
  const [status,     setStatus]     = useState<'active' | 'inactive'>('active')

  // Sync fields whenever the target charge changes
  useEffect(() => {
    if (!charge) return
    setPropertyId(charge.propertyId)
    setName(charge.name)

    const isKnown = SUGGESTED_CATEGORIES.includes(charge.category)
    setCategory(isKnown ? charge.category : '__custom__')
    setCustomCat(isKnown ? '' : charge.category)

    setType(charge.type)
    setScope(charge.scope)
    setAmount(charge.defaultAmountPHP != null ? String(charge.defaultAmountPHP) : '')
    setStatus(charge.status)
  }, [charge])

  function handleTypeChange(t: ChargeType) {
    setType(t)
    setScope(TYPE_SCOPE_MAP[t])
    if (t === 'non-fixed') setAmount('')
  }

  function handleSave() {
    if (!charge) return
    onSave({
      ...charge,
      propertyId,
      name,
      category: category === '__custom__' ? customCat : category,
      type,
      scope,
      defaultAmountPHP: amount !== '' ? Number(amount) : null,
      status,
    })
    onClose()
  }

  return (
    <Drawer
      open={charge !== null}
      onClose={onClose}
      side="right"
      width="50vw"
      title="Edit charge"
      subtitle={charge ? `Editing "${charge.name}"` : ''}
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button variant="accent" onClick={handleSave}>Save changes</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">

        {/* Property */}
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

        {/* Charge name */}
        <Field label="Charge name" required hint="Must be unique per active property">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={INPUT_CLS}
            placeholder="e.g. Water Bill, Parking Fee"
          />
        </Field>

        {/* Category */}
        <Field label="Category" required>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className={SEL_CLS}
          >
            <option value="">â€” select a category â€”</option>
            {SUGGESTED_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="__custom__">Customâ€¦</option>
          </select>
          {category === '__custom__' && (
            <input
              type="text"
              value={customCat}
              onChange={e => setCustomCat(e.target.value)}
              className={INPUT_CLS}
              placeholder="Enter custom category"
            />
          )}
        </Field>

        {/* Type */}
        <Field
          label="Type"
          required
          hint={
            type === 'fixed'           ? 'Requires a set amount billed every cycle.' :
            type === 'non-fixed'       ? 'Amount varies â€” entered via CSV at billing time.' :
                                         'Attached to a specific tenant, not the room.'
          }
        >
          <SegmentedControl
            options={CHARGE_TYPES.map(t => CHARGE_TYPE_LABELS[t]) as unknown as readonly string[]}
            value={CHARGE_TYPE_LABELS[type]}
            onChange={label => {
              const found = CHARGE_TYPES.find(t => CHARGE_TYPE_LABELS[t] === label)
              if (found) handleTypeChange(found)
            }}
          />
        </Field>

        {/* Scope */}
        <Field label="Scope" required hint={SCOPE_HINT[scope]}>
          <SegmentedControl
            options={CHARGE_SCOPES.map(s => CHARGE_SCOPE_LABELS[s]) as unknown as readonly string[]}
            value={CHARGE_SCOPE_LABELS[scope]}
            onChange={label => {
              const found = CHARGE_SCOPES.find(s => CHARGE_SCOPE_LABELS[s] === label)
              if (found) setScope(found)
            }}
          />
        </Field>

        {/* Default amount */}
        {type !== 'non-fixed' && (
          <Field
            label="Default amount"
            required={type !== 'non-fixed'}
            hint={type === 'tenant-specific' ? 'Can be overridden per tenant.' : 'Can be overridden per room.'}
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13.5px] text-ink-3 pointer-events-none">
                â‚±
              </span>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className={`${INPUT_CLS} pl-6`}
                placeholder="0"
              />
            </div>
          </Field>
        )}

        {/* Status */}
        <Field label="Status" required>
          <SegmentedControl
            options={['Active', 'Inactive']}
            value={status === 'active' ? 'Active' : 'Inactive'}
            onChange={v => setStatus(v === 'Active' ? 'active' : 'inactive')}
          />
        </Field>

        {/* Info callout */}
        <Callout variant="info" icon={<Info size={16} strokeWidth={1.75} />}>
          Changes apply to future bills only. Posted bills are not affected.
        </Callout>

      </div>
    </Drawer>
  )
}


