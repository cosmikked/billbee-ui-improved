import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, X, Info } from 'lucide-react'
import { MOCK_ROOMS } from '../../data/mock'
import type { Room, RentMode } from '../../types/rooms'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { Card, CardHead } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Pill } from '../../components/ui/Pill'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { Callout } from '../../components/ui/Callout'
import { Modal } from '../../components/ui/Modal'

/* ── Types ─────────────────────────────────────────────────── */

type Tab = 'basics' | 'charges' | 'tenants'

/* ── Shared input className ────────────────────────────────── */

const INPUT = [
  'w-full px-3 py-2 text-[13.5px] border border-border rounded-btn',
  'bg-surface text-ink placeholder:text-ink-4',
  'focus:outline-none focus:border-border-strong transition-ui',
].join(' ')

/* ── Inline tab bar ────────────────────────────────────────── */

function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: Tab; label: string; count?: number }[]
  active: Tab
  onChange: (t: Tab) => void
}) {
  return (
    <nav className="flex border-b border-border mb-6">
      {tabs.map(tab => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={[
            'flex items-center gap-1.5 px-1 pb-[10px] pt-1 mr-6 text-[14px] font-medium',
            'border-b-2 -mb-px whitespace-nowrap transition-ui select-none',
            active === tab.key
              ? 'text-ink border-accent'
              : 'text-ink-3 border-transparent hover:text-ink hover:border-border-strong',
          ].join(' ')}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="font-mono text-[12px] text-ink-4">{tab.count}</span>
          )}
        </button>
      ))}
    </nav>
  )
}

/* ── Per-tenant math helpers ───────────────────────────────── */

function MathRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={['flex items-baseline justify-between py-[7px]',
      bold ? 'border-t border-border mt-1 pt-[10px]' : 'border-b border-border-subtle'].join(' ')}>
      <span className={`text-[13px] ${bold ? 'font-semibold text-ink' : 'text-ink-2'}`}>{label}</span>
      <span className={`font-mono text-[13px] ${bold ? 'font-semibold text-ink' : 'text-ink-2'}`}>{value}</span>
    </div>
  )
}

const CSV_ESTIMATES: Record<string, number> = { water: 150, electricity: 400 }

function buildMathRows(room: Room) {
  const n    = room.tenants.length || 1
  const rows: { label: string; value: string; bold?: boolean }[] = []

  const rentShare = room.monthlyRentPHP / n
  rows.push({ label: `Rent share (₱${room.monthlyRentPHP.toLocaleString('en-PH')} ÷ ${n})`, value: `₱${rentShare.toLocaleString('en-PH')}` })

  for (const ch of room.charges) {
    if (ch.type === 'fixed' && ch.amountPHP != null) {
      rows.push({ label: `${ch.name} share (₱${ch.amountPHP} ÷ ${n})`, value: `₱${(ch.amountPHP / n).toLocaleString('en-PH')}` })
    }
  }

  for (const ch of room.charges.filter(c => c.type === 'non-fixed')) {
    rows.push({ label: `${ch.name} share (depends on CSV)`, value: `~₱${CSV_ESTIMATES[ch.id] ?? 0}` })
  }

  const fixedSum    = room.charges.filter(c => c.type === 'fixed' && c.amountPHP != null).reduce((s, c) => s + (c.amountPHP ?? 0) / n, 0)
  const nonFixedEst = room.charges.filter(c => c.type === 'non-fixed').reduce((s, c) => s + (CSV_ESTIMATES[c.id] ?? 0), 0)
  rows.push({ label: 'Subtotal from room', value: `₱${(rentShare + fixedSum + nonFixedEst).toLocaleString('en-PH')}`, bold: true })

  return rows
}

/* ── Tab: Basics ───────────────────────────────────────────── */

function BasicsTab({ room }: { room: Room }) {
  const [name,     setName]     = useState(room.name)
  const [capacity, setCapacity] = useState(String(room.capacity))
  const [rent,     setRent]     = useState(String(room.monthlyRentPHP))
  const [rentMode, setRentMode] = useState<RentMode>(room.rentMode)
  const [status,   setStatus]   = useState(room.status)
  const [notes,    setNotes]    = useState(room.notes)

  const RENT_MODES: readonly RentMode[] = ['Room Total (Split)', 'Per-Tenant']

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHead title="Basic Information" />
        <div className="flex flex-col gap-4">

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-1.5">
              Room name / number <span className="text-danger">*</span>
            </label>
            <input value={name} onChange={e => setName(e.target.value)} className={INPUT} placeholder="e.g. A-101" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-1.5">
                Capacity <span className="text-danger">*</span>
              </label>
              <input type="number" min={1} value={capacity} onChange={e => setCapacity(e.target.value)} className={INPUT} />
              <p className="text-[11.5px] text-ink-4 mt-1">≥ active tenants</p>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-1.5">
                Monthly rent <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13.5px] text-ink-3 pointer-events-none">₱</span>
                <input type="number" min={0} value={rent} onChange={e => setRent(e.target.value)} className={`${INPUT} pl-6`} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-1.5">
              Rent mode <span className="text-danger">*</span>
            </label>
            <SegmentedControl options={RENT_MODES} value={rentMode} onChange={setRentMode} />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-1.5">
              Status <span className="text-danger">*</span>
            </label>
            <SegmentedControl
              options={['Active', 'Inactive', 'Maintenance']}
              value={status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : 'Maintenance'}
              onChange={v => setStatus(v === 'Active' ? 'active' : v === 'Inactive' ? 'inactive' : 'maintenance')}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-1.5">
              Notes
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="optional" rows={3} className={`${INPUT} resize-none`} />
          </div>

          <div className="flex justify-end pt-1">
            <Button variant="accent">Save</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ── Tab: Charges ──────────────────────────────────────────── */

const SCOPE_LABEL: Record<string, string> = {
  'room-level': 'Water',
  'room-fixed': 'Electricity',
}

function ChargesTab({ room }: { room: Room }) {
  const [charges,       setCharges]       = useState(room.charges)
  const [removeTarget,  setRemoveTarget]  = useState<Room['charges'][number] | null>(null)

  const attachedIds = new Set(charges.map(c => c.id))
  const available   = room.availableCharges.filter(c => !attachedIds.has(c.id))

  function confirmRemove() {
    if (!removeTarget) return
    setCharges(prev => prev.filter(c => c.id !== removeTarget.id))
    setRemoveTarget(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-ink-3">
          Room-level &amp; Room-fixed scope only. Tenant-level charges attach per-tenant instead.
        </p>
        <Button variant="accent" size="sm">
          <Plus size={13} strokeWidth={2} />
          Add Charge
        </Button>
      </div>

      {/* Table */}
      <Card noPadding>
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              {['Charge', 'Category', 'Type', 'Amount', ''].map(h => (
                <th
                  key={h}
                  className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap last:w-10"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {charges.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-ink-4">
                  No charges attached yet
                </td>
              </tr>
            ) : (
              charges.map(ch => (
                <tr key={ch.id} className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink">{ch.name}</td>
                  <td className="px-4 py-3 text-ink-3">{SCOPE_LABEL[ch.scope] ?? ch.scope}</td>
                  <td className="px-4 py-3">
                    <Pill variant={ch.type === 'non-fixed' ? 'accent' : 'neutral'}>
                      {ch.type === 'non-fixed' ? 'Non-fixed' : 'Fixed'}
                    </Pill>
                  </td>
                  <td className="px-4 py-3 font-mono text-ink-2">
                    {ch.amountPHP != null ? `₱${ch.amountPHP.toLocaleString('en-PH')}` : <span className="text-ink-4">via CSV</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <IconButton
                      onClick={() => setRemoveTarget(ch)}
                      aria-label={`Remove ${ch.name}`}
                    >
                      <X size={13} strokeWidth={1.75} />
                    </IconButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Remove confirmation modal */}
      <Modal
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title="Remove charge"
        subtitle={removeTarget?.name}
        width={400}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="default" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button variant="accent" onClick={confirmRemove}>Remove</Button>
          </div>
        }
      >
        <p className="text-[13.5px] text-ink-2 leading-relaxed">
          Are you sure you want to remove{' '}
          <strong className="text-ink font-semibold">{removeTarget?.name}</strong> from this room?
          This will affect billing calculations for all tenants in this room.
        </p>
      </Modal>
    </div>
  )
}

/* ── Tab: Tenants ──────────────────────────────────────────── */

function TenantsTab({ room }: { room: Room }) {
  const mathRows = buildMathRows(room)

  return (
    <div className="grid grid-cols-[1fr_320px]" style={{ gap: 'var(--gap-grid)' }}>

      {/* Tenant list */}
      <Card>
        <CardHead
          title={`Current tenants`}
          subtitle="Active tenants assigned to this room"
        />
        {room.tenants.length === 0 ? (
          <p className="text-[13px] text-ink-4 py-6 text-center">No active tenants in this room</p>
        ) : (
          <div className="flex flex-col divide-y divide-border-subtle">
            {room.tenants.map(t => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[13.5px] font-medium text-ink">{t.name}</p>
                  <p className="text-[12px] text-ink-3">Move-in {t.moveInLabel}</p>
                </div>
                <Button size="sm" variant="primary">View Tenant {'->'}</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Per-tenant math preview */}
      <div className="flex flex-col" style={{ gap: 'var(--gap-grid)' }}>
        <Card>
          <CardHead
            title="Per-tenant math preview"
            subtitle="What each active tenant pays from this room (excluding personal charges)"
          />
          <div className="flex flex-col">
            {mathRows.map((row, i) => (
              <MathRow key={i} label={row.label} value={row.value} bold={row.bold} />
            ))}
          </div>
          <div className="mt-4">
            <Callout variant="info" icon={<Info size={16} strokeWidth={1.75} />}>
              <p className="text-[12.5px] text-ink-2">
                Tenant-specific charges (e.g. Parking, Laptop fee) are added on top per tenant.
                If a tenant moves out mid-period, shares recalc on bill regeneration.
              </p>
            </Callout>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

export function RoomDetail() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const [tab, setTab] = useState<Tab>('basics')

  const room = MOCK_ROOMS.find(r => r.id === id)

  if (!room) {
    return (
      <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">
        <p className="text-ink-3 text-[14px]">Room not found.</p>
        <Button variant="default" className="mt-4" onClick={() => navigate('/landlord/rooms')}>
          Back to rooms
        </Button>
      </main>
    )
  }

  const badgeStatus = room.status === 'maintenance' ? 'inactive' : room.status

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'basics',  label: 'Basics' },
    { key: 'charges', label: 'Charges', count: room.charges.length },
    { key: 'tenants', label: 'Tenants', count: room.tenants.length },
  ]

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-[28px] font-bold text-ink tracking-[-0.02em] leading-tight">
            Room {room.name}
          </h1>
          <StatusBadge status={badgeStatus} />
          {room.status === 'maintenance' && <Pill variant="warn">Maintenance</Pill>}
        </div>
      </div>

      {/* Tab bar */}
      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {/* Tab content */}
      {tab === 'basics'  && <BasicsTab  room={room} />}
      {tab === 'charges' && <ChargesTab room={room} />}
      {tab === 'tenants' && <TenantsTab room={room} />}
    </main>
  )
}
