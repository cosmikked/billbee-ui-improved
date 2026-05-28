import { useState, useEffect } from 'react'
import {
  HardDrive, Play, Download, Trash2, CheckCircle2,
  XCircle, Clock, RefreshCw, Calendar, Database,
  FileArchive, AlertTriangle, X, ChevronDown,
} from 'lucide-react'
import { Card, CardHead } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { PageHead } from '../../components/ui/PageHead'

/* ══════════════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════════════ */

type BackupStatus  = 'success' | 'failed' | 'running' | 'partial'
type BackupType    = 'full' | 'database' | 'files'
type BackupTrigger = 'manual' | 'scheduled'

interface BackupEntry {
  id:        string
  ts:        string        // ISO
  type:      BackupType
  trigger:   BackupTrigger
  sizeMb:    number
  durationS: number
  status:    BackupStatus
  note?:     string
}

type Frequency  = 'daily' | 'weekly' | 'monthly'
type Retention  = '7' | '14' | '30' | '90'

interface Schedule {
  enabled:   boolean
  frequency: Frequency
  time:      string   // "HH:MM"
  retention: Retention
  incDb:     boolean
  incFiles:  boolean
}

/* ══════════════════════════════════════════════════════════════
   Mock data
══════════════════════════════════════════════════════════════ */

const INITIAL_ENTRIES: BackupEntry[] = [
  { id:'b01', ts:'2026-05-28T02:00:00', type:'full',     trigger:'scheduled', sizeMb:284, durationS:47,  status:'success' },
  { id:'b02', ts:'2026-05-27T02:00:00', type:'full',     trigger:'scheduled', sizeMb:281, durationS:45,  status:'success' },
  { id:'b03', ts:'2026-05-26T14:32:00', type:'database', trigger:'manual',    sizeMb:94,  durationS:12,  status:'success' },
  { id:'b04', ts:'2026-05-26T02:00:00', type:'full',     trigger:'scheduled', sizeMb:279, durationS:46,  status:'partial', note:'Files backup timed out; DB backup completed.' },
  { id:'b05', ts:'2026-05-25T02:00:00', type:'full',     trigger:'scheduled', sizeMb:0,   durationS:3,   status:'failed',  note:'Disk write error — storage quota exceeded.' },
  { id:'b06', ts:'2026-05-24T02:00:00', type:'full',     trigger:'scheduled', sizeMb:275, durationS:44,  status:'success' },
  { id:'b07', ts:'2026-05-23T02:00:00', type:'full',     trigger:'scheduled', sizeMb:273, durationS:43,  status:'success' },
  { id:'b08', ts:'2026-05-22T09:11:00', type:'database', trigger:'manual',    sizeMb:91,  durationS:11,  status:'success' },
  { id:'b09', ts:'2026-05-21T02:00:00', type:'full',     trigger:'scheduled', sizeMb:270, durationS:42,  status:'success' },
  { id:'b10', ts:'2026-05-20T02:00:00', type:'full',     trigger:'scheduled', sizeMb:268, durationS:41,  status:'success' },
  { id:'b11', ts:'2026-05-19T02:00:00', type:'full',     trigger:'scheduled', sizeMb:265, durationS:40,  status:'success' },
  { id:'b12', ts:'2026-05-18T02:00:00', type:'full',     trigger:'scheduled', sizeMb:0,   durationS:2,   status:'failed',  note:'Backup process killed — server restart.' },
]

const INIT_SCHEDULE: Schedule = {
  enabled:   true,
  frequency: 'daily',
  time:      '02:00',
  retention: '30',
  incDb:     true,
  incFiles:  true,
}

/* ══════════════════════════════════════════════════════════════
   Helpers
══════════════════════════════════════════════════════════════ */

function fmtTs(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function fmtSize(mb: number) {
  if (mb === 0) return '—'
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb} MB`
}

function fmtDuration(s: number) {
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`
}

function totalStorageMb(entries: BackupEntry[]) {
  return entries.filter(e => e.status === 'success' || e.status === 'partial')
    .reduce((acc, e) => acc + e.sizeMb, 0)
}

function nextScheduled(schedule: Schedule) {
  if (!schedule.enabled) return 'Not scheduled'
  const now = new Date()
  const [h, m] = schedule.time.split(':').map(Number)
  const next = new Date(now)
  next.setHours(h, m, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  return next.toLocaleString('en-PH', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

/* ══════════════════════════════════════════════════════════════
   Status chip
══════════════════════════════════════════════════════════════ */

const STATUS_META: Record<BackupStatus, { label: string; cls: string; icon: React.ElementType }> = {
  success: { label: 'Success', cls: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  failed:  { label: 'Failed',  cls: 'bg-danger/10 text-danger border-danger/20',    icon: XCircle       },
  running: { label: 'Running', cls: 'bg-accent/10 text-accent border-accent/20',    icon: RefreshCw     },
  partial: { label: 'Partial', cls: 'bg-warning/10 text-warning border-warning/20', icon: AlertTriangle },
}

function StatusChip({ status }: { status: BackupStatus }) {
  const { label, cls, icon: Icon } = STATUS_META[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-chip text-[11.5px] font-semibold border ${cls}`}>
      <Icon size={11} strokeWidth={2} className={status === 'running' ? 'animate-spin' : ''} />
      {label}
    </span>
  )
}

/* ── Type badge ─────────────────────────────────────────────── */

const TYPE_META: Record<BackupType, { label: string; icon: React.ElementType }> = {
  full:     { label: 'Full',     icon: FileArchive },
  database: { label: 'Database', icon: Database    },
  files:    { label: 'Files',    icon: HardDrive   },
}

function TypeBadge({ type }: { type: BackupType }) {
  const { label, icon: Icon } = TYPE_META[type]
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-2">
      <Icon size={13} strokeWidth={1.75} className="text-ink-3 shrink-0" />
      {label}
    </span>
  )
}

/* ── Trigger badge ──────────────────────────────────────────── */

function TriggerBadge({ trigger }: { trigger: BackupTrigger }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-chip text-[11px] font-medium border ${
      trigger === 'manual'
        ? 'bg-surface-2 text-ink-2 border-border'
        : 'bg-surface text-ink-3 border-border'
    }`}>
      {trigger === 'manual' ? <Play size={9} strokeWidth={2.5} /> : <Calendar size={9} strokeWidth={2} />}
      {trigger === 'manual' ? 'Manual' : 'Scheduled'}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   Form primitives
══════════════════════════════════════════════════════════════ */

const INPUT_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full placeholder:text-ink-4'

const SEL_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full appearance-none'

function Field({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11.5px] text-ink-4">{hint}</p>}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Backup Status Card
══════════════════════════════════════════════════════════════ */

function BackupStatusCard({
  entries, schedule,
}: {
  entries: BackupEntry[]
  schedule: Schedule
}) {
  const last = entries.find(e => e.status !== 'running')
  const storageMb = totalStorageMb(entries)
  const storageGb = (storageMb / 1024).toFixed(2)
  const storagePct = Math.min(100, Math.round((storageMb / 10240) * 100)) // 10 GB quota

  return (
    <Card>
      <CardHead title="Backup Status" />
      <div className="px-5 pb-5 flex flex-col gap-4">

        {/* Last backup */}
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">Last Backup</p>
          {last ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[13.5px] font-medium text-ink">{fmtTs(last.ts)}</div>
                <div className="text-[12px] text-ink-3 mt-0.5">
                  {TYPE_META[last.type].label} · {fmtSize(last.sizeMb)} · {fmtDuration(last.durationS)}
                </div>
              </div>
              <StatusChip status={last.status} />
            </div>
          ) : (
            <p className="text-[13px] text-ink-3">No backups yet.</p>
          )}
        </div>

        <div className="border-t border-border" />

        {/* Next scheduled */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3 mb-0.5">Next Scheduled</p>
            <div className="flex items-center gap-1.5 text-[13px] text-ink-2">
              <Clock size={13} strokeWidth={1.75} className="text-ink-4" />
              {nextScheduled(schedule)}
            </div>
          </div>
          <span className={`text-[11.5px] font-semibold px-2 py-0.5 rounded-chip border ${
            schedule.enabled
              ? 'bg-success/10 text-success border-success/20'
              : 'bg-surface-2 text-ink-3 border-border'
          }`}>
            {schedule.enabled ? 'Auto-enabled' : 'Disabled'}
          </span>
        </div>

        <div className="border-t border-border" />

        {/* Storage usage */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">Storage Used</p>
            <span className="text-[12px] text-ink-3">{storageGb} GB / 10 GB</span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${storagePct > 80 ? 'bg-danger' : storagePct > 60 ? 'bg-warning' : 'bg-accent'}`}
              style={{ width: `${storagePct}%` }}
            />
          </div>
          <p className="text-[11.5px] text-ink-4">{storagePct}% of allocated backup storage used</p>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Backups', value: entries.length },
            { label: 'Successful',    value: entries.filter(e => e.status === 'success').length },
            { label: 'Failed',        value: entries.filter(e => e.status === 'failed').length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-2 rounded-btn px-3 py-2.5 text-center">
              <div className="text-[17px] font-bold text-ink">{value}</div>
              <div className="text-[10.5px] text-ink-3 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Backup Schedule Card
══════════════════════════════════════════════════════════════ */

function BackupScheduleCard({
  schedule, onChange,
}: {
  schedule: Schedule
  onChange: (s: Schedule) => void
}) {
  const [draft, setDraft] = useState<Schedule>(schedule)
  const [saved, setSaved] = useState(false)

  function set<K extends keyof Schedule>(k: K, v: Schedule[K]) {
    setDraft(prev => ({ ...prev, [k]: v }))
  }

  function handleSave() {
    onChange(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <Card>
      <CardHead title="Backup Schedule" />
      <div className="px-5 pb-5 flex flex-col gap-4">

        {/* Enable toggle */}
        <div className="flex items-center justify-between p-3 bg-surface-2 rounded-btn">
          <div>
            <p className="text-[13.5px] font-semibold text-ink">Automatic Backups</p>
            <p className="text-[12px] text-ink-3 mt-0.5">Run backups on a recurring schedule</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={draft.enabled}
            onClick={() => set('enabled', !draft.enabled)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              draft.enabled ? 'bg-accent' : 'bg-border'
            }`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              draft.enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
            }`} />
          </button>
        </div>

        {/* Schedule fields */}
        <div className={`flex flex-col gap-3 transition-opacity ${draft.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Frequency">
              <div className="relative">
                <select
                  value={draft.frequency}
                  onChange={e => set('frequency', e.target.value as Frequency)}
                  className={SEL_CLS}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
              </div>
            </Field>
            <Field label="Time of Day">
              <input
                type="time"
                value={draft.time}
                onChange={e => set('time', e.target.value)}
                className={INPUT_CLS}
              />
            </Field>
          </div>

          <Field label="Retention Period" hint="Older backups are deleted automatically.">
            <div className="relative">
              <select
                value={draft.retention}
                onChange={e => set('retention', e.target.value as Retention)}
                className={SEL_CLS}
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            </div>
          </Field>

          <Field label="Include in Backup">
            <div className="flex flex-col gap-2 pt-0.5">
              {[
                { key: 'incDb'    as const, label: 'Database', desc: 'All records, users, billing data' },
                { key: 'incFiles' as const, label: 'Files',    desc: 'Avatars, attachments, exports'    },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft[key]}
                    onChange={e => set(key, e.target.checked)}
                    className="mt-0.5 accent-accent"
                  />
                  <div>
                    <div className="text-[13px] font-medium text-ink">{label}</div>
                    <div className="text-[11.5px] text-ink-3">{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </Field>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-1">
          {saved && (
            <span className="flex items-center gap-1.5 text-[12px] text-success font-medium">
              <CheckCircle2 size={13} strokeWidth={2} />
              Schedule saved
            </span>
          )}
          {!saved && <span />}
          <Button size="sm" onClick={handleSave}>Save Schedule</Button>
        </div>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Confirm modals
══════════════════════════════════════════════════════════════ */

function RunBackupModal({
  open, onClose, onConfirm,
}: {
  open: boolean; onClose: () => void; onConfirm: (type: BackupType) => void
}) {
  const [type, setType] = useState<BackupType>('full')
  return (
    <Modal open={open} onClose={onClose} title="Run Manual Backup">
      <div className="flex flex-col gap-4">
        <p className="text-[13.5px] text-ink-2">
          Select the scope of this backup. The system will run it immediately and add it to the backup history.
        </p>
        <div className="flex flex-col gap-2">
          {(['full', 'database', 'files'] as BackupType[]).map(t => (
            <label key={t} className={`flex items-center gap-3 p-3 rounded-btn border cursor-pointer transition-colors ${
              type === t ? 'border-accent bg-accent/5' : 'border-border hover:border-border-strong'
            }`}>
              <input type="radio" name="btype" value={t} checked={type === t} onChange={() => setType(t)} className="accent-accent" />
              <div>
                <div className="text-[13.5px] font-semibold text-ink capitalize">{t === 'full' ? 'Full Backup' : t === 'database' ? 'Database Only' : 'Files Only'}</div>
                <div className="text-[12px] text-ink-3">
                  {t === 'full'     && 'Includes database + all uploaded files'}
                  {t === 'database' && 'All records: users, properties, bills, payments'}
                  {t === 'files'    && 'Avatars, attachments, generated PDFs'}
                </div>
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => { onConfirm(type); onClose() }}>
            <Play size={13} strokeWidth={2} />
            Run Now
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function DeleteBackupModal({
  open, entry, onClose, onConfirm,
}: {
  open: boolean; entry: BackupEntry | null; onClose: () => void; onConfirm: () => void
}) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Backup">
      <div className="flex flex-col gap-4">
        {entry && (
          <p className="text-[13.5px] text-ink-2">
            Delete the <strong className="text-ink font-semibold">{TYPE_META[entry.type].label}</strong> backup
            from <strong className="text-ink font-semibold">{fmtTs(entry.ts)}</strong>?
            This action cannot be undone and the backup file will be permanently removed.
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" variant="danger" onClick={() => { onConfirm(); onClose() }}>
            <Trash2 size={13} strokeWidth={2} />
            Delete Backup
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/* ══════════════════════════════════════════════════════════════
   Backup History Table
══════════════════════════════════════════════════════════════ */

type FilterStatus = 'all' | BackupStatus
type FilterType   = 'all' | BackupType
type FilterRange  = 'all' | 'today' | '7d' | '30d'

function isInRange(iso: string, range: FilterRange): boolean {
  if (range === 'all') return true
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = diffMs / 86400000
  if (range === 'today') return diffDays < 1
  if (range === '7d')    return diffDays < 7
  if (range === '30d')   return diffDays < 30
  return true
}

function BackupHistoryTable({
  entries,
  onDelete,
  onDownload,
}: {
  entries:    BackupEntry[]
  onDelete:   (id: string) => void
  onDownload: (id: string) => void
}) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterType,   setFilterType]   = useState<FilterType>('all')
  const [filterRange,  setFilterRange]  = useState<FilterRange>('all')
  const [toDelete, setToDelete] = useState<BackupEntry | null>(null)

  const filtered = entries.filter(e => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false
    if (filterType   !== 'all' && e.type   !== filterType)   return false
    if (!isInRange(e.ts, filterRange))                        return false
    return true
  })

  const totalMb = totalStorageMb(entries)

  return (
    <>
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border gap-4">
          <h3 className="text-[15px] font-semibold text-ink">Backup History</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as FilterStatus)}
                className="border border-border rounded-btn pl-3 pr-7 py-1.5 text-[12.5px] text-ink bg-surface focus:outline-none focus:border-accent appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="partial">Partial</option>
                <option value="failed">Failed</option>
                <option value="running">Running</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            </div>

            {/* Type filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as FilterType)}
                className="border border-border rounded-btn pl-3 pr-7 py-1.5 text-[12.5px] text-ink bg-surface focus:outline-none focus:border-accent appearance-none"
              >
                <option value="all">All Types</option>
                <option value="full">Full</option>
                <option value="database">Database</option>
                <option value="files">Files</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            </div>

            {/* Date range filter */}
            <div className="relative">
              <select
                value={filterRange}
                onChange={e => setFilterRange(e.target.value as FilterRange)}
                className="border border-border rounded-btn pl-3 pr-7 py-1.5 text-[12.5px] text-ink bg-surface focus:outline-none focus:border-accent appearance-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                {['Timestamp', 'Type', 'Trigger', 'Size', 'Duration', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-ink-3">
                    No backups match the current filters.
                  </td>
                </tr>
              )}
              {filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-surface-2/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-[13px] font-medium text-ink">{fmtTs(entry.ts)}</div>
                    {entry.note && (
                      <div className="text-[11.5px] text-ink-3 mt-0.5 max-w-[260px] truncate" title={entry.note}>
                        {entry.note}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={entry.type} />
                  </td>
                  <td className="px-4 py-3">
                    <TriggerBadge trigger={entry.trigger} />
                  </td>
                  <td className="px-4 py-3 text-ink-2 tabular-nums">
                    {fmtSize(entry.sizeMb)}
                  </td>
                  <td className="px-4 py-3 text-ink-2 tabular-nums">
                    {fmtDuration(entry.durationS)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={entry.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={entry.status === 'failed' || entry.status === 'running' || entry.sizeMb === 0}
                        onClick={() => onDownload(entry.id)}
                        title="Download"
                        className="p-1.5 rounded-btn text-ink-3 hover:text-accent hover:bg-accent/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Download size={14} strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        disabled={entry.status === 'running'}
                        onClick={() => setToDelete(entry)}
                        title="Delete"
                        className="p-1.5 rounded-btn text-ink-3 hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} strokeWidth={1.75} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border text-[12px] text-ink-3">
          <span>
            Showing {filtered.length} of {entries.length} backups
            {filtered.length < entries.length && ' (filtered)'}
          </span>
          <span className="flex items-center gap-1">
            <HardDrive size={12} strokeWidth={1.75} />
            {fmtSize(totalMb)} total stored
          </span>
        </div>
      </Card>

      <DeleteBackupModal
        open={!!toDelete}
        entry={toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => { if (toDelete) onDelete(toDelete.id) }}
      />
    </>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main page
══════════════════════════════════════════════════════════════ */

let nextId = 100

export function Backups() {
  const [entries,  setEntries]  = useState<BackupEntry[]>(INITIAL_ENTRIES)
  const [schedule, setSchedule] = useState<Schedule>(INIT_SCHEDULE)

  // Modal state
  const [showRunModal,    setShowRunModal]    = useState(false)

  // Running banner state
  const [runningEntry, setRunningEntry] = useState<BackupEntry | null>(null)

  // Download / export confirmation strip
  const [downloadStrip, setDownloadStrip] = useState(false)

  // Simulate backup completion
  useEffect(() => {
    if (!runningEntry) return
    const t = setTimeout(() => {
      const completed: BackupEntry = {
        ...runningEntry,
        status:    'success',
        sizeMb:    runningEntry.type === 'database' ? 94 : runningEntry.type === 'files' ? 190 : 284,
        durationS: runningEntry.type === 'database' ? 12  : runningEntry.type === 'files' ? 28  : 47,
      }
      setEntries(prev => [completed, ...prev.filter(e => e.id !== runningEntry.id)])
      setRunningEntry(null)
    }, 4000)
    return () => clearTimeout(t)
  }, [runningEntry])

  function handleRunBackup(type: BackupType) {
    const entry: BackupEntry = {
      id:        `b${++nextId}`,
      ts:        new Date().toISOString(),
      type,
      trigger:   'manual',
      sizeMb:    0,
      durationS: 0,
      status:    'running',
    }
    setRunningEntry(entry)
    setEntries(prev => [entry, ...prev])
  }

  function handleDelete(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id))
    if (runningEntry?.id === id) setRunningEntry(null)
  }

  function handleDownload(_id: string) {
    setDownloadStrip(true)
    setTimeout(() => setDownloadStrip(false), 3500)
  }

  const lastSuccess = entries.find(e => e.status === 'success')

  return (
    <main className="flex flex-col gap-6 px-8 py-6 max-w-[1200px]">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <PageHead
          title="Backup Management"
          subtitle={lastSuccess
            ? `Last successful backup ${fmtTs(lastSuccess.ts)}`
            : 'No successful backups yet'}
        />
        <Button onClick={() => setShowRunModal(true)} className="shrink-0">
          <Play size={14} strokeWidth={2} />
          Run Backup Now
        </Button>
      </div>

      {/* Running banner */}
      {runningEntry && (
        <div className="flex items-center gap-3 px-4 py-3 bg-accent/10 border border-accent/20 rounded-btn text-[13.5px] text-accent font-medium">
          <RefreshCw size={16} strokeWidth={2} className="animate-spin shrink-0" />
          <span>
            Backup in progress —{' '}
            <span className="font-semibold capitalize">
              {runningEntry.type === 'full'
                ? 'Database + Files'
                : runningEntry.type === 'database'
                ? 'Database'
                : 'Files'}
            </span>
            . This may take a few minutes.
          </span>
          <button
            type="button"
            onClick={() => {
              setRunningEntry(null)
              setEntries(prev => prev.filter(e => e.id !== runningEntry.id))
            }}
            className="ml-auto text-accent/60 hover:text-accent transition-colors"
            title="Dismiss"
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Download confirmation strip */}
      {downloadStrip && (
        <div className="flex items-center gap-3 px-4 py-3 bg-success/10 border border-success/20 rounded-btn text-[13.5px] text-success font-medium">
          <CheckCircle2 size={16} strokeWidth={2} className="shrink-0" />
          Backup file download initiated. Check your downloads folder.
          <button
            type="button"
            onClick={() => setDownloadStrip(false)}
            className="ml-auto text-success/60 hover:text-success transition-colors"
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Status + Schedule row */}
      <div className="grid grid-cols-2 gap-5">
        <BackupStatusCard entries={entries} schedule={schedule} />
        <BackupScheduleCard schedule={schedule} onChange={setSchedule} />
      </div>

      {/* History table */}
      <BackupHistoryTable
        entries={entries}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />

      {/* Run backup modal */}
      <RunBackupModal
        open={showRunModal}
        onClose={() => setShowRunModal(false)}
        onConfirm={handleRunBackup}
      />
    </main>
  )
}
