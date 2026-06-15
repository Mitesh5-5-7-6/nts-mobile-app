// ============================================================================
// 1. Core Data Models / Entities (aligned with API_DOCUMENTATION.md Section 12)
// ============================================================================

import {
  ExpenseStatus,
  PaymentFor,
  PaymentMethod,
  PaymentParams,
  PaymentStatus,
  RecurringType,
} from "../constant";

export interface Customer {
  _id: string;
  full_name: string;
  phone: string;
  address?: string;
  notes?: string;
  is_active: boolean;
  tiffin_defaults: {
    morning: boolean;
    morning_qty: number;
    morning_price: number;
    evening: boolean;
    evening_qty: number;
    evening_price: number;
  };
  createdAt: string;
  updatedAt: string;
}

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
  is_manual_price: boolean;
  notes?: string;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
  // Embedded customer object in response (GET /api/tiffin-entries)
  customer?: {
    full_name: string;
    phone: string;
    address: string;
  };
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
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  reference_number?: string;
  notes?: string;
  collected_by?: string;
  createdAt: string;
  updatedAt: string;
  // Embedded customer info
  customer?: {
    full_name: string;
    phone: string;
    address: string;
  };
}

export interface Expense {
  _id: string;
  expense_code: string;
  title: string;
  description?: string;
  expense_category: string[];
  expense_subcategory?: string[];
  expense_date: string;
  amount: number;
  payment_method: PaymentMethod;
  vendor_id?: string;
  vendor_name?: string;
  invoice_number?: string;
  receipt_url?: string;
  is_recurring: boolean;
  recurring_type?: RecurringType;
  expense_status: ExpenseStatus;
  paid_by?: string;
  notes?: string;
  created_by?: string;
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  _id: string;
  vendor_code: string;
  name: string;
  phone?: string;
  alternate_phone?: string;
  address?: string;
  vendor_type: string;
  payment_terms?: string;
  is_active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 2. Standard Envelope and Pagination Envelope
// ============================================================================

export interface ApiResponseEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  error: {
    code: string;
    details?: Record<string, string[]>;
  } | null;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// 3. Request / Response Interfaces per Module
// ============================================================================

// --- Authentication ---
export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    sessionId: string;
  };
}

// --- Customers ---
export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateCustomerRequest {
  full_name: string;
  phone: string;
  address?: string;
  notes?: string;
  tiffin_defaults: {
    morning: boolean;
    morning_qty: number;
    morning_price: number;
    evening: boolean;
    evening_qty: number;
    evening_price: number;
  };
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  is_active?: boolean;
}

export interface CustomerStatsResponse {
  total: number;
  active: number;
  inactive: number;
  outstanding: number;
}

// --- Tiffin Entries ---
export interface GetTiffinEntriesParams {
  date: string; // YYYY-MM-DD
}

type Entry = {
  customer_id: string;
  morning_qty: number;
  morning_price: number;
  evening_qty: number;
  evening_price: number;
  is_manual_price?: boolean;
  morning_paid?: boolean;
  evening_paid?: boolean;
  notes?: string;
};

export interface BulkUpsertTiffinRequest {
  entry_date: string; // YYYY-MM-DD
  entries: Entry[];
}

export interface BulkUpsertTiffinResponse {
  inserted: number;
  updated: number;
  total: number;
}

export interface TiffinEntryPreviewParams {
  date: string; // Target date
  fromDate?: string; // Optional source date
}

export interface TiffinEntryPreviewResponse {
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

// --- Payments ---
export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus;
  start_date?: string;
  end_date?: string;
  customer_id?: string;
}

export interface CreatePaymentRequest {
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

export interface UpdatePaymentRequest {
  paid_amount?: number;
  payment_method?: PaymentMethod;
  payment_date?: string;
  reference_number?: string;
  notes?: string;
  collected_by?: string;
}

export interface PaymentStatsResponse {
  total_collected: number;
  total_pending: number;
  partial_count: number;
  advance_balance: number;
}

export interface CustomerFinancialSummaryResponse {
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

export interface MonthlyReportParams {
  year?: number;
  month?: number;
}

export interface MonthlyReportResponse {
  year: number;
  month: number;
  total_collected: number;
  total_pending: number;
  total_partial: number;
  advance_count: number;
  payment_count: number;
  customer_count: number;
  top_customers: {
    customer_id: string;
    full_name: string;
    paid: number;
  }[];
}

export interface GenerateBillRequest {
  customer_id: string;
  billing_start_date: string;
  billing_end_date: string;
}

export interface GenerateBillResponse {
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

// --- Grouped Payments (NTS v1) ---
export interface RecordNtsPaymentRequest {
  customerId: string;
  tiffinEntryId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentFor: PaymentFor;
  notes?: string;
}

export interface RecordNtsPaymentResponse {
  paymentId: string;
  entryId: string;
  syncedFlags: {
    morning_paid: boolean;
    evening_paid: boolean;
  };
}

export interface GetGroupedPaymentsParams {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  status?: PaymentParams;
  search?: string;
  page?: number;
  limit?: number;
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
  status: PaymentParams;
  entries: {
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
    status: PaymentParams;
  }[];
}

export interface GetGroupedPaymentsResponse {
  customers: GroupedPaymentCustomer[];
  summary: {
    totalCustomers: number;
    totalAmount: number;
    totalPaid: number;
    totalPending: number;
  };
}

export interface ToggleEntryStatusRequest {
  morningStatus?: "PAID" | "PENDING";
  eveningStatus?: "PAID" | "PENDING";
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface ToggleEntryStatusResponse {
  entryId: string;
  morning_paid: boolean;
  evening_paid: boolean;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: PaymentParams;
}

// --- Expenses ---
export interface GetExpensesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: ExpenseStatus;
  payment_method?: PaymentMethod;
  start_date?: string;
  end_date?: string;
  vendor_id?: string;
  is_recurring?: "true" | "false";
}

export interface CreateExpenseRequest {
  title: string;
  description?: string;
  expense_category: string[];
  expense_subcategory?: string[];
  expense_date: string;
  amount: number;
  payment_method: PaymentMethod;
  vendor_id?: string;
  vendor_name?: string;
  invoice_number?: string;
  receipt_url?: string;
  is_recurring?: boolean;
  recurring_type?: RecurringType;
  expense_status?: ExpenseStatus;
  paid_by?: string;
  notes?: string;
}

export type UpdateExpenseRequest = Partial<CreateExpenseRequest>;

export interface ExpenseStatsParams {
  start_date?: string;
  end_date?: string;
}

export interface ExpenseStatsResponse {
  total_expense: number;
  daily_average: number;
  total_transactions: number;
  top_category: {
    category: string;
    amount: number;
    percentage: number;
  };
  prev_total_expense: number;
  prev_total_transactions: number;
  today_expense: number;
  monthly_expense: number;
  pending_vendor_payments: number;
  category_breakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  payment_method_breakdown: {
    method: string;
    amount: number;
    percentage: number;
  }[];
  recent_expenses: Expense[];
  start_date: string;
  end_date: string;
  days_in_period: number;
}

// --- Vendors ---
export interface GetVendorsParams {
  page?: number;
  limit?: number;
  search?: string;
  vendor_type?: string;
  is_active?: "true" | "false";
}

export interface CreateVendorRequest {
  name: string;
  phone?: string;
  alternate_phone?: string;
  address?: string;
  vendor_type: string;
  payment_terms?: string;
  notes?: string;
}

export interface UpdateVendorRequest extends Partial<CreateVendorRequest> {
  is_active?: boolean;
}

// --- Dashboard (Legacy and v2) ---
export interface DashboardStatsResponse {
  todayTiffin: {
    total: number;
    morning: number;
    evening: number;
    vsYesterday: number;
  };
  todayRevenue: { amount: number; vsYesterday: number };
  todayExpense: { amount: number; vsYesterday: number };
  todayProfit: { amount: number; vsYesterday: number };
  pendingPayments: { amount: number; customerCount: number };
}

export interface TiffinTrendResponse {
  date: string;
  iso?: string;
  morning: number;
  evening: number;
}

export interface RevenueExpenseResponse {
  date: string;
  revenue: number;
  expense: number;
}

export interface ExpenseCategoriesResponse {
  category: string;
  amount: number;
}

export interface RecentTiffinResponse {
  id: string;
  date: string;
  customer: string;
  morning: number;
  evening: number;
  total: number;
  amount: number;
}

export interface RecentExpenseResponse {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface PendingPaymentResponse {
  id: string;
  customer: string;
  avatar: string;
  pendingAmount: number;
  lastPayment?: string;
  daysOverdue: number;
}

export interface TopCustomerResponse {
  rank: number;
  name: string;
  avatar: string;
  totalTiffins: number;
  totalAmount: number;
}

export interface DashboardV2Params {
  fromDate?: string;
  toDate?: string;
  range?: "DAY" | "WEEK" | "MONTH";
}

export interface MonthSummaryResponse {
  tiffins: { total: number; avgPerDay: number; vsLastMonth: number };
  revenue: { amount: number; vsLastMonth: number };
  expense: { amount: number; vsLastMonth: number };
  profit: { amount: number; vsLastMonth: number };
  activeCustomers: number;
  activeDays: number;
}

// --- Backup & Restore ---
export interface BackupResponse {
  filename: string;
  onedrive_path: string;
  web_url: string;
  size_bytes: number;
  collections: {
    customers: number;
    tiffinEntries: number;
    payments: number;
    expenses: number;
    vendors: number;
  };
  total_records: number;
  export_errors: Record<string, string>;
  duration_ms: number;
  generated_at: string;
}

export interface RestoreRequest {
  date: string; // YYYY-MM-DD
  collection?: string;
}

export interface RestoreResponse {
  restoreType: "single_collection" | "full";
  collectionName?: string;
  documentsRestored: number;
  duration_ms: number;
}
