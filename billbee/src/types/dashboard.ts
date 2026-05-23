export interface DashboardUser {
  name: string;
  email: string;
  avatarInitials: string;
}

export interface DashboardStats {
  properties:         { value: number; activeCount: number };
  rooms:              { value: number; occupied: number; vacant: number };
  activeTenants:      { value: number; deltaThisMonth: number };
  receiptsThisMonth:  { value: number; deltaVsLastMonth: number };
  draftBills:         { value: number };
  unpaidPosted:       { value: number; outstandingPHP: number };
  overdue:            { value: number; outstandingPHP: number; oldestDays: number };
  collectedThisMonth: { collectedPHP: number; billedPHP: number; percent: number };
}

export interface CollectionMonth {
  month: string;
  year: number;
  billed: number;
  collected: number;
  isCurrent: boolean;
}

export interface CollectionsData {
  range: '3M' | '6M' | '1Y';
  series: CollectionMonth[];
  aggregates: {
    collectedThisMonthPct: number;
    avgPct: number;
    totalCollectedPHP: number;
    updatedAt: string;
  };
}

export interface DashboardProps {
  user: DashboardUser;
  greeting: string;
  nextBilling: {
    propertyName: string;
    daysUntil: number;
    cycleUrl: string;
  } | null;
  stats: DashboardStats;
  collections: CollectionsData;
  notifications: { unreadCount: number };
}
