import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Plus, Download, ArrowRight,
  Building2, MoreHorizontal, Info, ChevronDown,
} from 'lucide-react'
import { MOCK_PROPERTIES } from '../../data/mock'
import type { Property } from '../../types/properties'
import { PageHead } from '../../components/ui/PageHead'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Callout } from '../../components/ui/Callout'

function fmtPHP(n: number) {
  if (n >= 1000) return `₱${Math.round(n / 1000)}k`
  return `₱${n}`
}

type StatusFilter = 'any' | 'active' | 'inactive'

/* ── Property card ─────────────────────────────────────────── */
interface PropertyCardProps {
  property: Property
  onOpen: () => void
}

function PropertyCard({ property, onOpen }: PropertyCardProps) {
  const stats = [
    { label: 'rooms',    value: String(property.totalRooms) },
    { label: 'occupied', value: `${property.occupiedRooms}/${property.totalRooms}` },
    { label: 'this mo.', value: property.collectedThisMonthPHP != null ? fmtPHP(property.collectedThisMonthPHP) : '—' },
  ]

  return (
    <Card hover>
      {/* Status badges + billing day */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <StatusBadge status={property.status} />
        {property.readyToBill && <StatusBadge status="ready" />}
        <span className="ml-auto font-mono text-[11.5px] text-ink-4">
          day {property.billingDay}
        </span>
      </div>

      {/* Name + address */}
      <h3 className="font-display text-[17px] font-semibold tracking-[-0.01em] text-ink leading-snug mb-0.5">
        {property.name}
      </h3>
      <p className="text-[13px] text-ink-3 mb-4">{property.address}</p>

      {/* Building illustration placeholder */}
      <div
        className="bg-surface-2 rounded-chip flex items-center justify-center mb-4"
        style={{ height: '76px' }}
      >
        <Building2 size={32} strokeWidth={1.25} className="text-border-strong" />
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {stats.map(({ label, value }) => (
          <div key={label}>
            <div className="text-[11px] font-medium text-ink-4 uppercase tracking-[0.05em] mb-0.5">
              {label}
            </div>
            <div className="font-mono text-[13px] font-medium text-ink-2">{value}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="primary" className="flex-1" onClick={onOpen}>
          Open <ArrowRight size={13} strokeWidth={1.75} />
        </Button>
        <IconButton
          onClick={e => e.stopPropagation()}
          aria-label="More options"
        >
          <MoreHorizontal size={15} strokeWidth={1.75} />
        </IconButton>
      </div>
    </Card>
  )
}

/* ── Page ──────────────────────────────────────────────────── */
export function Properties() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('any')
  const [search, setSearch] = useState('')

  const filtered = MOCK_PROPERTIES.filter(p => {
    const matchesStatus = statusFilter === 'any' || p.status === statusFilter
    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  const activeCount   = MOCK_PROPERTIES.filter(p => p.status === 'active').length
  const inactiveCount = MOCK_PROPERTIES.filter(p => p.status === 'inactive').length

  return (
    <main className="px-8 pt-7 pb-16 max-w-[1320px] mx-auto w-full">
      <PageHead
        title="Properties"
        subtitle={`${MOCK_PROPERTIES.length} properties · ${activeCount} active · ${inactiveCount} inactive`}
        actions={
          <>
            <Button variant="default">
              <Download size={14} strokeWidth={1.75} />
              Export
            </Button>
            <Button
              variant="accent"
              onClick={() => navigate('/landlord/properties/new')}
            >
              <Plus size={14} strokeWidth={2} />
              Create Property
            </Button>
          </>
        }
      />

      {/* Search + filter bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Search input */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-4"
            size={14}
            strokeWidth={1.75}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="search..."
            className="pl-8 pr-3 py-2 text-[13.5px] border border-border rounded-btn bg-surface text-ink placeholder:text-ink-4 focus:outline-none focus:border-border-strong transition-ui min-w-[200px]"
          />
        </div>

        {/* Status filter */}
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
            size={13}
            strokeWidth={1.75}
          />
        </div>

        {/* Results count */}
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
          />
        ))}

        {/* Ghost "create new" card */}
        <button
          onClick={() => navigate('/landlord/properties/new')}
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
    </main>
  )
}
