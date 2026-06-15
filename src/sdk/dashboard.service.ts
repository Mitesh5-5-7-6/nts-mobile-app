import { apiClient, unwrap } from './client';
import './interceptors';
import type {
  DashboardStatsResponse,
  TiffinTrendResponse,
  RevenueExpenseResponse,
  ExpenseCategoriesResponse,
  RecentTiffinResponse,
  RecentExpenseResponse,
  PendingPaymentResponse,
  TopCustomerResponse,
  MonthSummaryResponse,
  DashboardV2Params,
  ApiResponseEnvelope,
} from '../types/api';

class DashboardService {
  // ─── Legacy Dashboard (/api/dashboard) ────────────────────────────────────

  /**
   * Day-over-day KPIs (always "today" context).
   * GET /api/dashboard/stats
   */
  async getStats(): Promise<DashboardStatsResponse> {
    const response = await apiClient.get<ApiResponseEnvelope<DashboardStatsResponse>>(
      '/dashboard/stats'
    );
    return unwrap(response.data);
  }

  /**
   * Last 7 days tiffin count by session.
   * GET /api/dashboard/tiffin-trend
   */
  async getTiffinTrend(): Promise<TiffinTrendResponse[]> {
    const response = await apiClient.get<ApiResponseEnvelope<TiffinTrendResponse[]>>(
      '/dashboard/tiffin-trend'
    );
    return unwrap(response.data);
  }

  /**
   * Last 7 days revenue vs expense.
   * GET /api/dashboard/revenue-expense
   */
  async getRevenueExpense(): Promise<RevenueExpenseResponse[]> {
    const response = await apiClient.get<ApiResponseEnvelope<RevenueExpenseResponse[]>>(
      '/dashboard/revenue-expense'
    );
    return unwrap(response.data);
  }

  /**
   * Current month expense breakdown by category.
   * GET /api/dashboard/expense-categories
   */
  async getExpenseCategories(): Promise<ExpenseCategoriesResponse[]> {
    const response = await apiClient.get<ApiResponseEnvelope<ExpenseCategoriesResponse[]>>(
      '/dashboard/expense-categories'
    );
    return unwrap(response.data);
  }

  /**
   * 10 most recent tiffin entries.
   * GET /api/dashboard/recent-tiffins
   */
  async getRecentTiffins(): Promise<RecentTiffinResponse[]> {
    const response = await apiClient.get<ApiResponseEnvelope<RecentTiffinResponse[]>>(
      '/dashboard/recent-tiffins'
    );
    return unwrap(response.data);
  }

  /**
   * 10 most recent expenses.
   * GET /api/dashboard/recent-expenses
   */
  async getRecentExpenses(): Promise<RecentExpenseResponse[]> {
    const response = await apiClient.get<ApiResponseEnvelope<RecentExpenseResponse[]>>(
      '/dashboard/recent-expenses'
    );
    return unwrap(response.data);
  }

  /**
   * Customers with outstanding balances.
   * GET /api/dashboard/pending-payments
   */
  async getPendingPayments(): Promise<PendingPaymentResponse[]> {
    const response = await apiClient.get<ApiResponseEnvelope<PendingPaymentResponse[]>>(
      '/dashboard/pending-payments'
    );
    return unwrap(response.data);
  }

  /**
   * Top 5 customers by tiffin amount this month.
   * GET /api/dashboard/top-customers
   */
  async getTopCustomers(): Promise<TopCustomerResponse[]> {
    const response = await apiClient.get<ApiResponseEnvelope<TopCustomerResponse[]>>(
      '/dashboard/top-customers'
    );
    return unwrap(response.data);
  }

  // ─── Dashboard v2 — NTS v1 (/api/nts/v1/dashboard) ────────────────────────

  /**
   * Enhanced stats respecting flexible date range.
   * GET /api/nts/v1/dashboard/stats
   */
  async getV2Stats(params?: DashboardV2Params): Promise<DashboardStatsResponse> {
    const response = await apiClient.get<ApiResponseEnvelope<DashboardStatsResponse>>(
      '/nts/v1/dashboard/stats',
      { params }
    );
    return unwrap(response.data);
  }

  /**
   * One data point per day in the requested range.
   * GET /api/nts/v1/dashboard/tiffin-trend
   */
  async getV2TiffinTrend(params?: DashboardV2Params): Promise<TiffinTrendResponse[]> {
    const response = await apiClient.get<ApiResponseEnvelope<TiffinTrendResponse[]>>(
      '/nts/v1/dashboard/tiffin-trend',
      { params }
    );
    return unwrap(response.data);
  }

  /**
   * Revenue (accrual) vs expense per day in range.
   * GET /api/nts/v1/dashboard/revenue-expense
   */
  async getV2RevenueExpense(params?: DashboardV2Params): Promise<RevenueExpenseResponse[]> {
    const response = await apiClient.get<ApiResponseEnvelope<RevenueExpenseResponse[]>>(
      '/nts/v1/dashboard/revenue-expense',
      { params }
    );
    return unwrap(response.data);
  }

  /**
   * Category breakdown for the requested date range.
   * GET /api/nts/v1/dashboard/expense-categories
   */
  async getV2ExpenseCategories(params?: DashboardV2Params): Promise<ExpenseCategoriesResponse[]> {
    const response = await apiClient.get<ApiResponseEnvelope<ExpenseCategoriesResponse[]>>(
      '/nts/v1/dashboard/expense-categories',
      { params }
    );
    return unwrap(response.data);
  }

  /**
   * Recent tiffin entries within the date range.
   * GET /api/nts/v1/dashboard/recent-tiffins
   */
  async getV2RecentTiffins(
    params?: DashboardV2Params & { limit?: number }
  ): Promise<RecentTiffinResponse[]> {
    const response = await apiClient.get<ApiResponseEnvelope<RecentTiffinResponse[]>>(
      '/nts/v1/dashboard/recent-tiffins',
      { params }
    );
    return unwrap(response.data);
  }

  /**
   * Recent expenses within the date range.
   * GET /api/nts/v1/dashboard/recent-expenses
   */
  async getV2RecentExpenses(
    params?: DashboardV2Params & { limit?: number }
  ): Promise<RecentExpenseResponse[]> {
    const response = await apiClient.get<ApiResponseEnvelope<RecentExpenseResponse[]>>(
      '/nts/v1/dashboard/recent-expenses',
      { params }
    );
    return unwrap(response.data);
  }

  /**
   * Customers with outstanding balances (no date filter).
   * GET /api/nts/v1/dashboard/pending-payments
   */
  async getV2PendingPayments(): Promise<PendingPaymentResponse[]> {
    const response = await apiClient.get<ApiResponseEnvelope<PendingPaymentResponse[]>>(
      '/nts/v1/dashboard/pending-payments'
    );
    return unwrap(response.data);
  }

  /**
   * Top 5 customers within the date range.
   * GET /api/nts/v1/dashboard/top-customers
   */
  async getV2TopCustomers(params?: DashboardV2Params): Promise<TopCustomerResponse[]> {
    const response = await apiClient.get<ApiResponseEnvelope<TopCustomerResponse[]>>(
      '/nts/v1/dashboard/top-customers',
      { params }
    );
    return unwrap(response.data);
  }

  /**
   * Current calendar month summary vs last month.
   * GET /api/nts/v1/dashboard/month-summary
   */
  async getMonthSummary(): Promise<MonthSummaryResponse> {
    const response = await apiClient.get<ApiResponseEnvelope<MonthSummaryResponse>>(
      '/nts/v1/dashboard/month-summary'
    );
    return unwrap(response.data);
  }
}

export const dashboardService = new DashboardService();
