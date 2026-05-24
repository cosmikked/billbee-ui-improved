import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { Drawer } from '../../components/ui/Drawer'
import { Button } from '../../components/ui/Button'

/* ── Types ─────────────────────────────────────────────────── */

interface CreatePropertyDrawerProps {
  open: boolean
  onClose: () => void
}

/* ── Helpers ───────────────────────────────────────────────── */

const INPUT_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full placeholder:text-ink-4'

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

/* ── Billing day field ─────────────────────────────────────── */

const DAYS = Array.from({ length: 30 }, (_, i) => i + 1)

function BillingDayField({
  value,
  onChange,
}: {
  value: number | null
  onChange: (d: number) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={[
          'flex items-center justify-between w-full px-3 py-2 rounded-btn border transition-colors text-[13.5px]',
          open
            ? 'border-accent bg-surface'
            : 'border-border bg-surface hover:border-border-strong',
          value === null ? 'text-ink-4' : 'text-ink',
        ].join(' ')}
      >
        <span>{value === null ? 'Select billing day' : `Day ${value}`}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.75}
          className={`text-ink-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-surface border border-border rounded-card shadow-lg p-3 flex flex-col gap-3">
          <p className="text-[11.5px] text-ink-4">Day of the month bills are generated</p>
          <div className="grid grid-cols-6 gap-1.5">
            {DAYS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => { onChange(d); setOpen(false) }}
                className={[
                  'h-9 w-full rounded-btn text-[13px] font-medium transition-colors',
                  value === d
                    ? 'bg-accent text-white'
                    : 'bg-surface-2 text-ink-2 hover:bg-surface border border-border hover:border-border-strong',
                ].join(' ')}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Status toggle ─────────────────────────────────────────── */

function StatusToggle({
  active,
  onChange,
}: {
  active: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex rounded-btn border border-border overflow-hidden w-fit">
      {(['active', 'inactive'] as const).map(s => {
        const isSelected = (s === 'active') === active
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s === 'active')}
            className={[
              'px-4 py-2 text-[13px] font-medium capitalize transition-colors',
              isSelected
                ? 'bg-ink text-bg'
                : 'bg-surface text-ink-3 hover:bg-surface-2',
            ].join(' ')}
          >
            {s}
          </button>
        )
      })}
    </div>
  )
}

/* ── Component ─────────────────────────────────────────────── */

export function CreatePropertyDrawer({ open, onClose }: CreatePropertyDrawerProps) {
  const [name,       setName]       = useState('')
  const [address,    setAddress]    = useState('')
  const [billingDay, setBillingDay] = useState<number | null>(null)
  const [active,     setActive]     = useState(true)

  function handleCreate() {
    // TODO: persist to backend
    onClose()
  }

  function handleClose() {
    setName('')
    setAddress('')
    setBillingDay(null)
    setActive(true)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      side="right"
      width={480}
      title="Create property"
      subtitle="Fill in the details to add a new property"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="default" onClick={handleClose}>Cancel</Button>
          <Button variant="accent" onClick={handleCreate}>Create property</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">

        <Field label="Property name" required>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={INPUT_CLS}
            placeholder="e.g. Sunset Apartments"
            autoFocus
          />
        </Field>

        <Field label="Address" required>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className={INPUT_CLS}
            placeholder="e.g. 12 Mabini St, Quezon City"
          />
        </Field>

        <Field label="Billing day" required>
          <BillingDayField value={billingDay} onChange={setBillingDay} />
        </Field>

        <Field label="Status">
          <StatusToggle active={active} onChange={setActive} />
        </Field>

      </div>
    </Drawer>
  )
}
