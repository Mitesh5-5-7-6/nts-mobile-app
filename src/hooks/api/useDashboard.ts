import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '../../services/api/dashboard.service';
import type { DashboardQueryParams } from '../../types/api.types';

// export const dashboardKeys = {
//   all: ['dashboard'] as const,
//   stats: (params?: DashboardQueryParams) => [...dashboardKeys.all, 'stats', params] as const,
//   tiffinTrend: (params?: DashboardQueryParams) => [...dashboardKeys.all, 'tiffin-trend', params] as const,
//   revenueExpense: (params?: DashboardQueryParams) => [...dashboardKeys.all, 'revenue-expense', params] as const,
//   expenseCategories: (params?: DashboardQueryParams) => [...dashboardKeys.all, 'expense-categories', params] as const,
//   recentTiffins: (params?: DashboardQueryParams) => [...dashboardKeys.all, 'recent-tiffins', params] as const,
//   recentExpenses: (params?: DashboardQueryParams) => [...dashboardKeys.all, 'recent-expenses', params] as const,
//   pendingPayments: () => [...dashboardKeys.all, 'pending-payments'] as const,
//   topCustomers: (params?: DashboardQueryParams) => [...dashboardKeys.all, 'top-customers', params] as const,
//   monthSummary: () => [...dashboardKeys.all, 'month-summary'] as const,
// };

export const useDashboardStats = (params?: DashboardQueryParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.stats(params),
    queryFn: () => DashboardService.getStats(params),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useTiffinTrend = (params?: DashboardQueryParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.tiffinTrend(params),
    queryFn: () => DashboardService.getTiffinTrend(params),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRevenueExpense = (params?: DashboardQueryParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.revenueExpense(params),
    queryFn: () => DashboardService.getRevenueExpense(params),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5,
  });
};

export const useExpenseCategories = (params?: DashboardQueryParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.expenseCategories(params),
    queryFn: () => DashboardService.getExpenseCategories(params),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecentTiffins = (params?: DashboardQueryParams & { limit?: number }) => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.recentTiffins(params),
    queryFn: () => DashboardService.getRecentTiffins(params),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 2,
  });
};

export const useRecentExpenses = (params?: DashboardQueryParams & { limit?: number }) => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.recentExpenses(params),
    queryFn: () => DashboardService.getRecentExpenses(params),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 2,
  });
};

export const usePendingPayments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.pendingPayments(),
    queryFn: () => DashboardService.getPendingPayments(),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5,
  });
};

export const useTopCustomers = (params?: DashboardQueryParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.topCustomers(params),
    queryFn: () => DashboardService.getTopCustomers(params),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5,
  });
};

export const useMonthSummary = () => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.monthSummary(),
    queryFn: () => DashboardService.getMonthSummary(),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5,
  });
};
