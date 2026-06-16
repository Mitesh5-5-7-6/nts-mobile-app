// ─── Standard Response Envelope ────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: null | {
    code: string;
    details?: Record<string, string[]>;
  };
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Customer ──────────────────────────────────────────────────────────────

export interface TiffinDefaults {
  morning: boolean;
  morning_qty: number;
  morning_price: number;
  evening: boolean;
  evening_qty: number;
  evening_price: number;
}

export interface Customer {
  _id: string;
  full_name: string;
  phone: string;
  address?: string;
  notes?: string;
  is_active: boolean;
  tiffin_defaults: TiffinDefaults;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  outstanding: number;
}

export interface CreateCustomerPayload {
  full_name: string;
  phone: string;
  address?: string;
  notes?: string;
  tiffin_defaults: TiffinDefaults;
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

// ─── Tiffin Entry ──────────────────────────────────────────────────────────

export interface TiffinEntry {
  _id: string;
  customer_id: string;
  entry_date: string;
  morning_qty: number;
  morning_price: number;
  morning_paid: boolean;
  evening_qty: number;
  evening_price: number;
  evening_paid: boolean;
  total_qty: number;
  total_amount: number;
  is_manual_price?: boolean;
  notes?: string;
  created_by?: string;
  customer?: {
    full_name: string;
    phone: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TiffinEntryPreview {
  customer_id: string;
  name: string;
  address: string;
  morning: boolean;
  morning_qty: number;
  morning_price: number;
  morning_paid: boolean;
  evening: boolean;
  evening_qty: number;
  evening_price: number;
  evening_paid: boolean;
  has_existing_entry: boolean;
}

export interface BulkEntryItem {
  customer_id: string;
  morning_qty: number;
  morning_price: number;
  evening_qty: number;
  evening_price: number;
  is_manual_price?: boolean;
  morning_paid?: boolean;
  evening_paid?: boolean;
  notes?: string;
}

export interface BulkEntryPayload {
  entry_date: string;
  entries: BulkEntryItem[];
}

export interface BulkEntryResult {
  inserted: number;
  updated: number;
  total: number;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  todayTiffin: { total: number; morning: number; evening: number; vsYesterday: number };
  todayRevenue: { amount: number; vsYesterday: number };
  todayExpense: { amount: number; vsYesterday: number };
  todayProfit: { amount: number; vsYesterday: number };
  pendingPayments: { amount: number; customerCount: number };
}

export interface TiffinTrendItem {
  date: string;
  iso?: string;
  morning: number;
  evening: number;
}

export interface RevenueExpenseItem {
  date: string;
  iso?: string;
  revenue: number;
  expense: number;
}

export interface ExpenseCategoryItem {
  category: string;
  amount: number;
}

export interface RecentTiffinItem {
  id: string;
  date: string;
  customer: string;
  morning: number;
  evening: number;
  total: number;
  amount: number;
}

export interface RecentExpenseItem {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface PendingPaymentItem {
  id: string;
  customer: string;
  avatar: string;
  pendingAmount: number;
  lastPayment: string;
  daysOverdue: number;
}

export interface TopCustomerItem {
  rank: number;
  name: string;
  avatar: string;
  totalTiffins: number;
  totalAmount: number;
}

export interface MonthSummary {
  tiffins: { total: number; avgPerDay: number; vsLastMonth: number };
  revenue: { amount: number; vsLastMonth: number };
  expense: { amount: number; vsLastMonth: number };
  profit: { amount: number; vsLastMonth: number };
  activeCustomers: number;
  activeDays: number;
}

export type DashboardRange = 'DAY' | 'WEEK' | 'MONTH';

export interface DashboardQueryParams {
  fromDate?: string;
  toDate?: string;
  range?: DashboardRange;
}

// ─── Payment (for reference in customer details) ───────────────────────────

export interface CustomerPaymentSummary {
  customer_id: string;
  full_name: string;
  phone: string;
  address: string;
  total_bill: number;
  total_paid: number;
  outstanding: number;
  advance_balance: number;
  payments: Payment[];
}

export interface Payment {
  _id: string;
  customer_id: string;
  payment_date: string;
  billing_start_date: string;
  billing_end_date: string;
  total_bill_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_method: 'cash' | 'upi' | 'bank_transfer' | 'cheque';
  payment_status: 'pending' | 'partial' | 'completed' | 'advance';
  reference_number?: string;
  notes?: string;
  collected_by?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Sync Queue ────────────────────────────────────────────────────────────

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface SyncQueueItem {
  id: string;
  type: 'TIFFIN_BULK_SAVE';
  payload: any;
  timestamp: number;
  retryCount: number;
  status: SyncStatus;
  errorMessage?: string;
}
