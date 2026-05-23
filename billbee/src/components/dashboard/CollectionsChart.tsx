import { useState } from 'react'
import { ALL_COLLECTION_MONTHS } from '../../data/mock'
import type { CollectionMonth } from '../../types/dashboard'
import { Card, CardHead } from '../ui/Card'
import { SegmentedControl } from '../ui/SegmentedControl'

type Range = '3M' | '6M' | '1Y'
const RANGES = ['3M', '6M', '1Y'] as const

/* ── Chart geometry ─────────────────────────────────────── */
const CX0 = 50, CX1 = 650
const CY_BASE = 200, CY_TOP = 20
const MAX_VAL = 80_000
const Y_RANGE = CY_BASE - CY_TOP

const GRIDLINES = [
  { y: 20,  label: '₱80k' },
  { y: 65,  label: '₱60k' },
  { y: 110, label: '₱40k' },
  { y: 155, label: '₱20k' },
  { y: 200, label: '₱0'   },
]

function getSeries(range: Range): CollectionMonth[] {
  if (range === '3M') return ALL_COLLECTION_MONTHS.slice(-3)
  if (range === '6M') return ALL_COLLECTION_MONTHS.slice(-6)
  return ALL_COLLECTION_MONTHS
}

interface BarGroup {
  month: CollectionMonth
  billedX: number; collX: number; labelX: number
  barW: number
  billedY: number; billedH: number
  collY: number;   collH: number
}

function buildGroups(series: CollectionMonth[]): BarGroup[] {
  const n = series.length
  const groupW = (CX1 - CX0) / n
  const barW = Math.min(32, Math.floor(groupW * 0.32))
  const gap = 2
  return series.map((month, i) => {
    const cx = CX0 + i * groupW + groupW / 2
    const billedH = Math.round((month.billed    / MAX_VAL) * Y_RANGE)
    const collH   = Math.round((month.collected / MAX_VAL) * Y_RANGE)
    return {
      month,
      billedX: cx - barW - gap / 2, collX: cx + gap / 2, labelX: cx,
      barW,
      billedY: CY_BASE - billedH, billedH,
      collY:   CY_BASE - collH,   collH,
    }
  })
}

function computeKPIs(series: CollectionMonth[]) {
  const current = series.find(m => m.isCurrent)
  const totalB  = series.reduce((s, m) => s + m.billed, 0)
  const totalC  = series.reduce((s, m) => s + m.collected, 0)
  return {
    thisPct:        current && current.billed > 0 ? Math.round((current.collected / current.billed) * 100) : 0,
    avgPct:         totalB > 0 ? Math.round((totalC / totalB) * 100) : 0,
    totalCollectedK: Math.round(totalC / 1000),
  }
}

function fmtPHP(n: number) {
  if (n >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `₱${(n / 1_000).toFixed(0)}k`
  return `₱${n.toLocaleString()}`
}

/* ── Chart legend swatch ─────────────────────────────────── */
function Swatch({ className }: { className: string }) {
  return <span className={`inline-block w-[10px] h-[10px] rounded-[2px] ${className}`} />
}

export function CollectionsChart() {
  const [range,   setRange]   = useState<Range>('6M')
  const [hovered, setHovered] = useState<string | null>(null)

  const series       = getSeries(range)
  const groups       = buildGroups(series)
  const kpis         = computeKPIs(series)
  const tooltipGroup = groups.find(g => g.month.month === hovered)
    ?? groups.find(g => g.month.isCurrent)

  return (
    <Card>
      <CardHead
        title={`Collections — last ${range === '1Y' ? '12' : range === '6M' ? '6' : '3'} months`}
        subtitle="billed vs collected · all properties"
        actions={
          <>
            {/* Legend */}
            <div className="flex items-center gap-4 text-[12px] text-ink-3">
              <span className="flex items-center gap-1.5">
                <Swatch className="bg-surface-2 border border-border-strong" />billed
              </span>
              <span className="flex items-center gap-1.5">
                <Swatch className="bg-ink" />collected
              </span>
              <span className="flex items-center gap-1.5">
                <Swatch className="bg-accent" />this month
              </span>
            </div>

            <SegmentedControl options={RANGES} value={range} onChange={setRange} />
          </>
        }
      />

      {/* SVG chart */}
      <svg viewBox="0 0 700 240" width="100%" height="240" style={{ display: 'block', overflow: 'visible' }}>

        {/* Gridlines + Y labels */}
        {GRIDLINES.map(({ y, label }) => (
          <g key={y}>
            {y < CY_BASE
              ? <line x1={CX0} y1={y} x2={CX1} y2={y} stroke="var(--color-border-subtle)" strokeDasharray="2 4" />
              : <line x1={CX0} y1={y} x2={CX1} y2={y} stroke="var(--color-border)" />
            }
            <text x={CX0 - 6} y={y + 4} textAnchor="end"
              fontFamily="Geist Mono, monospace" fontSize="10" fill="var(--color-ink-3)">
              {label}
            </text>
          </g>
        ))}

        {/* Bars */}
        {groups.map(g => {
          const cur   = g.month.isCurrent
          const isHov = hovered === g.month.month
          return (
            <g key={g.month.month}
              onMouseEnter={() => setHovered(g.month.month)}
              onMouseLeave={() => setHovered(null)}
            >
              <rect x={g.billedX} y={g.billedY} width={g.barW} height={g.billedH} rx="4"
                fill={cur ? 'var(--color-accent-soft)' : 'var(--color-surface-2)'}
                stroke={cur ? 'var(--color-accent)' : 'var(--color-border-strong)'} />

              <rect x={g.collX} y={g.collY} width={g.barW} height={g.collH} rx="4"
                fill={cur ? 'var(--color-accent)' : 'var(--color-ink)'}
                opacity={isHov && !cur ? 0.85 : 1} />

              <text x={g.labelX} y="220" textAnchor="middle"
                fontFamily="Inter, sans-serif" fontSize="11"
                fontWeight={cur ? '600' : '400'}
                fill={cur ? 'var(--color-ink)' : 'var(--color-ink-3)'}>
                {g.month.month}
              </text>
            </g>
          )
        })}

        {/* Tooltip */}
        {tooltipGroup && (() => {
          const tx = tooltipGroup.billedX + tooltipGroup.barW + 1 - 4
          const ty = Math.max(6, tooltipGroup.collY - 36)
          return (
            <g transform={`translate(${tx},${ty})`}>
              <rect x="-4" y="-4" width="96" height="32" rx="6" fill="var(--color-ink)" />
              <text x="0" y="7" fontFamily="Inter, sans-serif" fontSize="10" fill="rgba(255,255,255,0.6)">
                collected
              </text>
              <text x="0" y="20" fontFamily="Geist Mono, monospace" fontSize="12" fontWeight="600" fill="white">
                {fmtPHP(tooltipGroup.month.collected)}
              </text>
            </g>
          )
        })()}

      </svg>

      {/* Footer KPIs */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border-subtle text-[12.5px] text-ink-3 flex-wrap">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[14px] font-semibold text-ink">{kpis.thisPct}%</span>
          <span>collected this month</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[14px] font-semibold text-ink">{kpis.avgPct}%</span>
          <span>avg over {range}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[14px] font-semibold text-ink">₱{kpis.totalCollectedK}k</span>
          <span>total collected</span>
        </div>
        <div className="ml-auto text-ink-4 text-[11.5px]">
          updated <span className="font-mono">just now</span>
        </div>
      </div>
    </Card>
  )
}
