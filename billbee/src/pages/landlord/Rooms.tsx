import { useState } from 'react'
import { Plus, Search, X, Info } from 'lucide-react'
import { MOCK_ROOMS, MOCK_PROPERTIES } from '../../data/mock'
import type { Room, RentMode } from '../../types/rooms'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { Card, CardHead } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Pill } from '../../components/ui/Pill'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { Callout } from '../../components/ui/Callout'

/* ── Shared input className ────────────────────────────────── */

const INPUT = [
  'w-full px-3 py-2 text-[13.5px] border border-border rounded-btn',
  'bg-surface text-ink placeholder:text-ink-4',
  'focus:outline-none focus:border-border-strong transition-ui',
].join(' ')

/* ── Per-tenant math preview ───────────────────────────────── */

function MathRow({
  label,
  value,
  bold = false,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div
      className={[
        'flex items-center justify-between py-[6px]',
        bold ? 'border-t border-border mt-1 pt-[8px]' : 'border-b border-border-subtle',
      ].join(' ')}
    >
      <span className={`text-[13px] ${bold ? 'font-semibold text-ink' : 'text-ink-2'}`}>
        {label}
      </span>
      <span className={`font-mono text-[13px] ${bold ? 'font-semibold text-ink' : 'text-ink-2'}`}>
        {value}
      </span>
    </div>
  )
}

function buildMathRows(room: Room) {
  const activeTenants = room.tenants.length || 1 // avoid div/0 in preview
  const rows: { label: string; value: string; bold?: boolean }[] = []

  // Rent share
  const rentShare = room.monthlyRentPHP / activeTenants
  rows.push({
    label: `Rent share (₱${room.monthlyRentPHP.toLocaleString('en-PH')} ÷ ${activeTenants})`,
    value: `₱${rentShare.toLocaleString('en-PH')}`,
  })

  // Fixed room charges
  for (const ch of room.charges) {
    if (ch.type === 'fixed' && ch.amountPHP != null) {
      const share = ch.amountPHP / activeTenants
      rows.push({
        label: `${ch.name} share (₱${ch.amountPHP} ÷ ${activeTenants})`,
        value: `₱${share.toLocaleString('en-PH')}`,
      })
    }
  }

  // Non-fixed charges
  const nonFixed = room.charges.filter(c => c.type === 'non-fixed')
  const CSV_ESTIMATES: Record<string, number> = { water: 150, electricity: 400 }
  for (const ch of nonFixed) {
    const est = CSV_ESTIMATES[ch.id] ?? 0
    rows.push({
      label: `${ch.name} share (depends on CSV)`,
      value: `~₱${est}`,
    })
  }

  // Subtotal
  const fixedSum = room.charges
    .filter(c => c.type === 'fixed' && c.amountPHP != null)
    .reduce((s, c) => s + (c.amountPHP ?? 0) / activeTenants, 0)
  const estNonFixed = nonFixed.reduce((s, c) => s + (CSV_ESTIMATES[c.id] ?? 0), 0)
  const subtotal = rentShare + fixedSum + estNonFixed

  rows.push({ label: 'Subtotal from room', value: `₱${subtotal.toLocaleString('en-PH')}`, bold: true })

  return rows
}

/* ── Room list item ────────────────────────────────────────── */

function RoomListItem({
  room,
  selected,
  onClick,
}: {
  room: Room
  selected: boolean
  onClick: () => void
}) {
  const occupancy = `${room.tenants.length}/${room.capacity}`

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full text-left px-3 py-2.5 rounded-btn transition-ui',
        selected
          ? 'bg-ink text-white'
          : 'hover:bg-surface-2 text-ink',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <span className={`font-medium text-[13.5px] ${selected ? 'text-white' : 'text-ink'}`}>
          {room.name}
        </span>
        <span className={`font-mono text-[12px] ${selected ? 'text-white/70' : 'text-ink-3'}`}>
          {occupancy}
        </span>
      </div>
      <div className={`text-[12px] mt-0.5 ${selected ? 'text-white/60' : 'text-ink-3'}`}>
        {room.status === 'maintenance'
          ? '· maintenance'
          : `₱${room.monthlyRentPHP.toLocaleString('en-PH')} · ${room.status}`}
      </div>
    </button>
  )
}

/* ── Charge item ───────────────────────────────────────────── */

function ChargeItem({
  charge,
  onRemove,
}: {
  charge: Room['charges'][number]
  onRemove: () => void
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border-subtle last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-[13.5px] text-ink">{charge.name}</span>
          <Pill variant={charge.type === 'non-fixed' ? 'accent' : 'neutral'}>
            {charge.type === 'non-fixed' ? 'NON-FIXED' : 'FIXED'}
          </Pill>
        </div>
        <p className="text-[12px] text-ink-3">{charge.description}</p>
      </div>
      <IconButton onClick={onRemove} aria-label={`Remove ${charge.name}`}>
        <X size={13} strokeWidth={1.75} />
      </IconButton>
    </div>
  )
}

/* ── Room detail panel ─────────────────────────────────────── */

function RoomDetail({ room }: { room: Room }) {
  const [name,     setName]     = useState(room.name)
  const [capacity, setCapacity] = useState(String(room.capacity))
  const [rent,     setRent]     = useState(String(room.monthlyRentPHP))
  const [rentMode, setRentMode] = useState<RentMode>(room.rentMode)
  const [notes,    setNotes]    = useState(room.notes)
  const [charges,  setCharges]  = useState(room.charges)

  const RENT_MODE_OPTIONS: readonly RentMode[] = ['Room Total (Split)', 'Per-Tenant']

  const mathRows = buildMathRows({ ...room, charges, tenants: room.tenants })

  function removeCharge(id: string) {
    setCharges(prev => prev.filter(c => c.id !== id))
  }

  // Derive available (not yet attached)
  const attachedIds = new Set(charges.map(c => c.id))
  const available = room.availableCharges.filter(c => !attachedIds.has(c.id))

  // Status badge — map maintenance to a neutral display
  const badgeStatus = room.status === 'maintenance' ? 'inactive' : room.status

  return (
    <div className="flex-1 overflow-y-auto px-8 pt-7 pb-16">
      {/* Breadcrumb */}
      <p className="text-[12.5px] text-ink-3 mb-3">
        sunset
        <span className="mx-1.5 text-ink-4">·</span>
        rooms
        <span className="mx-1.5 text-ink-4">·</span>
        {room.name}
      </p>

      {/* Title row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-[28px] font-bold text-ink tracking-[-0.02em] leading-tight">
            Room {name}
          </h1>
          <StatusBadge status={badgeStatus} />
          {room.status === 'maintenance' && (
            <span className="font-mono text-[11.5px] px-1.5 py-px rounded-xs bg-warning-soft text-warning">
              MAINTENANCE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="default" size="sm">Change status</Button>
          <Button variant="primary" size="sm">Save</Button>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-[1fr_272px]" style={{ gap: 'var(--gap-grid)' }}>

        {/* ── Left column ── */}
        <div className="flex flex-col" style={{ gap: 'var(--gap-grid)' }}>

          {/* Room basics */}
          <Card>
            <CardHead title="Room basics" />
            <div className="flex flex-col gap-4">
              {/* Room name */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-1.5">
                  Room name / number <span className="text-danger">*</span>
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={INPUT}
                  placeholder="e.g. A-101"
                />
              </div>

              {/* Capacity + Rent — 2-col */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-1.5">
                    Capacity <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    className={INPUT}
                  />
                  <p className="text-[11.5px] text-ink-4 mt-1">≥ active tenants</p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-1.5">
                    Monthly rent <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13.5px] text-ink-3 pointer-events-none">
                      ₱
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={rent}
                      onChange={e => setRent(e.target.value)}
                      className={`${INPUT} pl-6`}
                    />
                  </div>
                </div>
              </div>

              {/* Rent mode */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-1.5">
                  Rent mode <span className="text-danger">*</span>
                </label>
                <SegmentedControl
                  options={RENT_MODE_OPTIONS}
                  value={rentMode}
                  onChange={setRentMode}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="optional"
                  rows={3}
                  className={`${INPUT} resize-none`}
                />
              </div>
            </div>
          </Card>

          {/* Charges attached to this room */}
          <Card>
            <CardHead
              title="Charges attached to this room"
              subtitle="Room-level &amp; Room-fixed scope only. Tenant-level charges (e.g. Parking) attach per-tenant instead."
              actions={
                <Button variant="default" size="sm">
                  <Plus size={13} strokeWidth={2} />
                  From catalog
                </Button>
              }
            />

            {/* Charge list */}
            <div>
              {charges.length === 0 ? (
                <p className="text-[13px] text-ink-4 py-4 text-center">No charges attached yet</p>
              ) : (
                charges.map(ch => (
                  <ChargeItem
                    key={ch.id}
                    charge={ch}
                    onRemove={() => removeCharge(ch.id)}
                  />
                ))
              )}
            </div>

            {/* Available to add */}
            {available.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border-subtle">
                <span className="text-[12px] text-ink-4 mr-2">Available to add:</span>
                {available.map((ch, i) => (
                  <span key={ch.id}>
                    <button
                      type="button"
                      className="text-[12px] text-ink-3 hover:text-ink underline underline-offset-2 transition-ui"
                    >
                      {ch.name}
                    </button>
                    {i < available.length - 1 && (
                      <span className="text-ink-4 mx-1.5">·</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col" style={{ gap: 'var(--gap-grid)' }}>

          {/* Current tenants */}
          <Card>
            <CardHead
              title={`Current tenants (${room.tenants.length} of ${room.capacity})`}
            />
            {room.tenants.length === 0 ? (
              <p className="text-[13px] text-ink-4">No active tenants</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {room.tenants.map(t => (
                  <li key={t.id} className="flex items-center justify-between">
                    <span className="text-[13.5px] text-ink">{t.name}</span>
                    <span className="text-[12px] text-ink-3">move-in {t.moveInLabel}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Per-tenant math preview */}
          <Card>
            <CardHead
              title="Per-tenant math preview"
              subtitle="What each active tenant pays from THIS room (excluding their personal charges)"
            />

            <div className="flex flex-col">
              {mathRows.map((row, i) => (
                <MathRow key={i} label={row.label} value={row.value} bold={row.bold} />
              ))}
            </div>

            <div className="mt-4">
              <Callout variant="info" icon={<Info size={16} strokeWidth={1.75} />}>
                <p className="text-[12.5px] text-ink-2">
                  Tenant-specific charges (e.g. Parking, Laptop fee) added on top per tenant.
                  If a tenant moves out mid-period, shares recalc on bill regeneration.
                </p>
              </Callout>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

const DEFAULT_PROPERTY = MOCK_PROPERTIES[0]

export function Rooms() {
  const [search,          setSearch]          = useState('')
  const [selectedRoomId,  setSelectedRoomId]  = useState(MOCK_ROOMS[0].id)

  const filtered = MOCK_ROOMS.filter(r => {
    const q = search.trim().toLowerCase()
    return !q || r.name.toLowerCase().includes(q)
  })

  const selectedRoom = MOCK_ROOMS.find(r => r.id === selectedRoomId) ?? MOCK_ROOMS[0]

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 60px)' }}>

      {/* ── Left panel — room list ── */}
      <div
        className="flex flex-col border-r border-border bg-surface flex-shrink-0 overflow-hidden"
        style={{ width: '224px' }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-3 pt-4 pb-2">
          <span className="font-display text-[16px] font-semibold text-ink tracking-[-0.01em]">
            Rooms
          </span>
          <IconButton aria-label="Add room">
            <Plus size={14} strokeWidth={2} />
          </IconButton>
        </div>

        {/* Property filter chip */}
        <div className="px-3 pb-2">
          <span className="inline-flex items-center gap-1 bg-surface-2 border border-border rounded-pill px-2 py-0.5 text-[12px] text-ink-2">
            property: {DEFAULT_PROPERTY.name.split(' ')[0]}
            <button
              type="button"
              aria-label="Clear property filter"
              className="text-ink-4 hover:text-ink transition-ui leading-none"
            >
              <X size={11} strokeWidth={2} />
            </button>
          </span>
        </div>

        {/* Search */}
        <div className="px-3 pb-3 relative">
          <Search
            className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-ink-4"
            size={13} strokeWidth={1.75}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="search..."
            className="w-full pl-7 pr-3 py-1.5 text-[12.5px] border border-border rounded-btn bg-bg text-ink placeholder:text-ink-4 focus:outline-none focus:border-border-strong transition-ui"
          />
        </div>

        {/* Room list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 flex flex-col gap-0.5">
          {filtered.map(room => (
            <RoomListItem
              key={room.id}
              room={room}
              selected={room.id === selectedRoomId}
              onClick={() => setSelectedRoomId(room.id)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-[12.5px] text-ink-4 text-center py-6">No rooms found</p>
          )}
        </div>
      </div>

      {/* ── Right panel — room detail ── */}
      <RoomDetail key={selectedRoomId} room={selectedRoom} />
    </div>
  )
}
