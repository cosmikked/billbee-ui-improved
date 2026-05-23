import type { BillStatus } from '../components/ui/StatusBadge'

export interface Property {
  id: string
  name: string
  address: string
  status: 'active' | 'inactive'
  readyToBill: boolean
  billingDay: number
  totalRooms: number
  occupiedRooms: number
  /** null = no data to show (e.g. inactive property with no payments) */
  collectedThisMonthPHP: number | null
}

/* ── Property Hub ─────────────────────────────────────────── */

export interface PropertyHubStats {
  rooms:            { total: number; active: number; maintenance: number }
  occupied:         { count: number; total: number; vacantBeds: number }
  activeTenants:    number
  billedThisMonth:  { amountPHP: number; collectedPct: number }
}

export interface PropertyHubCycle {
  label: string           // e.g. "March 2026"
  billingDayLabel: string // e.g. "billing day Mar 15 · due Mar 15"
  progressPct: number
  paid: number
  posted: number
  drafts: number
  overdue: number
  notYetDrafted: number
  draftsReadyToReview: number
  cycleUrl: string
  reviewDraftsUrl: string
  generateBillsUrl: string
}

export interface PropertyHubInfo {
  name: string
  address: string
  billingDay: number
  contact: string
  createdAt: string
}

export interface PropertyHubBill {
  billNo: string
  tenant: string
  period: string
  totalPHP: number
  status: BillStatus
}

export interface PropertyHubPayment {
  date: string
  tenant: string
  billNo: string
  amountPHP: number
  mode: string
  receiptNo: string
}

export interface PropertyHubData {
  propertyId: string
  nextBillingIn: number
  stats: PropertyHubStats
  cycle: PropertyHubCycle
  info: PropertyHubInfo
  recentBills: PropertyHubBill[]
  recentPayments: PropertyHubPayment[]
}
