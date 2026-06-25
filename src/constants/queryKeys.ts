import type { DashboardQueryParams } from "@/types/api.types";

export const QUERY_KEYS = {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  session: ['session'] as const,

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    all: ['dashboard'] as const,
    stats: (params?: DashboardQueryParams) => [...QUERY_KEYS.dashboard.all, 'stats', params] as const,
    tiffinTrend: (params?: DashboardQueryParams) => [...QUERY_KEYS.dashboard.all, 'tiffin-trend', params] as const,
    revenueExpense: (params?: DashboardQueryParams) => [...QUERY_KEYS.dashboard.all, 'revenue-expense', params] as const,
    expenseCategories: (params?: DashboardQueryParams) => [...QUERY_KEYS.dashboard.all, 'expense-categories', params] as const,
    recentTiffins: (params?: DashboardQueryParams) => [...QUERY_KEYS.dashboard.all, 'recent-tiffins', params] as const,
    recentExpenses: (params?: DashboardQueryParams) => [...QUERY_KEYS.dashboard.all, 'recent-expenses', params] as const,
    pendingPayments: () => [...QUERY_KEYS.dashboard.all, 'pending-payments'] as const,
    topCustomers: (params?: DashboardQueryParams) => [...QUERY_KEYS.dashboard.all, 'top-customers', params] as const,
    // v2
    monthSummary: () => [...QUERY_KEYS.dashboard.all, 'month-summary'] as const,
    v2Stats: (params?: object) => [...QUERY_KEYS.dashboard.all, 'v2', 'stats', params] as const,
    v2TiffinTrend: (params?: object) => [...QUERY_KEYS.dashboard.all, 'v2', 'tiffin-trend', params] as const,
    v2RevenueExpense: (params?: object) => [...QUERY_KEYS.dashboard.all, 'v2', 'revenue-expense', params] as const,
  },

  // ─── Customers ─────────────────────────────────────────────────────────────
  customers: {
    all: ['customers'] as const,

    lists: () => [...QUERY_KEYS.customers.all, 'list'] as const,
    list: (params?: object) =>
      [...QUERY_KEYS.customers.lists(), params] as const,

    details: () => [...QUERY_KEYS.customers.all, 'detail'] as const,
    detail: (id: string) =>
      [...QUERY_KEYS.customers.details(), id] as const,

    stats: () => [...QUERY_KEYS.customers.all, 'stats'] as const,

    paymentSummary: (id: string) =>
      [...QUERY_KEYS.customers.all, 'payment-summary', id] as const,
  },

  // ─── Tiffin Entries ────────────────────────────────────────────────────────
  dailyEntries: {
    all: ['daily-entries'] as const,
    byDate: (date: string) => [...QUERY_KEYS.dailyEntries.all, 'by-date', date] as const,
    preview: (date: string, fromDate?: string) =>
      [...QUERY_KEYS.dailyEntries.all, 'preview', date, fromDate] as const,
  },

  // ─── Payments ──────────────────────────────────────────────────────────────
  payments: {
    all: ['payments'] as const,
    list: (params?: object) => ['payments', 'list', params] as const,
    detail: (id: string) => ['payments', 'detail', id] as const,
    stats: () => ['payments', 'stats'] as const,
    customerSummary: (customerId: string) => ['payments', 'customer-summary', customerId] as const,
    monthlyReport: (params?: object) => ['payments', 'monthly-report', params] as const,
    grouped: (params?: object) => ['payments', 'grouped', params] as const,
  },

  // ─── Expenses ──────────────────────────────────────────────────────────────
  expenses: {
    all: ['expenses'] as const,
    list: (params?: object) => ['expenses', 'list', params] as const,
    detail: (id: string) => ['expenses', 'detail', id] as const,
    stats: (params?: object) => ['expenses', 'stats', params] as const,
  },

  // ─── Vendors ───────────────────────────────────────────────────────────────
  vendors: {
    all: ['vendors'] as const,
    list: (params?: object) => ['vendors', 'list', params] as const,
    detail: (id: string) => ['vendors', 'detail', id] as const,
  },

  // ─── Reports & Closing ─────────────────────────────────────────────────────
  reports: {
    monthly: (params?: object) => ['reports', 'monthly', params] as const,
  },
  closing: {
    monthSummary: () => ['closing', 'month-summary'] as const,
  },

  // ─── Settings ──────────────────────────────────────────────────────────────
  settings: {
    profile: () => ['settings', 'profile'] as const,
  },
} as const;
