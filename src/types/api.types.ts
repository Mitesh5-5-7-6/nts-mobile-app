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

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque';
export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'advance';

export interface Payment {
  _id: string;
  customer_id: string;
  payment_date: string;
  billing_start_date: string;
  billing_end_date: string;
  total_bill_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  reference_number?: string;
  notes?: string;
  collected_by?: string;
  /** Embedded by list endpoints. */
  customer?: { full_name: string; phone: string; address?: string };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStats {
  total_collected: number;
  total_pending: number;
  partial_count: number;
  advance_balance: number;
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus;
  start_date?: string;
  end_date?: string;
  customer_id?: string;
}

export interface CreatePaymentPayload {
  customer_id: string;
  payment_date: string;
  billing_start_date: string;
  billing_end_date: string;
  total_bill_amount: number;
  paid_amount: number;
  payment_method: PaymentMethod;
  reference_number?: string;
  notes?: string;
  collected_by?: string;
}

export type UpdatePaymentPayload = Partial<
  Pick<
    CreatePaymentPayload,
    'paid_amount' | 'payment_method' | 'payment_date' | 'reference_number' | 'notes' | 'collected_by'
  >
>;

export interface GenerateBillPayload {
  customer_id: string;
  billing_start_date: string;
  billing_end_date: string;
}

export interface GeneratedBill {
  customer_id: string;
  customer_name: string;
  billing_start_date: string;
  billing_end_date: string;
  total_entries: number;
  total_amount: number;
  previous_pending: number;
  advance_deduction: number;
  final_payable: number;
}

// ─── Grouped Payments (NTS v1) ─────────────────────────────────────────────
// Tiffin-entry-based payment system. Drives the customer-grouped ledger screen.

export type GroupedEntryStatus = 'PAID' | 'PARTIAL' | 'PENDING';

export interface GroupedPaymentEntry {
  entryId: string;
  date: string;
  morningQty: number;
  morningPrice: number;
  morningPaid: boolean;
  eveningQty: number;
  eveningPrice: number;
  eveningPaid: boolean;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: GroupedEntryStatus;
}

export interface GroupedPaymentCustomer {
  customerId: string;
  customerName: string;
  phone: string;
  address: string;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  entryCount: number;
  status: GroupedEntryStatus;
  entries: GroupedPaymentEntry[];
}

export interface GroupedPaymentsSummary {
  totalCustomers: number;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
}

export interface GroupedPaymentsResult {
  customers: GroupedPaymentCustomer[];
  summary: GroupedPaymentsSummary;
}

export interface GroupedPaymentsParams {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  status?: GroupedEntryStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export type PaymentTarget = 'MORNING' | 'EVENING' | 'FULL_DAY';

export interface RecordEntryPaymentPayload {
  customerId: string;
  tiffinEntryId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentFor: PaymentTarget;
  notes?: string;
}

export interface UpdateEntryStatusPayload {
  morningStatus?: 'PAID' | 'PENDING';
  eveningStatus?: 'PAID' | 'PENDING';
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface UpdateEntryStatusResult {
  entryId: string;
  morning_paid: boolean;
  evening_paid: boolean;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: GroupedEntryStatus;
}

// ─── Expenses ──────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'RAW_MATERIAL'
  | 'VEGETABLES'
  | 'MILK'
  | 'GAS'
  | 'SALARY'
  | 'DELIVERY'
  | 'TRANSPORT'
  | 'RENT'
  | 'ELECTRICITY'
  | 'INTERNET'
  | 'PACKAGING'
  | 'MARKETING'
  | 'MAINTENANCE'
  | 'SOFTWARE'
  | 'MISC';

export type ExpensePaymentMethod = PaymentMethod | 'credit';
export type ExpenseStatusValue = 'PENDING' | 'PAID' | 'PARTIAL' | 'CANCELLED';
export type RecurringType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Expense {
  _id: string;
  expense_code: string;
  title: string;
  description?: string;
  expense_category: ExpenseCategory[];
  expense_subcategory?: string[];
  expense_date: string;
  amount: number;
  payment_method: ExpensePaymentMethod;
  vendor_id?: string;
  vendor_name?: string;
  invoice_number?: string;
  receipt_url?: string;
  is_recurring: boolean;
  recurring_type?: RecurringType;
  expense_status: ExpenseStatusValue;
  paid_by?: string;
  notes?: string;
  created_by?: string;
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: ExpenseCategory;
  status?: ExpenseStatusValue;
  payment_method?: ExpensePaymentMethod;
  start_date?: string;
  end_date?: string;
  vendor_id?: string;
  is_recurring?: 'true' | 'false';
}

export interface CreateExpensePayload {
  title: string;
  description?: string;
  expense_category: ExpenseCategory[];
  expense_subcategory?: string[];
  expense_date: string;
  amount: number;
  payment_method: ExpensePaymentMethod;
  vendor_id?: string;
  vendor_name?: string;
  invoice_number?: string;
  receipt_url?: string;
  is_recurring?: boolean;
  recurring_type?: RecurringType;
  expense_status?: ExpenseStatusValue;
  paid_by?: string;
  notes?: string;
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface PaymentMethodBreakdownItem {
  method: string;
  amount: number;
  percentage: number;
}

export interface ExpenseStats {
  total_expense: number;
  daily_average: number;
  total_transactions: number;
  top_category: CategoryBreakdownItem | null;
  prev_total_expense: number;
  prev_total_transactions: number;
  today_expense: number;
  monthly_expense: number;
  pending_vendor_payments: number;
  category_breakdown: CategoryBreakdownItem[];
  payment_method_breakdown: PaymentMethodBreakdownItem[];
  recent_expenses: Expense[];
  start_date: string;
  end_date: string;
  days_in_period: number;
}

export interface ExpenseStatsParams {
  start_date?: string;
  end_date?: string;
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
