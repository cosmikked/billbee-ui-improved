export type CycleMonthState = 'closed' | 'current' | 'future'
export type EmailStatus     = 'not-sent' | 'sent' | 'failed' | 'na'
export type BillRowStatus   = 'draft' | 'posted' | 'partial' | 'paid' | 'overdue'

export interface CycleBillRow {
  id: string
  billNo: string
  tenant: string
  room: string
  totalPHP: number
  /** null for drafts */
  balancePHP: number | null
  status: BillRowStatus
  emailStatus: EmailStatus
}

export interface CycleDetailData {
  id: string
  propertyName: string
  periodLabel: string         // "March 2026"
  billingDayLabel: string     // "Mar 15"
  dueDateLabel: string        // "Mar 15"
  daysUntilDue: number
  cycleStatus: 'in-progress' | 'closed'
  pipeline: {
    drafts:      { count: number; sub: string }
    postNotify:  { count: number; sub: string; active: boolean }
    collect:     { count: number; sub: string }
    closed:      { sub: string }
  }
  stats: {
    billedPHP:       number
    billedSub:       string   // "8 of 11 bills created"
    collectedPHP:    number
    collectedSub:    string   // "18% so far"
    outstandingPHP:  number
    daysTodue:       number
    dueDateLabel:    string
  }
  missingBillTenants: string[] | null   // null = everyone has a bill
  bills: CycleBillRow[]
  cycleContext: {
    csvImport: string
    generatedBy: string
    generatedAt: string
  }
}

export interface BillingCycleMonth {
  id: string
  label: string
  state: CycleMonthState
}

export interface BillingCycleProperty {
  id: string
  propertyName: string
  billingDay: number
  periodLabel: string
  status: 'in-progress' | 'not-started'
  counts: {
    paid: number
    posted: number
    draft: number
    overdue: number
  }
  totals: {
    billedPHP: number
    collectedPHP: number
  }
}

export interface BillingCenterData {
  months: BillingCycleMonth[]
  currentMonthLabel: string
  cycles: BillingCycleProperty[]
  olderOverdue: {
    billCount: number
    monthLabel: string
    amountPHP: number
  }
}

