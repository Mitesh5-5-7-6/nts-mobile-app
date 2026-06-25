import { QUERY_KEYS } from '@/constants/queryKeys';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '../../services/analytics/analytics';
import { AnalyticsEventNames } from '../../services/analytics/events';
import { ExpenseService } from '../../services/api/expense.service';
import type {
  CreateExpensePayload,
  ExpenseListParams,
  ExpenseStatsParams,
  UpdateExpensePayload,
} from '../../types/api.types';

const PAGE_LIMIT = 15;

export const useExpenseList = (params: Omit<ExpenseListParams, 'page' | 'limit'>) => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.expenses.list({
      search: params.search,
      category: params.category,
      status: params.status,
      payment_method: params.payment_method,
      start_date: params.start_date,
      end_date: params.end_date,
    }),
    queryFn: ({ pageParam = 1 }) =>
      ExpenseService.getAll({ ...params, page: pageParam, limit: PAGE_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (meta && meta.page < meta.totalPages) return meta.page + 1;
      return undefined;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useExpenseStats = (params?: ExpenseStatsParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.expenses.stats(params),
    queryFn: () => ExpenseService.getStats(params),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 2,
  });
};

export const useExpenseDetail = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.expenses.detail(id),
    queryFn: () => ExpenseService.getById(id),
    select: (res) => res.data,
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

const invalidateExpenseViews = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses.all });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpensePayload) => ExpenseService.create(data),
    onSuccess: (_data, variables) => {
      invalidateExpenseViews(queryClient);
      analyticsService.trackEvent(AnalyticsEventNames.EXPENSE_ADDED, {
        amount: variables.amount,
        category: variables.expense_category?.[0],
      });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpensePayload }) =>
      ExpenseService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses.detail(variables.id) });
      invalidateExpenseViews(queryClient);
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ExpenseService.delete(id),
    onSuccess: () => invalidateExpenseViews(queryClient),
  });
};
