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
 * The apiClient baseURL is the API root (/api), so v2 endpoints are addressed
 * at /nts/v1/dashboard/* (full URL: /api/nts/v1/dashboard/*).
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
      '/nts/v1/dashboard/stats',
      { params: buildParams(params) }
    );
    return response.data;
  },

  getTiffinTrend: async (params?: DashboardQueryParams) => {
    const response = await apiClient.get<ApiResponse<TiffinTrendItem[]>>(
      '/nts/v1/dashboard/tiffin-trend',
      { params: buildParams(params) }
    );
    return response.data;
  },

  getRevenueExpense: async (params?: DashboardQueryParams) => {
    const response = await apiClient.get<ApiResponse<RevenueExpenseItem[]>>(
      '/nts/v1/dashboard/revenue-expense',
      { params: buildParams(params) }
    );
    return response.data;
  },

  getExpenseCategories: async (params?: DashboardQueryParams) => {
    const response = await apiClient.get<ApiResponse<ExpenseCategoryItem[]>>(
      '/nts/v1/dashboard/expense-categories',
      { params: buildParams(params) }
    );
    return response.data;
  },

  getRecentTiffins: async (params?: DashboardQueryParams & { limit?: number }) => {
    const p = { ...buildParams(params), ...(params?.limit ? { limit: String(params.limit) } : {}) };
    const response = await apiClient.get<ApiResponse<RecentTiffinItem[]>>(
      '/nts/v1/dashboard/recent-tiffins',
      { params: p }
    );
    return response.data;
  },

  getRecentExpenses: async (params?: DashboardQueryParams & { limit?: number }) => {
    const p = { ...buildParams(params), ...(params?.limit ? { limit: String(params.limit) } : {}) };
    const response = await apiClient.get<ApiResponse<RecentExpenseItem[]>>(
      '/nts/v1/dashboard/recent-expenses',
      { params: p }
    );
    return response.data;
  },

  getPendingPayments: async () => {
    const response = await apiClient.get<ApiResponse<PendingPaymentItem[]>>(
      '/nts/v1/dashboard/pending-payments'
    );
    return response.data;
  },

  getTopCustomers: async (params?: DashboardQueryParams) => {
    const response = await apiClient.get<ApiResponse<TopCustomerItem[]>>(
      '/nts/v1/dashboard/top-customers',
      { params: buildParams(params) }
    );
    return response.data;
  },

  getMonthSummary: async () => {
    const response = await apiClient.get<ApiResponse<MonthSummary>>(
      '/nts/v1/dashboard/month-summary'
    );
    return response.data;
  },
};
