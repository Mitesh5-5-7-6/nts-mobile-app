import { QUERY_KEYS } from '@/constants/queryKeys';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '../../services/analytics/analytics';
import { AnalyticsEventNames } from '../../services/analytics/events';
import { CustomerService } from '../../services/api/customer.service';
import type {
  CreateCustomerPayload,
  UpdateCustomerPayload
} from '../../types/api.types';

// export const customerKeys = {
//   all: ['customers'] as const,
//   lists: () => [...customerKeys.all, 'list'] as const,
//   list: (filters: Record<string, any>) => [...customerKeys.lists(), filters] as const,
//   details: () => [...customerKeys.all, 'detail'] as const,
//   detail: (id: string) => [...customerKeys.details(), id] as const,
//   stats: () => [...customerKeys.all, 'stats'] as const,
//   paymentSummary: (id: string) => [...customerKeys.all, 'payment-summary', id] as const,
// };

export const useCustomerList = (params: { search?: string; limit?: number }) => {
  const limit = params.limit || 20;
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.customers.list({ search: params.search }),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await CustomerService.getAll({
        page: pageParam,
        limit,
        search: params.search || undefined,
      });
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (meta && meta.page < meta.totalPages) {
        return meta.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCustomerDetail = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.customers.detail(id),
    queryFn: () => CustomerService.getById(id),
    select: (res) => res.data,
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCustomerStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.customers.stats(),
    queryFn: () => CustomerService.getStats(),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCustomerPaymentSummary = (customerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.customers.paymentSummary(customerId),
    queryFn: () => CustomerService.getPaymentSummary(customerId),
    select: (res) => res.data,
    enabled: !!customerId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerPayload) => CustomerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.stats() });
      analyticsService.trackEvent(AnalyticsEventNames.CUSTOMER_CREATED);
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerPayload }) =>
      CustomerService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.lists() });
      analyticsService.trackEvent(AnalyticsEventNames.CUSTOMER_UPDATED);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CustomerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.stats() });
    },
  });
};
