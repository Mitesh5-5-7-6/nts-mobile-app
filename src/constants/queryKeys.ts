export const QUERY_KEYS = {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  session: ['session'] as const,

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => ['dashboard', 'stats'] as const,
    tiffinTrend: () => ['dashboard', 'tiffin-trend'] as const,
    revenueExpense: () => ['dashboard', 'revenue-expense'] as const,
    expenseCategories: () => ['dashboard', 'expense-categories'] as const,
    recentTiffins: () => ['dashboard', 'recent-tiffins'] as const,
    recentExpenses: () => ['dashboard', 'recent-expenses'] as const,
    pendingPayments: () => ['dashboard', 'pending-payments'] as const,
    topCustomers: () => ['dashboard', 'top-customers'] as const,
    // v2
    monthSummary: () => ['dashboard', 'month-summary'] as const,
    v2Stats: (params?: object) => ['dashboard', 'v2', 'stats', params] as const,
    v2TiffinTrend: (params?: object) => ['dashboard', 'v2', 'tiffin-trend', params] as const,
    v2RevenueExpense: (params?: object) => ['dashboard', 'v2', 'revenue-expense', params] as const,
  },

  // ─── Customers ─────────────────────────────────────────────────────────────
  customers: {
    all: ['customers'] as const,
    list: (params?: object) => ['customers', 'list', params] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
    stats: () => ['customers', 'stats'] as const,
  },

  // ─── Tiffin Entries ────────────────────────────────────────────────────────
  dailyEntries: {
    all: ['daily-entries'] as const,
    byDate: (date: string) => ['daily-entries', date] as const,
    preview: (params: object) => ['daily-entries', 'preview', params] as const,
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
