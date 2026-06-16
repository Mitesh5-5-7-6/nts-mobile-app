import apiClient from './client';
import type {
  ApiResponse,
  DashboardStats,
  TiffinTrendItem,
  RevenueExpenseItem,
  ExpenseCategoryItem,
  RecentTiffinItem,
  RecentExpenseItem,
  PendingPaymentItem,
  TopCustomerItem,
  MonthSummary,
  DashboardQueryParams,
} from '../../types/api.types';

/**
 * Dashboard v2 API — NTS v1 endpoints.
 * These endpoints respect flexible date ranges via fromDate/toDate/range.
 *
 * NOTE: The apiClient baseURL is /api/nts/v1, but the legacy dashboard endpoints
 * live at /api/dashboard/*. The v2 endpoints live at /api/nts/v1/dashboard/*.
 * Since our baseURL already points to /api/nts/v1, we use relative paths to /dashboard/*.
 */
const buildParams = (params?: DashboardQueryParams) => {
  if (!params) return {};
  const p: Record<string, string> = {};
  if (params.fromDate) p.fromDate = params.fromDate;
  if (params.toDate) p.toDate = params.toDate;
  if (params.range) p.range = params.range;
  return p;
};

export const DashboardService = {
  getStats: async (params?: DashboardQueryParams) => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      '/dashboard/stats',
      { params: buildParams(params) }
    );
    return response.data;
  },

  getTiffinTrend: async (params?: DashboardQueryParams) => {
    const response = await apiClient.get<ApiResponse<TiffinTrendItem[]>>(
      '/dashboard/tiffin-trend',
      { params: buildParams(params) }
    );
    return response.data;
  },

  getRevenueExpense: async (params?: DashboardQueryParams) => {
    const response = await apiClient.get<ApiResponse<RevenueExpenseItem[]>>(
      '/dashboard/revenue-expense',
      { params: buildParams(params) }
    );
    return response.data;
  },

  getExpenseCategories: async (params?: DashboardQueryParams) => {
    const response = await apiClient.get<ApiResponse<ExpenseCategoryItem[]>>(
      '/dashboard/expense-categories',
      { params: buildParams(params) }
    );
    return response.data;
  },

  getRecentTiffins: async (params?: DashboardQueryParams & { limit?: number }) => {
    const p = { ...buildParams(params), ...(params?.limit ? { limit: String(params.limit) } : {}) };
    const response = await apiClient.get<ApiResponse<RecentTiffinItem[]>>(
      '/dashboard/recent-tiffins',
      { params: p }
    );
    return response.data;
  },

  getRecentExpenses: async (params?: DashboardQueryParams & { limit?: number }) => {
    const p = { ...buildParams(params), ...(params?.limit ? { limit: String(params.limit) } : {}) };
    const response = await apiClient.get<ApiResponse<RecentExpenseItem[]>>(
      '/dashboard/recent-expenses',
      { params: p }
    );
    return response.data;
  },

  getPendingPayments: async () => {
    const response = await apiClient.get<ApiResponse<PendingPaymentItem[]>>(
      '/dashboard/pending-payments'
    );
    return response.data;
  },

  getTopCustomers: async (params?: DashboardQueryParams) => {
    const response = await apiClient.get<ApiResponse<TopCustomerItem[]>>(
      '/dashboard/top-customers',
      { params: buildParams(params) }
    );
    return response.data;
  },

  getMonthSummary: async () => {
    const response = await apiClient.get<ApiResponse<MonthSummary>>(
      '/dashboard/month-summary'
    );
    return response.data;
  },
};
