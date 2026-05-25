import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CycleBillRow } from '../../../types/billing'
import { Drawer } from '../../../components/ui/Drawer'
import { Button } from '../../../components/ui/Button'

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(n: number) {
  return `₱${n.toLocaleString('en-PH')}`
}

/* ── Mock charge lines per bill (demo only) ────────────────── */
//
// In a real app these would come from the bill's persisted lines.
// For the prototype we derive a plausible breakdown from the total.

function mockLines(total: number): Array<{ name: string; amount: number; note: string }> {
  const rent = 3000
  const wifi = 100
  const water = 150
  const elec = total - rent - wifi - water
  return [
    { name: 'Rent',          amount: rent,              note: 'Monthly fee'   },
    { name: 'Wi-Fi',         amount: wifi,              note: 'Monthly fee'   },
    { name: 'Water',         amount: water,             note: 'Usage charge'  },
    { name: 'Electricity',   amount: Math.max(0, elec), note: 'Usage charge'  },
  ].filter(l => l.amount > 0)
}

/* ── Props ─────────────────────────────────────────────────── */

interface ReviewBillDrawerProps {
  bill: CycleBillRow | null
  allDrafts: CycleBillRow[]
  onClose: () => void
  onNavigate: (bill: CycleBillRow) => void
}

/* ── Component ─────────────────────────────────────────────── */

export function ReviewBillDrawer({
  bill,
  allDrafts,
  onClose,
  onNavigate,
}: ReviewBillDrawerProps) {
  if (!bill) return null

  const idx  = allDrafts.findIndex(b => b.id === bill.id)
  const prev = allDrafts[idx - 1] ?? null
  const next = allDrafts[idx + 1] ?? null
  const lines = mockLines(bill.totalPHP)

  const firstName = bill.tenant.split(' ')[0]

  return (
    <Drawer
      open
      onClose={onClose}
      side="right"
      width={400}
      title={`Bill for ${bill.tenant}`}
      subtitle={`Room ${bill.room} · March 2026`}
      footer={
        <div className="flex flex-col gap-2.5">
          {/* Primary CTA */}
          <Button variant="accent" className="w-full justify-center">
            Send bill to {firstName} →
          </Button>

          {/* Prev / Next */}
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1 justify-center"
              disabled={!prev}
              onClick={() => prev && onNavigate(prev)}
              title={prev ? `Previous: ${prev.tenant}` : 'No previous draft'}
            >
              <ChevronLeft size={13} strokeWidth={1.75} /> Prev
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1 justify-center"
              disabled={!next}
              onClick={() => next && onNavigate(next)}
              title={next ? `Next: ${next.tenant}` : 'No next draft'}
            >
              Next <ChevronRight size={13} strokeWidth={1.75} />
            </Button>
          </div>

          {/* Draft counter */}
          <p className="text-center text-[11.5px] text-ink-4">
            {idx + 1} of {allDrafts.length} unsent bills
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-5">

        {/* Charges breakdown */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3 mb-2">
            What's included
          </p>
          <div className="flex flex-col divide-y divide-border border border-border rounded-btn overflow-hidden">
            {lines.map(line => (
              <div key={line.name} className="flex items-center justify-between px-4 py-2.5 bg-surface">
                <div>
                  <p className="text-[13.5px] text-ink-2">{line.name}</p>
                  <p className="text-[11.5px] text-ink-4">{line.note}</p>
                </div>
                <span className="font-mono text-[13.5px] text-ink">{fmtPHP(line.amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 bg-surface-2">
              <span className="text-[14px] font-semibold text-ink">Total due</span>
              <span className="font-mono text-[18px] font-bold text-ink">{fmtPHP(bill.totalPHP)}</span>
            </div>
          </div>
        </div>

        {/* Due date */}
        <div className="flex items-center justify-between px-4 py-3 rounded-btn border border-border bg-surface">
          <span className="text-[13px] text-ink-3">Due date</span>
          <span className="text-[13.5px] font-medium text-ink">March 15, 2026</span>
        </div>

        {/* Edit link */}
        <div className="text-center">
          <button
            type="button"
            className="text-[13px] text-ink-3 hover:text-accent transition-colors underline underline-offset-2"
          >
            Need to change something? Edit details
          </button>
        </div>

      </div>
    </Drawer>
  )
}
