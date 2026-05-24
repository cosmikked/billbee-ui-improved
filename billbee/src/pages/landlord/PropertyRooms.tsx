import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Plus, ChevronDown, Search } from 'lucide-react'
import { MOCK_ROOMS } from '../../data/mock'
import { AddRoomDrawer } from './AddRoomDrawer'
import type { Room, RoomStatus } from '../../types/rooms'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Pill } from '../../components/ui/Pill'
import type { Column } from '../../components/ui/DataTable'
import type { PropertyLayoutContext } from './PropertyLayout'

type StatusFilter = 'all' | 'active' | 'inactive' | 'maintenance'

const SEL = [
  'appearance-none pl-3 pr-7 py-2 text-[13.5px] border border-border rounded-btn',
  'bg-surface text-ink-2 focus:outline-none focus:border-border-strong',
  'hover:bg-surface-2 hover:border-border-strong transition-ui cursor-pointer',
].join(' ')

function fmtPHP(n: number) {
  return `₱${n.toLocaleString('en-PH')}`
}

export function PropertyRooms() {
  const navigate = useNavigate()
  const { property } = useOutletContext<PropertyLayoutContext>()

  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [drawerOpen,   setDrawerOpen]   = useState(false)

  const propertyRooms = MOCK_ROOMS.filter(r => r.propertyId === property.id)

  const filtered = propertyRooms.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    const q = search.trim().toLowerCase()
    if (q && !r.name.toLowerCase().includes(q)) return false
    return true
  })

  const columns: Column<Room>[] = [
    {
      key: 'name', header: 'Room', width: '120px',
      cell: r => <span className="font-medium text-ink font-mono">{r.name}</span>,
    },
    {
      key: 'status', header: 'Status', width: '130px',
      cell: r => (
        r.status === 'maintenance'
          ? <Pill variant="warn">Maintenance</Pill>
          : <StatusBadge status={r.status === 'active' ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'occupancy', header: 'Occupancy', width: '110px',
      cell: r => (
        <span className="font-mono text-[13px] text-ink-2">
          {r.tenants.length} / {r.capacity}
        </span>
      ),
    },
    {
      key: 'rent', header: 'Monthly rent', width: '130px', align: 'right',
      cell: r => (
        r.monthlyRentPHP > 0
          ? <span className="font-mono text-[13px] text-ink">{fmtPHP(r.monthlyRentPHP)}</span>
          : <span className="text-ink-4">—</span>
      ),
    },
    {
      key: 'charges', header: 'Charges', width: '80px', align: 'right',
      cell: r => (
        <span className="font-mono text-[13px] text-ink-3">{r.charges.length}</span>
      ),
    },
    {
      key: 'open', header: '', width: '100px', align: 'right',
      cell: r => (
        <Button
          size="sm"
          variant="primary"
          onClick={e => { e.stopPropagation(); navigate(`/landlord/rooms/${r.id}`) }}
        >
          open {'->'}
        </Button>
      ),
    },
  ]

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-4" size={14} strokeWidth={1.75} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="room name..."
            className="pl-8 pr-3 py-2 text-[13.5px] border border-border rounded-btn bg-surface text-ink placeholder:text-ink-4 focus:outline-none focus:border-border-strong transition-ui min-w-[180px]"
          />
        </div>

        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} className={SEL}>
            <option value="all">status: all</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="maintenance">maintenance</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-3" size={13} strokeWidth={1.75} />
        </div>

        <span className="text-[13px] text-ink-3 tabular-nums">
          {filtered.length} {filtered.length === 1 ? 'room' : 'rooms'}
        </span>

        <Button variant="accent" className="ml-auto" onClick={() => setDrawerOpen(true)}>
          <Plus size={14} strokeWidth={2} />
          Add Room
        </Button>
      </div>

      {/* Table */}
      <Card noPadding>
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={r => r.id}
          onRowClick={r => navigate(`/landlord/rooms/${r.id}`)}
          emptyState="No rooms match the current filters"
        />
      </Card>

      <AddRoomDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
