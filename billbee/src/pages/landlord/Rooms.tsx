import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Download, Info, Plus, Search } from 'lucide-react'
import { MOCK_ROOMS, MOCK_PROPERTIES } from '../../data/mock'
import { AddRoomDrawer } from './AddRoomDrawer'
import type { Room, RoomStatus } from '../../types/rooms'
import { PageHead } from '../../components/ui/PageHead'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Pill } from '../../components/ui/Pill'
import { Callout } from '../../components/ui/Callout'
import type { Column } from '../../components/ui/DataTable'

type StatusFilter = 'all' | 'active' | 'inactive' | 'maintenance'

const SEL = [
  'appearance-none pl-3 pr-7 py-2 text-[13.5px] border border-border rounded-btn',
  'bg-surface text-ink-2 focus:outline-none focus:border-border-strong',
  'hover:bg-surface-2 hover:border-border-strong transition-ui cursor-pointer',
].join(' ')

function occupancyLabel(room: Room) {
  return `${room.tenants.length} / ${room.capacity}`
}

function fmtPHP(n: number) {
  return `₱${n.toLocaleString('en-PH')}`
}

function roomBadgeStatus(status: RoomStatus) {
  if (status === 'active')      return 'active'
  if (status === 'maintenance') return 'inactive' // closest existing badge
  return 'inactive'
}

export function Rooms() {
  const navigate  = useNavigate()
  const [search,         setSearch]         = useState('')
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [statusFilter,   setStatusFilter]   = useState<StatusFilter>('all')
  const [drawerOpen,     setDrawerOpen]     = useState(false)

  const propertyOptions = useMemo(
    () => Array.from(new Set(MOCK_ROOMS.map(r => r.propertyId))),
    [],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return MOCK_ROOMS.filter(r => {
      if (propertyFilter !== 'all' && r.propertyId !== propertyFilter) return false
      if (statusFilter   !== 'all' && r.status      !== statusFilter)   return false
      if (!q) return true
      return r.name.toLowerCase().includes(q)
    })
  }, [search, propertyFilter, statusFilter])

  const activeCount      = MOCK_ROOMS.filter(r => r.status === 'active').length
  const maintenanceCount = MOCK_ROOMS.filter(r => r.status === 'maintenance').length

  const propertyName = (id: string) =>
    MOCK_PROPERTIES.find(p => p.id === id)?.name ?? id

  const columns: Column<Room>[] = [
    {
      key: 'name',
      header: 'Room',
      width: '120px',
      cell: r => <span className="font-medium text-ink font-mono">{r.name}</span>,
    },
    {
      key: 'property',
      header: 'Property',
      width: '200px',
      cell: r => <span className="text-ink-2">{propertyName(r.propertyId)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      cell: r => (
        r.status === 'maintenance'
          ? <Pill variant="warn">Maintenance</Pill>
          : <StatusBadge status={roomBadgeStatus(r.status)} />
      ),
    },
    {
      key: 'occupancy',
      header: 'Occupancy',
      width: '110px',
      cell: r => (
        <span className="font-mono text-[13px] text-ink-2">{occupancyLabel(r)}</span>
      ),
    },
    {
      key: 'rent',
      header: 'Monthly rent',
      width: '130px',
      align: 'right',
      cell: r => (
        r.monthlyRentPHP > 0
          ? <span className="font-mono text-[13px] text-ink">{fmtPHP(r.monthlyRentPHP)}</span>
          : <span className="text-ink-4">—</span>
      ),
    },
    {
      key: 'charges',
      header: 'Charges',
      width: '80px',
      align: 'right',
      cell: r => (
        <span className="font-mono text-[13px] text-ink-3">{r.charges.length}</span>
      ),
    },
    {
      key: 'open',
      header: '',
      width: '100px',
      align: 'right',
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
    <main className="px-8 pt-7 pb-16 max-w-[1320px] mx-auto w-full">
      <PageHead
        title="Rooms"
        subtitle={`${MOCK_ROOMS.length} rooms · ${activeCount} active · ${maintenanceCount} under maintenance`}
        actions={
          <>
            <Button variant="default">
              <Download size={14} strokeWidth={1.75} />
              Export
            </Button>
            <Button variant="accent" onClick={() => setDrawerOpen(true)}>
              <Plus size={14} strokeWidth={2} />
              Add Room
            </Button>
          </>
        }
      />

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-4"
            size={14} strokeWidth={1.75}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="room name..."
            className="pl-8 pr-3 py-2 text-[13.5px] border border-border rounded-btn bg-surface text-ink placeholder:text-ink-4 focus:outline-none focus:border-border-strong transition-ui min-w-[190px]"
          />
        </div>

        <div className="relative">
          <select value={propertyFilter} onChange={e => setPropertyFilter(e.target.value)} className={SEL}>
            <option value="all">property: all</option>
            {propertyOptions.map(id => (
              <option key={id} value={id}>{propertyName(id)}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-3" size={13} strokeWidth={1.75} />
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

        <span className="ml-auto text-[13px] text-ink-3 tabular-nums">
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        </span>
      </div>

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
    </main>
  )
}
