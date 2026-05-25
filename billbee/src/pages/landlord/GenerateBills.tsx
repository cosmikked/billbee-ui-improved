import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X, Download, Upload, AlertTriangle, ArrowRight, ArrowLeft, Info, CheckCircle2, Loader2,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardHead } from '../../components/ui/Card'
import { Pill } from '../../components/ui/Pill'
import { Callout } from '../../components/ui/Callout'
import { MOCK_ROOMS } from '../../data/mock'

/* ── Types ─────────────────────────────────────────────────── */

type RowStatus =
  | 'valid'
  | 'blank-water'
  | 'blank-elec'
  | 'blank-both'
  | 'no-tenants'
  | 'error'
  | 'duplicate'

interface ValidatedRow {
  room:       string
  occ:        number | null
  water:      number | null
  elec:       number | null
  status:     RowStatus
  issue:      string
  lineNumber: number
}

interface DuplicateGroup {
  room:       string
  rows:       ValidatedRow[]
  chosenLine: number | null   // null = unresolved
}

/* ── Billing summary mock data ─────────────────────────────── */

const SAMPLE_ROWS = [
  { label: 'Rent share',  amount: 3000, source: 'room'     },
  { label: 'Wi-Fi share', amount: 100,  source: 'room'     },
  { label: 'Water share', amount: 150,  source: 'room·csv' },
  { label: 'Elec. share', amount: 400,  source: 'room·csv' },
  { label: 'Parking',     amount: 500,  source: 'tenant'   },
  { label: 'Laptop fee',  amount: 100,  source: 'tenant'   },
]

const ALL_DRAFTS = [
  { name: 'J. Cruz',      amount: 4250 },
  { name: 'R. Lim',       amount: 4350 },
  { name: 'A. Tan',       amount: 5900 },
  { name: 'D. Cruz',      amount: 4650 },
  { name: 'L. Yu',        amount: 4650 },
  { name: 'B. So',        amount: 3800 },
  { name: 'C. Mendez',    amount: 3950 },
  { name: 'P. Reyes',     amount: 3950 },
  { name: 'E. Ong',       amount: 4100 },
  { name: 'M. Sy',        amount: 4100 },
  { name: 'K. Dela Cruz', amount: 4100 },
]

const TOTAL_EST      = ALL_DRAFTS.reduce((s, d) => s + d.amount, 0)
const AVG_PER_TENANT = Math.round(TOTAL_EST / ALL_DRAFTS.length)
const DRAFT_COUNT    = ALL_DRAFTS.length

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(n: number) {
  return `₱${n.toLocaleString('en-PH')}`
}

/* ── Shared table classes ──────────────────────────────────── */

const TH    = 'px-3 py-[8px] bg-bg text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap text-left'
const TD    = 'px-3 text-ink-2 text-[13px]'
const PDROW = { paddingTop: 'var(--pad-row)', paddingBottom: 'var(--pad-row)' } as const

/* ── Row status config ─────────────────────────────────────── */

const ROW_STATUS: Record<RowStatus, { label: string; variant: 'up' | 'accent' | 'down' }> = {
  'valid':       { label: 'Valid',        variant: 'up'     },
  'blank-water': { label: 'Blank water',  variant: 'accent' },
  'blank-elec':  { label: 'Blank elec',   variant: 'accent' },
  'blank-both':  { label: 'Blank both',   variant: 'accent' },
  'no-tenants':  { label: 'No tenants',   variant: 'accent' },
  'error':       { label: 'Error',        variant: 'down'   },
  'duplicate':   { label: 'Duplicate',    variant: 'down'   },
}

/* ── Step indicator ────────────────────────────────────────── */

const STEPS = ['Setup', 'Template', 'Upload', 'Generate'] as const

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="grid mb-8 w-full" style={{ gridTemplateColumns: `repeat(${STEPS.length}, 1fr)` }}>
      {STEPS.map((label, i) => {
        const num    = i + 1
        const done   = num < current
        const active = num === current
        return (
          <div key={label} className="flex flex-col items-center relative">
            {i > 0 && (
              <div className="absolute h-px bg-border" style={{ top: '14px', left: 0, right: '50%' }} />
            )}
            {i < STEPS.length - 1 && (
              <div className="absolute h-px bg-border" style={{ top: '14px', left: '50%', right: 0 }} />
            )}
            <span className={[
              'relative z-10 w-7 h-7 rounded-pill text-[12px] font-semibold flex items-center justify-center shrink-0',
              done   ? 'bg-accent text-white'                                        :
              active ? 'border-2 border-dashed border-accent text-accent bg-surface' :
                       'border-2 border-border text-ink-4 bg-surface',
            ].join(' ')}>
              {done ? '✓' : num}
            </span>
            <span className={`mt-1.5 text-[12.5px] font-medium ${
              active ? 'text-accent font-semibold' :
              done   ? 'text-accent'               : 'text-ink-4'
            }`}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Step 1: Setup ─────────────────────────────────────────── */

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <>
      <Card>
        <CardHead title="Step 1 · Setup" subtitle="Confirm the billing run details." />
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-[13.5px] mb-5">
          {[
            { label: 'Property',                        value: 'Sunset Apartments' },
            { label: 'Period',                          value: 'March 2026'        },
            { label: 'Billing day',                     value: '15th'              },
            { label: 'Active tenants',                  value: '11'                },
            { label: 'Rooms with non-fixed charges',    value: '6', subtitle: 'To be filled by CSV import' },
            { label: 'Rooms with no non-fixed charges', value: '2'                 },
          ].map(r => (
            <div key={r.label} className="flex flex-col gap-0.5">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">
                {r.label}
              </dt>
              {r.subtitle && (
                <span className="text-[11px] text-ink-4 -mt-0.5">{r.subtitle}</span>
              )}
              <dd className="font-medium text-ink">{r.value}</dd>
            </div>
          ))}
        </dl>
        <Callout variant="info" icon={<Info size={16} strokeWidth={1.75} />}>
          <p className="text-[13px]">
            <strong className="font-semibold text-ink">Non-fixed charges</strong>{' '}
            (Water, Electricity) require CSV values in step 3.
            Fixed charges are automatically included.
          </p>
        </Callout>
      </Card>
      <div className="flex justify-end mt-4">
        <Button variant="primary" onClick={onNext}>
          Next <ArrowRight size={13} strokeWidth={1.75} />
        </Button>
      </div>
    </>
  )
}

/* ── Step 2: Template ──────────────────────────────────────── */

const TEMPLATE_ROOMS = ['A-101', 'A-102', 'A-103', 'A-104', 'B-201', 'B-203']

function downloadTemplate() {
  const header = 'room,occupants,water_php,electricity_php'
  const rows   = TEMPLATE_ROOMS.map(roomName => {
    const mock = MOCK_ROOMS.find(r => r.name === roomName)
    const occ  = mock != null ? mock.tenants.length : ''
    return `${roomName},${occ},,`
  })
  const csv  = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'sunset-mar-2026.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function Step2({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <>
      <Card>
        <CardHead
          title="Step 2 · Download template"
          subtitle="Fill in the non-fixed charge amounts for each room, then upload in step 3."
        />

        <div className="rounded-btn border border-border overflow-hidden mb-5">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className={TH}>Room</th>
                <th className={`${TH} text-right`}>Occupants</th>
                <th className={`${TH} text-right`}>Water (₱)</th>
                <th className={`${TH} text-right`}>Electricity (₱)</th>
              </tr>
            </thead>
            <tbody>
              {TEMPLATE_ROOMS.map(roomName => {
                const mock = MOCK_ROOMS.find(r => r.name === roomName)
                const occ  = mock != null ? mock.tenants.length : '—'
                return (
                  <tr key={roomName} className="border-b border-border-subtle last:border-b-0">
                    <td className={TD} style={PDROW}>
                      <span className="font-mono text-ink font-medium">{roomName}</span>
                    </td>
                    <td className={`${TD} text-right font-mono text-ink`} style={PDROW}>{occ}</td>
                    <td className={`${TD} text-right text-ink-4`} style={PDROW}>—</td>
                    <td className={`${TD} text-right text-ink-4`} style={PDROW}>—</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <Button variant="accent" onClick={downloadTemplate}>
          <Download size={14} strokeWidth={1.75} />
          Download sunset-mar-2026.csv
        </Button>

        <Callout variant="info" icon={<Info size={16} strokeWidth={1.75} />} className="mt-4">
          <p className="text-[13px]">
            Enter the <strong className="font-semibold text-ink">total bill amount</strong>{' '}
            (not meter reading) per room. Leave a cell blank to bill ₱0 — you'll see a warning.
            Occupant counts are pre-filled for reference.
          </p>
        </Callout>
      </Card>

      <div className="flex justify-between mt-4">
        <Button variant="default" onClick={onBack}>
          <ArrowLeft size={13} strokeWidth={1.75} /> Back
        </Button>
        <Button variant="primary" onClick={onNext}>
          Next <ArrowRight size={13} strokeWidth={1.75} />
        </Button>
      </div>
    </>
  )
}

/* ── CSV parsing ───────────────────────────────────────────── */

function buildKnownRoomsMap(): Map<string, number> {
  const map = new Map<string, number>()
  TEMPLATE_ROOMS.forEach(roomName => {
    const mock = MOCK_ROOMS.find(r => r.name === roomName)
    map.set(roomName, mock != null ? mock.tenants.length : 0)
  })
  return map
}

function parseCSVRows(text: string): ValidatedRow[] {
  const knownRooms = buildKnownRoomsMap()
  const lines      = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const dataLines  = lines.slice(1)              // skip header
  const rowsByRoom = new Map<string, number[]>()  // room → indices in result
  const rows: ValidatedRow[] = []

  dataLines.forEach((line, i) => {
    const lineNumber = i + 2   // 1-indexed; +1 for header
    const parts      = line.split(',').map(p => p.trim())
    const room       = (parts[0] ?? '').trim()
    const waterRaw   = parts[2] ?? ''
    const elecRaw    = parts[3] ?? ''

    if (!room) return

    // Unknown room
    if (!knownRooms.has(room)) {
      rows.push({ room, occ: null, water: null, elec: null, status: 'error', issue: 'Unknown room — not in this billing run', lineNumber })
      return
    }

    const occ      = knownRooms.get(room)!
    const water    = waterRaw !== '' ? Number(waterRaw) : null
    const elec     = elecRaw  !== '' ? Number(elecRaw)  : null
    const waterBad = water !== null && isNaN(water)
    const elecBad  = elec  !== null && isNaN(elec)

    // Non-numeric value
    if (waterBad || elecBad) {
      rows.push({ room, occ, water: null, elec: null, status: 'error', issue: 'Non-numeric value in water or electricity column', lineNumber })
      return
    }

    // Track for duplicate detection
    if (!rowsByRoom.has(room)) rowsByRoom.set(room, [])
    rowsByRoom.get(room)!.push(rows.length)

    // Determine warning status
    let status: RowStatus = 'valid'
    let issue  = ''
    if (occ === 0) {
      status = 'no-tenants'; issue = 'No active tenants — row will be skipped'
    } else if (water === null && elec === null) {
      status = 'blank-both';  issue = 'Both water and electricity are blank — will bill ₱0'
    } else if (water === null) {
      status = 'blank-water'; issue = 'Water is blank — will bill ₱0'
    } else if (elec === null) {
      status = 'blank-elec';  issue = 'Electricity is blank — will bill ₱0'
    }

    rows.push({ room, occ, water, elec, status, issue, lineNumber })
  })

  // Mark duplicates (overrides previous status)
  rowsByRoom.forEach((indices, room) => {
    if (indices.length > 1) {
      indices.forEach(idx => {
        rows[idx] = { ...rows[idx], status: 'duplicate', issue: `Duplicate entry for ${room} — choose which row to keep` }
      })
    }
  })

  return rows
}

function resolveRows(rows: ValidatedRow[], groups: DuplicateGroup[]): ValidatedRow[] {
  if (groups.length === 0) return rows

  // Lines the user chose NOT to keep
  const removedLines = new Set<number>()
  groups.forEach(g => {
    if (g.chosenLine !== null) {
      g.rows.forEach(r => {
        if (r.lineNumber !== g.chosenLine) removedLines.add(r.lineNumber)
      })
    }
  })

  return rows
    .filter(r => !removedLines.has(r.lineNumber))
    .map(r => {
      // Restore the chosen row's real status (strip the duplicate flag)
      const group = groups.find(g => g.room === r.room && g.chosenLine === r.lineNumber)
      if (!group) return r
      const occ = r.occ ?? 0
      if (occ === 0)                           return { ...r, status: 'no-tenants' as RowStatus, issue: 'No active tenants — row will be skipped' }
      if (r.water === null && r.elec === null) return { ...r, status: 'blank-both'  as RowStatus, issue: 'Both water and electricity are blank — will bill ₱0' }
      if (r.water === null)                    return { ...r, status: 'blank-water' as RowStatus, issue: 'Water is blank — will bill ₱0' }
      if (r.elec  === null)                    return { ...r, status: 'blank-elec'  as RowStatus, issue: 'Electricity is blank — will bill ₱0' }
      return { ...r, status: 'valid' as RowStatus, issue: '' }
    })
}

function downloadErrorReport(rows: ValidatedRow[], sourceFileName: string) {
  const problemRows = rows.filter(r => r.status !== 'valid')
  if (problemRows.length === 0) return
  const header = 'line_number,room,occupants,water_php,electricity_php,issue'
  const lines  = problemRows.map(r =>
    `${r.lineNumber},${r.room},${r.occ ?? ''},${r.water ?? ''},${r.elec ?? ''},"${r.issue}"`
  )
  const csv  = [header, ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = sourceFileName.replace(/\.csv$/i, '-errors.csv')
  a.click()
  URL.revokeObjectURL(url)
}

/* ── Step 3: Upload & review ───────────────────────────────── */

type UploadPhase = 'idle' | 'selected' | 'processing' | 'done'

function Step3({
  onBack,
  onNext,
  fileLoaded,
  onFileLoaded,
}: {
  onBack:       () => void
  onNext:       () => void
  fileLoaded:   boolean
  onFileLoaded: (v: boolean) => void
}) {
  const [phase,           setPhase]           = useState<UploadPhase>(fileLoaded ? 'done' : 'idle')
  const [selectedFile,    setSelectedFile]    = useState<File | null>(null)
  const [parsedRows,      setParsedRows]      = useState<ValidatedRow[]>([])
  const [processedCount,  setProcessedCount]  = useState(0)
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Derive display rows after duplicate resolution
  const resolvedRows   = resolveRows(parsedRows, duplicateGroups)
  const totalCount     = parsedRows.length
  const validCount     = resolvedRows.filter(r => r.status === 'valid').length
  const warnCount      = resolvedRows.filter(r => ['blank-water', 'blank-elec', 'blank-both', 'no-tenants'].includes(r.status)).length
  const errCount       = resolvedRows.filter(r => r.status === 'error').length
  const unresolvedDups = duplicateGroups.filter(g => g.chosenLine === null).length
  const hasHardError   = errCount > 0 || unresolvedDups > 0
  const hasProblem     = resolvedRows.some(r => r.status !== 'valid')
  const progressPct    = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0

  function openFilePicker() { fileInputRef.current?.click() }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPhase('selected')
    e.target.value = ''   // allow re-selecting the same file
  }

  function handleProcess() {
    if (!selectedFile) return
    setPhase('processing')
    setParsedRows([])
    setProcessedCount(0)
    setDuplicateGroups([])

    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const rows = parseCSVRows(text)

      // Build duplicate groups
      const roomMap = new Map<string, ValidatedRow[]>()
      rows.forEach(r => {
        if (r.status === 'duplicate') {
          if (!roomMap.has(r.room)) roomMap.set(r.room, [])
          roomMap.get(r.room)!.push(r)
        }
      })
      const groups: DuplicateGroup[] = []
      roomMap.forEach((dupRows, room) => groups.push({ room, rows: dupRows, chosenLine: null }))

      setParsedRows(rows)
      setDuplicateGroups(groups)

      // Animate row-by-row progress — pace relative to row count, ~1s total
      const msPerRow = Math.max(60, Math.min(250, 1000 / Math.max(rows.length, 1)))
      let count = 0
      function tick() {
        count++
        setProcessedCount(count)
        if (count < rows.length) {
          setTimeout(tick, msPerRow)
        } else {
          setPhase('done')
          onFileLoaded(true)
        }
      }
      setTimeout(tick, msPerRow)
    }
    reader.readAsText(selectedFile)
  }

  function handleReplace() {
    setPhase('idle')
    setSelectedFile(null)
    setParsedRows([])
    setProcessedCount(0)
    setDuplicateGroups([])
    onFileLoaded(false)
    // Re-open picker immediately so "Replace file" feels like one action
    setTimeout(() => fileInputRef.current?.click(), 50)
  }

  function resolveDuplicate(room: string, chosenLine: number) {
    setDuplicateGroups(prev =>
      prev.map(g => g.room === room ? { ...g, chosenLine } : g)
    )
  }

  return (
    <>
      <Card>
        <CardHead
          title="Step 3 · Upload & review"
          subtitle="Upload your filled CSV to validate the non-fixed charge amounts."
        />

        {/* Hidden real file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* ── Idle: drop zone ── */}
        {phase === 'idle' && (
          <button
            type="button"
            onClick={openFilePicker}
            className="w-full border-2 border-dashed border-border-strong bg-bg hover:border-accent hover:bg-accent-tint rounded-btn p-8 text-center transition-ui"
          >
            <Upload className="mx-auto text-ink-3 mb-2" size={22} strokeWidth={1.5} />
            <p className="text-[13.5px] text-ink-2">
              Drop CSV here or{' '}
              <span className="text-accent-2 font-semibold underline underline-offset-2">browse</span>
            </p>
            <p className="font-mono text-[11.5px] text-ink-4 mt-1">Expected: sunset-mar-2026.csv</p>
          </button>
        )}

        {/* ── Selected: confirm before processing ── */}
        {phase === 'selected' && (
          <div className="border border-border rounded-btn p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-btn bg-surface-2 border border-border flex items-center justify-center shrink-0">
                <Upload size={15} strokeWidth={1.75} className="text-ink-3" />
              </div>
              <div className="min-w-0">
                <p className="text-[13.5px] font-medium text-ink truncate">{selectedFile?.name}</p>
                <p className="text-[11.5px] text-ink-4">Ready to process — confirm or choose a different file</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="default" onClick={openFilePicker}>
                Choose different file
              </Button>
              <Button variant="accent" onClick={handleProcess}>
                Process file <ArrowRight size={13} strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        )}

        {/* ── Processing: real row-by-row progress ── */}
        {phase === 'processing' && (
          <div className="border border-border rounded-btn p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <Loader2 size={15} strokeWidth={1.75} className="text-accent animate-spin shrink-0" />
              <span className="text-[13.5px] font-medium text-ink-2">
                {processedCount < totalCount
                  ? `Validating row ${processedCount + 1} of ${totalCount}…`
                  : 'Finalising…'}
              </span>
              <span className="ml-auto font-mono text-[12px] text-ink-3">{progressPct}%</span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-100"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-2 flex gap-5 text-[11.5px] font-mono text-ink-4">
              <span>{processedCount} processed</span>
              <span>{totalCount - processedCount} remaining</span>
            </div>
          </div>
        )}

        {/* ── Done: results ── */}
        {phase === 'done' && (
          <>
            {/* Status banner — filename as anchor, stat chips, file-level actions */}
            <div className={[
              'border rounded-btn p-4 mb-5',
              hasHardError  ? 'border-danger  bg-[hsl(var(--color-danger)/0.06)]'  :
              warnCount > 0 ? 'border-warning bg-[hsl(var(--color-warning)/0.06)]' :
                              'border-success bg-[hsl(var(--color-success)/0.06)]',
            ].join(' ')}>
              {/* Row 1: filename + replace button */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  {hasHardError
                    ? <AlertTriangle size={15} strokeWidth={1.75} className="text-danger shrink-0" />
                    : warnCount > 0
                      ? <AlertTriangle size={15} strokeWidth={1.75} className="text-warning shrink-0" />
                      : <CheckCircle2  size={15} strokeWidth={1.75} className="text-success shrink-0" />
                  }
                  <span className="text-[14px] font-semibold text-ink truncate">{selectedFile?.name}</span>
                </div>
                <Button variant="default" onClick={handleReplace} className="shrink-0">
                  Replace file
                </Button>
              </div>
              {/* Row 2: stat chips + download error report */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[12px] font-semibold">
                  <CheckCircle2 size={11} strokeWidth={2.5} />
                  {validCount} valid
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${warnCount > 0 ? 'bg-warning/10 text-warning' : 'bg-surface-2 text-ink-4'}`}>
                  <AlertTriangle size={11} strokeWidth={2.5} />
                  {warnCount} warning{warnCount !== 1 ? 's' : ''}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${errCount > 0 ? 'bg-danger/10 text-danger' : 'bg-surface-2 text-ink-4'}`}>
                  <X size={11} strokeWidth={2.5} />
                  {errCount} error{errCount !== 1 ? 's' : ''}
                </span>
                {hasProblem && (
                  <>
                    <span className="text-border mx-1">|</span>
                    <button
                      type="button"
                      onClick={() => downloadErrorReport(resolvedRows, selectedFile?.name ?? 'import.csv')}
                      className="inline-flex items-center gap-1.5 text-[12px] text-ink-3 hover:text-ink transition-colors"
                    >
                      <Download size={11} strokeWidth={2} />
                      Download error report
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Duplicate resolution — must resolve before proceeding */}
            {duplicateGroups.length > 0 && (
              <div className="mb-5">
                <Callout variant="warning" icon={<AlertTriangle size={16} strokeWidth={1.75} />} className="mb-3">
                  <p className="text-[13px] font-medium">
                    {duplicateGroups.length} room{duplicateGroups.length > 1 ? 's have' : ' has'} duplicate
                    entries. Choose which row to keep for each before you can proceed.
                  </p>
                </Callout>

                <div className="flex flex-col gap-3">
                  {duplicateGroups.map(group => (
                    <div key={group.room} className="border border-border rounded-btn overflow-hidden">
                      {/* Group header */}
                      <div className="bg-surface-2 px-3 py-2 border-b border-border flex items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">Duplicate</span>
                        <span className="font-mono text-[13px] font-semibold text-ink">{group.room}</span>
                        <div className="ml-auto">
                          {group.chosenLine === null
                            ? <Pill variant="down">Unresolved</Pill>
                            : <Pill variant="up">Resolved</Pill>
                          }
                        </div>
                      </div>

                      {/* Rows to choose from */}
                      {group.rows.map(row => {
                        const chosen = group.chosenLine === row.lineNumber
                        return (
                          <button
                            key={row.lineNumber}
                            type="button"
                            onClick={() => resolveDuplicate(group.room, row.lineNumber)}
                            className={[
                              'w-full flex items-center gap-4 px-3 py-2.5 text-left border-b border-border-subtle last:border-b-0 transition-ui',
                              chosen ? 'bg-accent-tint' : 'hover:bg-surface-2',
                            ].join(' ')}
                          >
                            {/* Radio */}
                            <div className={[
                              'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                              chosen ? 'border-accent' : 'border-border',
                            ].join(' ')}>
                              {chosen && <div className="w-2 h-2 rounded-full bg-accent" />}
                            </div>
                            {/* Row details */}
                            <div className="flex items-center gap-6 text-[13px] flex-1 min-w-0">
                              <span className="font-mono text-[11.5px] text-ink-4 shrink-0">Row {row.lineNumber}</span>
                              <span className="text-ink-2 shrink-0">
                                Water: <span className="font-mono text-ink">{row.water != null ? fmtPHP(row.water) : '—'}</span>
                              </span>
                              <span className="text-ink-2 shrink-0">
                                Elec: <span className="font-mono text-ink">{row.elec != null ? fmtPHP(row.elec) : '—'}</span>
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation table */}
            <div className="rounded-btn border border-border overflow-hidden mb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className={TH}>Row</th>
                    <th className={TH}>Room</th>
                    <th className={`${TH} text-right`}>Occupants</th>
                    <th className={`${TH} text-right`}>Water (₱)</th>
                    <th className={`${TH} text-right`}>Electricity (₱)</th>
                    <th className={TH}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedRows.map(row => {
                    const { label, variant } = ROW_STATUS[row.status]
                    const accentBorder =
                      row.status === 'error' || row.status === 'duplicate' ? 'border-l-2 border-l-danger' :
                      row.status !== 'valid'                                ? 'border-l-2 border-l-warning' : ''
                    return (
                      <tr key={row.lineNumber} className={`border-b border-border-subtle last:border-b-0 ${accentBorder}`}>
                        <td className={`${TD} font-mono text-ink-4`} style={PDROW}>{row.lineNumber}</td>
                        <td className={TD} style={PDROW}>
                          <span className="font-mono text-ink font-medium">{row.room}</span>
                          {row.issue && (
                            <p className="text-[11px] text-ink-4 mt-0.5 font-normal">{row.issue}</p>
                          )}
                        </td>
                        <td className={`${TD} text-right font-mono`} style={PDROW}>
                          {row.occ ?? <span className="text-ink-4">—</span>}
                        </td>
                        <td className={`${TD} text-right font-mono`} style={PDROW}>
                          {row.water != null ? fmtPHP(row.water) : <span className="text-ink-4">—</span>}
                        </td>
                        <td className={`${TD} text-right font-mono`} style={PDROW}>
                          {row.elec != null ? fmtPHP(row.elec) : <span className="text-ink-4">—</span>}
                        </td>
                        <td className={TD} style={PDROW}>
                          <Pill variant={variant}>{label}</Pill>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Hard-error blocker message */}
            {hasHardError && (
              <Callout variant="warning" icon={<AlertTriangle size={16} strokeWidth={1.75} />}>
                <p className="text-[13px]">
                  {unresolvedDups > 0 && errCount > 0
                    ? 'Resolve all duplicates and fix the errors in your CSV before proceeding.'
                    : unresolvedDups > 0
                      ? 'Resolve all duplicate entries above before proceeding.'
                      : 'Fix the errors in your CSV and re-upload before proceeding.'}
                </p>
              </Callout>
            )}
          </>
        )}
      </Card>

      <div className="flex justify-between mt-4">
        <Button variant="default" onClick={onBack}>
          <ArrowLeft size={13} strokeWidth={1.75} /> Back
        </Button>
        {phase === 'done' && !hasHardError && (
          <Button variant="primary" onClick={onNext}>
            Next <ArrowRight size={13} strokeWidth={1.75} />
          </Button>
        )}
      </div>
    </>
  )
}

/* ── Step 4: Generate ──────────────────────────────────────── */

function Step4({ onBack, onGenerate }: { onBack: () => void; onGenerate: () => void }) {
  return (
    <>
      <Card>
        <CardHead title="Step 4 · Generate" subtitle="Review the summary then confirm." />

        <div className="flex flex-col divide-y divide-border-subtle mb-5">
          {[
            { label: 'Drafts to generate', value: String(DRAFT_COUNT)    },
            { label: 'Total billed (est.)', value: fmtPHP(TOTAL_EST)      },
            { label: 'Avg per tenant',      value: fmtPHP(AVG_PER_TENANT) },
            { label: 'Replaces existing',   value: '2 drafts'             },
            { label: 'Warnings',            value: '2 (will proceed)'     },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-3">
              <span className="text-[13.5px] text-ink-3">{r.label}</span>
              <span className="font-mono font-medium text-ink text-[13.5px]">{r.value}</span>
            </div>
          ))}
        </div>

        <Callout variant="warning" icon={<AlertTriangle size={16} strokeWidth={1.75} />}>
          <p className="text-[13px]">
            <strong className="font-semibold text-ink">2 existing drafts</strong>{' '}
            will be replaced by this run. This cannot be undone.
          </p>
        </Callout>
      </Card>

      <div className="flex justify-between mt-4">
        <Button variant="default" onClick={onBack}>
          <ArrowLeft size={13} strokeWidth={1.75} /> Back
        </Button>
        <Button variant="accent" onClick={onGenerate}>
          Generate {DRAFT_COUNT} drafts <ArrowRight size={13} strokeWidth={1.75} />
        </Button>
      </div>
    </>
  )
}

/* ── Live preview panel ────────────────────────────────────── */

function LivePreview() {
  const [selectedIdx, setSelectedIdx] = useState(0)

  const selected    = ALL_DRAFTS[selectedIdx]
  const sampleTotal = SAMPLE_ROWS.reduce((s, r) => s + r.amount, 0)
  const scale       = selected.amount / sampleTotal
  const scaledRows  = SAMPLE_ROWS.map(r => ({ ...r, amount: Math.round(r.amount * scale) }))
  const scaledTotal = scaledRows.reduce((s, r) => s + r.amount, 0)

  return (
    <div className="sticky top-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[16px] font-semibold text-ink tracking-[-0.01em]">
          Live preview
        </h2>
        <Pill variant="accent">{DRAFT_COUNT} drafts</Pill>
      </div>

      <Card>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-ink-3">Total billed (est.)</span>
            <span className="font-display text-[20px] font-bold text-ink tracking-[-0.02em]">
              {fmtPHP(TOTAL_EST)}
            </span>
          </div>
          <div className="border-t border-border-subtle pt-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-3">Avg per tenant</span>
              <span className="font-mono font-medium text-ink-2 text-[13px]">{fmtPHP(AVG_PER_TENANT)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-3">Replaces existing drafts</span>
              <span className="font-mono font-medium text-ink-2 text-[13px]">2</span>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-2">
          Bill preview
        </p>
        <Card noPadding>
          {/* Tenant name header */}
          <div className="px-3 py-2.5 border-b border-border flex items-center gap-2 bg-surface-2">
            <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-accent leading-none">
                {selected.name.charAt(0)}
              </span>
            </div>
            <span className="text-[13px] font-semibold text-ink">{selected.name}</span>
            <span className="ml-auto text-[11px] text-ink-4 font-normal">draft</span>
          </div>
          <table className="w-full border-collapse">
            <tbody>
              {scaledRows.map(row => (
                <tr key={row.label} className="border-b border-border-subtle">
                  <td className="px-3 text-[13px] text-ink-2" style={PDROW}>{row.label}</td>
                  <td className="px-3 text-right font-mono text-[13px] text-ink-2" style={PDROW}>
                    {fmtPHP(row.amount)}
                  </td>
                </tr>
              ))}
              <tr className="bg-surface-2">
                <td className="px-3 text-[13px] font-semibold text-ink" style={PDROW}>Total</td>
                <td className="px-3 text-right font-mono font-semibold text-[13px] text-ink" style={PDROW}>
                  {fmtPHP(scaledTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 mb-2">
          All drafts
        </p>
        <Card noPadding>
          <div className="max-h-[200px] overflow-y-auto">
            {ALL_DRAFTS.map((d, i) => {
              const isSelected = i === selectedIdx
              return (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => setSelectedIdx(i)}
                  className={[
                    'w-full flex items-center justify-between px-3 transition-ui text-left',
                    i < ALL_DRAFTS.length - 1 ? 'border-b border-border-subtle' : '',
                    isSelected ? 'bg-accent-tint' : 'hover:bg-surface-2',
                  ].join(' ')}
                  style={PDROW}
                >
                  <span className={`text-[13px] ${isSelected ? 'text-ink font-medium' : 'text-ink-2'}`}>
                    {d.name}
                  </span>
                  <span className={`font-mono text-[13px] ${isSelected ? 'text-accent-2 font-medium' : 'text-ink-2'}`}>
                    {fmtPHP(d.amount)}
                  </span>
                </button>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

export function GenerateBills() {
  const navigate = useNavigate()
  const [step,       setStep]       = useState(1)
  const [fileLoaded, setFileLoaded] = useState(false)

  function goToStep(n: number) {
    if (n !== 3) setFileLoaded(false)
    setStep(n)
  }

  const showPreview = step === 3 && fileLoaded

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-[28px] font-bold text-ink tracking-[-0.02em] leading-tight mb-1">
            New billing run
          </h1>
          <p className="text-[13.5px] text-ink-3">
            Mar 2026 ·{' '}
            <span className="text-ink-2 font-medium">Sunset Apartments</span>
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/landlord/billing')}>
          <X size={14} strokeWidth={2} /> Cancel
        </Button>
      </div>

      <div className="flex gap-6 items-start">

        <div className="flex-1 min-w-0">
          <StepIndicator current={step} />
          {step === 1 && <Step1 onNext={() => goToStep(2)} />}
          {step === 2 && <Step2 onBack={() => goToStep(1)} onNext={() => goToStep(3)} />}
          {step === 3 && (
            <Step3
              onBack={() => goToStep(2)}
              onNext={() => goToStep(4)}
              fileLoaded={fileLoaded}
              onFileLoaded={setFileLoaded}
            />
          )}
          {step === 4 && (
            <Step4
              onBack={() => goToStep(3)}
              onGenerate={() => navigate('/landlord/billing/cycle/sunset-mar-2026?tab=draft&highlight=1')}
            />
          )}
        </div>

        {/* Live preview — only step 3, only after CSV processed */}
        {showPreview && (
          <div className="w-[340px] shrink-0">
            <LivePreview />
          </div>
        )}

      </div>
    </main>
  )
}
