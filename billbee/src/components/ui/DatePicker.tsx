/* ── DatePicker ────────────────────────────────────────────────
   Full date picker (year + month + day).
   Styled after the billing-day grid: rounded day buttons,
   accent-filled selected day, soft neutral hover.

   Props
   ─────
   value      – ISO date string "YYYY-MM-DD" or ""
   onChange   – called with ISO string when a day is picked
   placeholder – shown when value is empty
   disabled   – disables the trigger
─────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

/* ── Helpers ───────────────────────────────────────────────── */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function parseISO(s: string): Date | null {
  if (!s) return null
  const d = new Date(s + 'T00:00:00')
  return isNaN(d.getTime()) ? null : d
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function formatDisplay(iso: string): string {
  const d = parseISO(iso)
  if (!d) return ''
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** Returns a grid of day numbers (0 = empty padding cell) */
function buildGrid(year: number, month: number): (number | 0)[] {
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | 0)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(0)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
}

/* ── Component ─────────────────────────────────────────────── */

interface DatePickerProps {
  value: string
  onChange: (iso: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select a date',
  disabled = false,
  className = '',
}: DatePickerProps) {
  const today = new Date()
  const todayY = today.getFullYear()
  const todayM = today.getMonth()
  const todayD = today.getDate()

  // Which month is visible in the calendar
  const initDate = parseISO(value) ?? today
  const [viewYear,  setViewYear]  = useState(initDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initDate.getMonth())
  const [open, setOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  // Sync view when value changes externally
  useEffect(() => {
    const d = parseISO(value)
    if (d) { setViewYear(d.getFullYear()); setViewMonth(d.getMonth()) }
  }, [value])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  function selectDay(day: number) {
    onChange(toISO(viewYear, viewMonth, day))
    setOpen(false)
  }

  const selectedDate = parseISO(value)
  const grid = buildGrid(viewYear, viewMonth)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={[
          'w-full flex items-center justify-between gap-2 border rounded-btn px-3 py-2 text-[13.5px] transition-colors',
          'focus:outline-none',
          open
            ? 'border-accent ring-1 ring-accent/30'
            : 'border-border hover:border-border-strong',
          value ? 'text-ink' : 'text-ink-4',
          disabled ? 'opacity-50 cursor-not-allowed bg-surface-2' : 'bg-surface cursor-pointer',
        ].join(' ')}
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <CalendarDays size={15} strokeWidth={1.75} className="shrink-0 text-ink-3" />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 left-0 w-[212px] bg-surface border border-border rounded-card shadow-lg p-2">

          {/* Month / year nav */}
          <div className="flex items-center justify-between mb-1.5">
            <button
              type="button"
              onClick={prevMonth}
              className="w-5 h-5 flex items-center justify-center rounded text-ink-3 hover:bg-surface-2 hover:text-ink transition-colors"
            >
              <ChevronLeft size={12} strokeWidth={2.2} />
            </button>

            <span className="text-[11.5px] font-semibold text-ink">
              {MONTHS[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="w-5 h-5 flex items-center justify-center rounded text-ink-3 hover:bg-surface-2 hover:text-ink transition-colors"
            >
              <ChevronRight size={12} strokeWidth={2.2} />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-0.5">
            {DOW.map(d => (
              <div key={d} className="text-center text-[9.5px] font-semibold text-ink-4 pb-0.5">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-px">
            {grid.map((day, i) => {
              if (day === 0) return <div key={`pad-${i}`} />

              const isSelected =
                selectedDate !== null &&
                selectedDate.getFullYear() === viewYear &&
                selectedDate.getMonth()   === viewMonth &&
                selectedDate.getDate()    === day

              const isToday =
                todayY === viewYear &&
                todayM === viewMonth &&
                todayD === day

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={[
                    'w-full h-6 flex items-center justify-center rounded text-[11px] font-medium transition-colors',
                    isSelected
                      ? 'bg-accent text-white'
                      : isToday
                        ? 'bg-surface-2 text-accent font-semibold ring-1 ring-accent/40'
                        : 'text-ink hover:bg-surface-2',
                  ].join(' ')}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Today shortcut */}
          <div className="mt-1.5 pt-1.5 border-t border-border text-center">
            <button
              type="button"
              onClick={() => {
                onChange(toISO(todayY, todayM, todayD))
                setOpen(false)
              }}
              className="text-[11px] font-medium text-accent hover:underline"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
