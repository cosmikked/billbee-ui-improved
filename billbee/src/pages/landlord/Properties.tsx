import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Search, Plus, Download, ArrowRight,
  MoreHorizontal, Info, ChevronDown, Pencil, Trash2,
} from 'lucide-react'
import { CreatePropertyDrawer } from './CreatePropertyDrawer'
import { EditPropertyDrawer } from './EditPropertyDrawer'
import { MOCK_PROPERTIES } from '../../data/mock'
import type { Property } from '../../types/properties'
import { PageHead } from '../../components/ui/PageHead'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Callout } from '../../components/ui/Callout'
import { Modal } from '../../components/ui/Modal'

function fmtPHP(n: number) {
  if (n >= 1000) return `₱${Math.round(n / 1000)}k`
  return `₱${n}`
}

type StatusFilter = 'any' | 'active' | 'inactive'

/* ── Card overflow menu ────────────────────────────────────── */

function CardMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <IconButton
        aria-label="More options"
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
      >
        <MoreHorizontal size={15} strokeWidth={1.75} />
      </IconButton>

      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-50 bg-surface border border-border rounded-card shadow-lg py-1 w-36 flex flex-col">
          <button
            className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-ink hover:bg-surface-2 transition-colors text-left"
            onClick={e => { e.stopPropagation(); setOpen(false); onEdit() }}
          >
            <Pencil size={13} strokeWidth={1.75} className="text-ink-3" />
            Edit
          </button>
          <button
            className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-danger hover:bg-danger-soft transition-colors text-left"
            onClick={e => { e.stopPropagation(); setOpen(false); onDelete() }}
          >
            <Trash2 size={13} strokeWidth={1.75} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Property card ─────────────────────────────────────────── */

interface PropertyCardProps {
  property: Property
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}

function PropertyCard({ property, onOpen, onEdit, onDelete }: PropertyCardProps) {
  const stats = [
    { label: 'rooms',      value: String(property.totalRooms) },
    { label: 'occupied',   value: `${property.occupiedRooms}/${property.totalRooms}` },
    { label: 'this month', value: property.collectedThisMonthPHP != null ? fmtPHP(property.collectedThisMonthPHP) : '—' },
  ]

  return (
    <Card hover>
      {/* Status badge + billing day */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <StatusBadge status={property.status} />
        <span className="ml-auto font-mono text-[11.5px] text-ink-4">
          day {property.billingDay}
        </span>
      </div>

      {/* Name + address */}
      <h3 className="font-display text-[17px] font-semibold tracking-[-0.01em] text-ink leading-snug mb-0.5">
        {property.name}
      </h3>
      <p className="text-[13px] text-ink-3 mb-4">{property.address}</p>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-surface-2/60 rounded-chip px-3 py-2.5">
            <div className="font-mono text-[17px] font-medium text-ink-2 leading-none mb-1">
              {value}
            </div>
            <div className="text-[11px] font-medium text-ink-4 uppercase tracking-[0.05em]">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="primary" className="flex-1" onClick={onOpen}>
          Open <ArrowRight size={13} strokeWidth={1.75} />
        </Button>
        <CardMenu onEdit={onEdit} onDelete={onDelete} />
      </div>
    </Card>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

export function Properties() {
  const navigate = useNavigate()
  const location = useLocation()

  const [properties,    setProperties]   = useState<Property[]>(MOCK_PROPERTIES)
  const [statusFilter,  setStatusFilter] = useState<StatusFilter>('any')
  const [search,        setSearch]       = useState('')
  const [createOpen,    setCreateOpen]   = useState(
    (location.state as { openCreate?: boolean } | null)?.openCreate === true
  )
  const [editTarget,    setEditTarget]   = useState<Property | null>(null)
  const [deleteTarget,  setDeleteTarget] = useState<Property | null>(null)

  const filtered = properties.filter(p => {
    const matchesStatus = statusFilter === 'any' || p.status === statusFilter
    const q = search.trim().toLowerCase()
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  const activeCount   = properties.filter(p => p.status === 'active').length
  const inactiveCount = properties.filter(p => p.status === 'inactive').length

  function handleSave(updated: Property) {
    setProperties(prev => prev.map(p => p.id === updated.id ? updated : p))
    setEditTarget(null)
  }

  function handleDelete() {
    if (!deleteTarget) return
    setProperties(prev => prev.filter(p => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">
      <PageHead
        title="Properties"
        subtitle={`${properties.length} properties · ${activeCount} active · ${inactiveCount} inactive`}
        actions={
          <>
            <Button variant="default">
              <Download size={14} strokeWidth={1.75} />
              Export
            </Button>
            <Button variant="accent" onClick={() => setCreateOpen(true)}>
              <Plus size={14} strokeWidth={2} />
              Create Property
            </Button>
          </>
        }
      />

      {/* Search + filter bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-4"
            size={14} strokeWidth={1.75}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="search..."
            className="pl-8 pr-3 py-2 text-[13.5px] border border-border rounded-btn bg-surface text-ink placeholder:text-ink-4 focus:outline-none focus:border-border-strong transition-ui min-w-[200px]"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as StatusFilter)}
            className="appearance-none pl-3 pr-7 py-2 text-[13.5px] border border-border rounded-btn bg-surface text-ink-2 focus:outline-none focus:border-border-strong hover:bg-surface-2 hover:border-border-strong transition-ui cursor-pointer"
          >
            <option value="any">status: any</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
          <ChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-3"
            size={13} strokeWidth={1.75}
          />
        </div>

        <span className="ml-auto text-[13px] text-ink-3 tabular-nums">
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      {/* Property card grid */}
      <div
        className="grid grid-cols-3 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1"
        style={{ gap: 'var(--gap-grid)', marginBottom: 'var(--gap-grid)' }}
      >
        {filtered.map(p => (
          <PropertyCard
            key={p.id}
            property={p}
            onOpen={() => navigate(`/landlord/properties/${p.id}`)}
            onEdit={() => setEditTarget(p)}
            onDelete={() => setDeleteTarget(p)}
          />
        ))}

        {/* Ghost "create new" card */}
        <button
          onClick={() => setCreateOpen(true)}
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-card text-ink-4 hover:border-border-strong hover:text-ink-3 hover:bg-surface-2 transition-ui"
          style={{ padding: 'var(--pad-card)', minHeight: '280px' }}
        >
          <Plus size={22} strokeWidth={1.5} />
          <span className="text-[13.5px] font-medium">Create new property</span>
        </button>
      </div>

      {/* Tip callout */}
      <Callout variant="info" icon={<Info size={18} strokeWidth={1.75} />}>
        <strong className="font-semibold text-ink">Tip:</strong>{' '}
        click{' '}
        <strong className="font-semibold text-ink-2">Open →</strong>{' '}
        on any property to enter its{' '}
        <strong className="font-semibold text-ink-2">Property Hub</strong>{' '}
        — that's where you set up its charges, rooms, and tenants.
      </Callout>

      {/* Create drawer */}
      <CreatePropertyDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {/* Edit drawer */}
      <EditPropertyDrawer
        property={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSave}
      />

      {/* Delete confirmation modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete property"
        subtitle={deleteTarget?.name}
        width={420}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="accent" onClick={handleDelete}>Delete</Button>
          </div>
        }
      >
        <p className="text-[13.5px] text-ink-2 leading-relaxed">
          You cannot delete{' '}
          <strong className="text-ink font-semibold">{deleteTarget?.name}</strong> 
          &nbsp;because it has existing active tenants.
        </p>
      </Modal>
    </main>
  )
}
