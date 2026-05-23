import type { DashboardProps } from '../types/dashboard'
import type { Property, PropertyHubData } from '../types/properties'
import type { Charge } from '../types/charges'
import type { Room } from '../types/rooms'

export const MOCK_DASHBOARD: DashboardProps = {
  user: {
    name: 'Maria Dela Cruz',
    email: 'maria@sunsetapts.ph',
    avatarInitials: 'MD',
  },
  greeting: 'Good evening, Maria 👋',
  nextBilling: {
    propertyName: 'Sunset Apartments',
    daysUntil: 3,
    cycleUrl: '/landlord/billing/generate?property=sunset-apts&period=2026-03',
  },
  stats: {
    properties:         { value: 2,      activeCount: 2 },
    rooms:              { value: 14,     occupied: 11,  vacant: 3 },
    activeTenants:      { value: 18,     deltaThisMonth: 2 },
    receiptsThisMonth:  { value: 11,     deltaVsLastMonth: 3 },
    draftBills:         { value: 0 },
    unpaidPosted:       { value: 6,      outstandingPHP: 19645 },
    overdue:            { value: 2,      outstandingPHP: 8200, oldestDays: 12 },
    collectedThisMonth: { collectedPHP: 42300, billedPHP: 61945, percent: 68 },
  },
  collections: {
    range: '6M',
    series: [
      { month: 'Oct', year: 2025, billed: 55000, collected: 52000, isCurrent: false },
      { month: 'Nov', year: 2025, billed: 58000, collected: 56000, isCurrent: false },
      { month: 'Dec', year: 2025, billed: 62000, collected: 47000, isCurrent: false },
      { month: 'Jan', year: 2026, billed: 67000, collected: 63000, isCurrent: false },
      { month: 'Feb', year: 2026, billed: 68000, collected: 64000, isCurrent: false },
      { month: 'Mar', year: 2026, billed: 62000, collected: 28000, isCurrent: true  },
    ],
    aggregates: {
      collectedThisMonthPct: 68,
      avgPct: 96,
      totalCollectedPHP: 318000,
      updatedAt: 'just now',
    },
  },
  notifications: { unreadCount: 3 },
}

/* Properties */
export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'sunset-apts',
    name: 'Sunset Apartments',
    address: '23 Pinewood St., Quezon City',
    status: 'active',
    readyToBill: true,
    billingDay: 15,
    totalRooms: 14,
    occupiedRooms: 11,
    collectedThisMonthPHP: 28000,
  },
  {
    id: 'greenview-res',
    name: 'Greenview Residences',
    address: 'Block 4, Lot 12, BF Homes',
    status: 'active',
    readyToBill: true,
    billingDay: 5,
    totalRooms: 10,
    occupiedRooms: 5,
    collectedThisMonthPHP: 14000,
  },
  {
    id: 'old-riverside',
    name: 'Old Riverside (legacy)',
    address: 'Riverside Rd., Marikina',
    status: 'inactive',
    readyToBill: false,
    billingDay: 1,
    totalRooms: 8,
    occupiedRooms: 0,
    collectedThisMonthPHP: null,
  },
]

/* Property Hub (Sunset Apartments) */
export const MOCK_PROPERTY_HUB: PropertyHubData = {
  propertyId: 'sunset-apts',
  nextBillingIn: 3,
  stats: {
    rooms:           { total: 14, active: 13, maintenance: 1 },
    occupied:        { count: 11, total: 14, vacantBeds: 3 },
    activeTenants:   11,
    billedThisMonth: { amountPHP: 33700, collectedPct: 68 },
  },
  cycle: {
    label:               'March 2026',
    billingDayLabel:     'billing day Mar 15 · due Mar 15',
    progressPct:         57,
    paid:                1,
    posted:              5,
    drafts:              2,
    overdue:             0,
    notYetDrafted:       3,
    draftsReadyToReview: 2,
    cycleUrl:            '/landlord/billing/generate?property=sunset-apts&period=2026-03',
    reviewDraftsUrl:     '/landlord/billing?property=sunset-apts&status=draft',
    generateBillsUrl:    '/landlord/billing/generate?property=sunset-apts&period=2026-03',
  },
  info: {
    name:       'Sunset Apartments',
    address:    '23 Pinewood St., QC',
    billingDay: 15,
    contact:    '0917-555-1234',
    createdAt:  'Mar 2023',
  },
  recentBills: [
    { billNo: 'BILL-26-00041', tenant: 'J. Cruz', period: 'Mar 2026', totalPHP: 4250, status: 'posted'  },
    { billNo: 'BILL-26-00040', tenant: 'R. Lim',  period: 'Mar 2026', totalPHP: 4350, status: 'partial' },
    { billNo: 'BILL-26-00039', tenant: 'A. Tan',  period: 'Mar 2026', totalPHP: 5900, status: 'paid'    },
    { billNo: 'BILL-26-00038', tenant: 'D. Cruz', period: 'Mar 2026', totalPHP: 4650, status: 'posted'  },
    { billNo: 'BILL-26-00037', tenant: 'L. Yu',   period: 'Mar 2026', totalPHP: 4650, status: 'posted'  },
  ],
  recentPayments: [
    { date: 'Mar 9',  tenant: 'J. Cruz', billNo: 'BILL-26-00041', amountPHP: 4350, mode: 'cash',     receiptNo: 'RCT-0183' },
    { date: 'Mar 8',  tenant: 'R. Lim',  billNo: 'BILL-26-00040', amountPHP: 3000, mode: 'bank',     receiptNo: 'RCT-0182' },
    { date: 'Mar 7',  tenant: 'A. Tan',  billNo: 'BILL-26-00039', amountPHP: 5900, mode: 'e-wallet', receiptNo: 'RCT-0181' },
    { date: 'Feb 28', tenant: 'J. Cruz', billNo: 'BILL-26-00033', amountPHP: 3750, mode: 'cash',     receiptNo: 'RCT-0178' },
  ],
}

/* Charge Catalog */
export const MOCK_CHARGES: Charge[] = [
  { id: 'water',       name: 'Water',               category: 'Water',       type: 'non-fixed',       scope: 'room-level',   defaultAmountPHP: null, attachedRooms: { count: 8, total: 8 }, status: 'active',   propertyId: 'sunset-apts' },
  { id: 'electricity', name: 'Electricity',          category: 'Electricity', type: 'non-fixed',       scope: 'room-level',   defaultAmountPHP: null, attachedRooms: { count: 8, total: 8 }, status: 'active',   propertyId: 'sunset-apts' },
  { id: 'wifi',        name: 'Wi-Fi Fee',            category: 'Other',       type: 'fixed',           scope: 'room-fixed',   defaultAmountPHP: 280,  attachedRooms: { count: 6, total: 8 }, status: 'active',   propertyId: 'sunset-apts' },
  { id: 'parking',     name: 'Parking Fee',          category: 'Parking',     type: 'fixed',           scope: 'tenant-level', defaultAmountPHP: 500,  attachedRooms: null,                    status: 'active',   propertyId: 'sunset-apts' },
  { id: 'pet',         name: 'Pet Fee',              category: 'Other',       type: 'fixed',           scope: 'tenant-level', defaultAmountPHP: 200,  attachedRooms: null,                    status: 'active',   propertyId: 'sunset-apts' },
  { id: 'laptop',      name: 'Laptop fee',           category: 'Gadgets',     type: 'tenant-specific', scope: 'tenant-level', defaultAmountPHP: 100,  attachedRooms: null,                    status: 'active',   propertyId: 'sunset-apts' },
  { id: 'old-aircon',  name: 'Old aircon surcharge', category: 'Appliances',  type: 'fixed',           scope: 'tenant-level', defaultAmountPHP: 150,  attachedRooms: null,                    status: 'inactive', propertyId: 'sunset-apts' },
]

/* Rooms (Sunset Apartments) */
export const MOCK_ROOMS: Room[] = [
  {
    id: 'a-101', name: 'A-101', propertyId: 'sunset-apts', status: 'active',
    capacity: 2, monthlyRentPHP: 6000, rentMode: 'Room Total (Split)', notes: '',
    tenants: [
      { id: 't1', name: 'Joseph Cruz', moveInLabel: 'Jan 2024' },
      { id: 't2', name: 'Rico Lim',    moveInLabel: 'Oct 2024' },
    ],
    charges: [
      { id: 'water',       name: 'Water',     type: 'non-fixed', scope: 'room-level', amountPHP: null, description: 'room-level · amount via CSV' },
      { id: 'electricity', name: 'Electricity', type: 'non-fixed', scope: 'room-level', amountPHP: null, description: 'room-level · amount via CSV' },
      { id: 'wifi',        name: 'Wi-Fi Fee', type: 'fixed',     scope: 'room-fixed', amountPHP: 200,  description: 'room-fixed · ₱200/mo · split ÷ occupants' },
    ],
    availableCharges: [
      { id: 'common-area', name: 'Common Area' },
      { id: 'cleaning',    name: 'Cleaning'    },
      { id: 'building',    name: 'Building'    },
      { id: 'maintenance', name: 'Maintenance' },
    ],
  },
  {
    id: 'a-102', name: 'A-102', propertyId: 'sunset-apts', status: 'active',
    capacity: 1, monthlyRentPHP: 4500, rentMode: 'Room Total (Split)', notes: '',
    tenants: [{ id: 't3', name: 'Ana Torres', moveInLabel: 'Mar 2024' }],
    charges: [
      { id: 'water',       name: 'Water',       type: 'non-fixed', scope: 'room-level', amountPHP: null, description: 'room-level · amount via CSV' },
      { id: 'electricity', name: 'Electricity', type: 'non-fixed', scope: 'room-level', amountPHP: null, description: 'room-level · amount via CSV' },
    ],
    availableCharges: [
      { id: 'wifi',        name: 'Wi-Fi Fee'   },
      { id: 'common-area', name: 'Common Area' },
    ],
  },
  {
    id: 'a-103', name: 'A-103', propertyId: 'sunset-apts', status: 'active',
    capacity: 2, monthlyRentPHP: 6000, rentMode: 'Room Total (Split)', notes: '',
    tenants: [],
    charges: [
      { id: 'water',       name: 'Water',       type: 'non-fixed', scope: 'room-level', amountPHP: null, description: 'room-level · amount via CSV' },
      { id: 'electricity', name: 'Electricity', type: 'non-fixed', scope: 'room-level', amountPHP: null, description: 'room-level · amount via CSV' },
    ],
    availableCharges: [{ id: 'wifi', name: 'Wi-Fi Fee' }],
  },
  {
    id: 'a-104', name: 'A-104', propertyId: 'sunset-apts', status: 'active',
    capacity: 3, monthlyRentPHP: 8000, rentMode: 'Room Total (Split)', notes: '',
    tenants: [
      { id: 't4', name: 'Diana Cruz',  moveInLabel: 'Jun 2023' },
      { id: 't5', name: 'Leon Yu',     moveInLabel: 'Nov 2023' },
    ],
    charges: [
      { id: 'water',       name: 'Water',       type: 'non-fixed', scope: 'room-level', amountPHP: null, description: 'room-level · amount via CSV' },
      { id: 'electricity', name: 'Electricity', type: 'non-fixed', scope: 'room-level', amountPHP: null, description: 'room-level · amount via CSV' },
      { id: 'wifi',        name: 'Wi-Fi Fee',   type: 'fixed',     scope: 'room-fixed', amountPHP: 200,  description: 'room-fixed · ₱200/mo · split ÷ occupants' },
    ],
    availableCharges: [{ id: 'common-area', name: 'Common Area' }],
  },
  {
    id: 'b-201', name: 'B-201', propertyId: 'sunset-apts', status: 'active',
    capacity: 4, monthlyRentPHP: 9000, rentMode: 'Room Total (Split)', notes: '',
    tenants: [
      { id: 't6',  name: 'Marco Reyes',  moveInLabel: 'Jan 2023' },
      { id: 't7',  name: 'Sofia Lim',    moveInLabel: 'Apr 2023' },
      { id: 't8',  name: 'Jake Santos',  moveInLabel: 'Sep 2023' },
    ],
    charges: [
      { id: 'water',       name: 'Water',       type: 'non-fixed', scope: 'room-level', amountPHP: null, description: 'room-level · amount via CSV' },
      { id: 'electricity', name: 'Electricity', type: 'non-fixed', scope: 'room-level', amountPHP: null, description: 'room-level · amount via CSV' },
    ],
    availableCharges: [{ id: 'wifi', name: 'Wi-Fi Fee' }],
  },
  {
    id: 'b-202', name: 'B-202', propertyId: 'sunset-apts', status: 'maintenance',
    capacity: 2, monthlyRentPHP: 0, rentMode: 'Room Total (Split)', notes: 'Under renovation — plumbing repair.',
    tenants: [],
    charges: [],
    availableCharges: [],
  },
  {
    id: 'b-203', name: 'B-203', propertyId: 'sunset-apts', status: 'active',
    capacity: 2, monthlyRentPHP: 6500, rentMode: 'Room Total (Split)', notes: '',
    tenants: [
      { id: 't9',  name: 'Carla Mendoza', moveInLabel: 'Feb 2024' },
      { id: 't10', name: 'Paul Guzman',   moveInLabel: 'Feb 2024' },
    ],
    charges: [
      { id: 'water',       name: 'Water',       type: 'non-fixed', scope: 'room-level', amountPHP: null, description: 'room-level · amount via CSV' },
      { id: 'electricity', name: 'Electricity', type: 'non-fixed', scope: 'room-level', amountPHP: null, description: 'room-level · amount via CSV' },
      { id: 'wifi',        name: 'Wi-Fi Fee',   type: 'fixed',     scope: 'room-fixed', amountPHP: 200,  description: 'room-fixed · ₱200/mo · split ÷ occupants' },
    ],
    availableCharges: [],
  },
  {
    id: 'b-204', name: 'B-204', propertyId: 'sunset-apts', status: 'active',
    capacity: 2, monthlyRentPHP: 6500, rentMode: 'Room Total (Split)', notes: '',
    tenants: [
      { id: 't11', name: 'Nina Flores',  moveInLabel: 'Jul 2024' },
      { id: 't12', name: 'Gio Pascual',  moveInLabel: 'Jul 2024' },
    ],
    charges: [
      { id: 'water',       name: 'Water',       type: 'non-fixed', scope: 'room-level', amountPHP: null, description: 'room-level · amount via CSV' },
      { id: 'electricity', name: 'Electricity', type: 'non-fixed', scope: 'room-level', amountPHP: null, description: 'room-level · amount via CSV' },
    ],
    availableCharges: [{ id: 'wifi', name: 'Wi-Fi Fee' }],
  },
]

/* Extended series for range toggle — 12 months ending Mar 2026 */
export const ALL_COLLECTION_MONTHS = [
  { month: 'Apr', year: 2025, billed: 48000, collected: 44000, isCurrent: false },
  { month: 'May', year: 2025, billed: 51000, collected: 48000, isCurrent: false },
  { month: 'Jun', year: 2025, billed: 53000, collected: 51000, isCurrent: false },
  { month: 'Jul', year: 2025, billed: 50000, collected: 47000, isCurrent: false },
  { month: 'Aug', year: 2025, billed: 52000, collected: 50000, isCurrent: false },
  { month: 'Sep', year: 2025, billed: 54000, collected: 52000, isCurrent: false },
  ...MOCK_DASHBOARD.collections.series,
]
