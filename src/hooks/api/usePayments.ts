import { QUERY_KEYS } from '@/constants/queryKeys';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { analyticsService } from '../../services/analytics/analytics';
import { AnalyticsEventNames } from '../../services/analytics/events';
import { PaymentService } from '../../services/api/payment.service';
import type {
  ApiResponse,
  CreatePaymentPayload,
  GenerateBillPayload,
  GroupedEntryStatus,
  GroupedPaymentCustomer,
  GroupedPaymentEntry,
  GroupedPaymentsParams,
  GroupedPaymentsResult,
  PaginationMeta,
  UpdateEntryStatusPayload,
} from '../../types/api.types';

type GroupedPage = ApiResponse<GroupedPaymentsResult> & { meta: PaginationMeta };

const PAGE_LIMIT = 20;

// ─── Reads ────────────────────────────────────────────────────────────────

export const useGroupedPayments = (params: GroupedPaymentsParams) => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.payments.grouped({
      startDate: params.startDate,
      endDate: params.endDate,
      status: params.status,
      search: params.search,
      customerId: params.customerId,
    }),
    queryFn: ({ pageParam = 1 }) =>
      PaymentService.getGrouped({ ...params, page: pageParam, limit: params.limit ?? PAGE_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (meta && meta.page < meta.totalPages) return meta.page + 1;
      return undefined;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const usePaymentStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.payments.stats(),
    queryFn: () => PaymentService.getStats(),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 2,
  });
};

// ─── Pure recompute helpers (keep optimistic cache consistent) ─────────────

const recomputeEntry = (entry: GroupedPaymentEntry): GroupedPaymentEntry => {
  const total = entry.morningQty * entry.morningPrice + entry.eveningQty * entry.eveningPrice;
  const paid =
    (entry.morningPaid ? entry.morningQty * entry.morningPrice : 0) +
    (entry.eveningPaid ? entry.eveningQty * entry.eveningPrice : 0);
  const status: GroupedEntryStatus = paid <= 0 ? 'PENDING' : paid >= total ? 'PAID' : 'PARTIAL';
  return { ...entry, totalAmount: total, paidAmount: paid, pendingAmount: Math.max(0, total - paid), status };
};

const recomputeCustomer = (customer: GroupedPaymentCustomer): GroupedPaymentCustomer => {
  const totalPaid = customer.entries.reduce((s, e) => s + e.paidAmount, 0);
  const totalPending = customer.entries.reduce((s, e) => s + e.pendingAmount, 0);
  const status: GroupedEntryStatus =
    totalPaid <= 0 ? 'PENDING' : totalPending <= 0 ? 'PAID' : 'PARTIAL';
  return { ...customer, totalPaid, totalPending, status };
};

const applyEntryEdit = (
  pages: GroupedPage[],
  entryId: string,
  patch: Partial<Pick<GroupedPaymentEntry, 'morningPaid' | 'eveningPaid'>>,
): GroupedPage[] =>
  pages.map((page) => {
    if (!page.data) return page;
    let touched = false;
    const customers = page.data.customers.map((customer) => {
      const idx = customer.entries.findIndex((e) => e.entryId === entryId);
      if (idx < 0) return customer;
      touched = true;
      const entries = [...customer.entries];
      entries[idx] = recomputeEntry({ ...entries[idx], ...patch });
      return recomputeCustomer({ ...customer, entries });
    });
    if (!touched) return page;
    const summary = {
      totalCustomers: page.data.summary.totalCustomers,
      totalAmount: customers.reduce((s, c) => s + c.totalAmount, 0),
      totalPaid: customers.reduce((s, c) => s + c.totalPaid, 0),
      totalPending: customers.reduce((s, c) => s + c.totalPending, 0),
    };
    return { ...page, data: { customers, summary } };
  });

// ─── Mutations ──────────────────────────────────────────────────────────────

/**
 * Toggle morning/evening paid status on a tiffin entry, with an optimistic
 * update across every cached grouped-payments page.
 */
export const useUpdateEntryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId, data }: { entryId: string; data: UpdateEntryStatusPayload }) =>
      PaymentService.updateEntryStatus(entryId, data),

    onMutate: async ({ entryId, data }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.payments.all });

      const snapshots = queryClient.getQueriesData<InfiniteData<GroupedPage>>({
        queryKey: ['payments', 'grouped'],
      });

      const patch: Partial<Pick<GroupedPaymentEntry, 'morningPaid' | 'eveningPaid'>> = {};
      if (data.morningStatus) patch.morningPaid = data.morningStatus === 'PAID';
      if (data.eveningStatus) patch.eveningPaid = data.eveningStatus === 'PAID';

      for (const [key, value] of snapshots) {
        if (!value) continue;
        queryClient.setQueryData<InfiniteData<GroupedPage>>(key, {
          ...value,
          pages: applyEntryEdit(value.pages, entryId, patch),
        });
      }

      return { snapshots };
    },

    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },

    onSuccess: () => {
      analyticsService.trackEvent(AnalyticsEventNames.PAYMENT_RECORDED);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.all });
    },
  });
};

/** Record a classic billing-period collection (supports partial payments). */
export const useRecordPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentPayload) => PaymentService.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customers.paymentSummary(variables.customer_id),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.stats() });
      analyticsService.trackEvent(AnalyticsEventNames.PAYMENT_RECORDED, {
        customer_id: variables.customer_id,
        amount: variables.paid_amount,
      });
    },
  });
};

/** Calculate a bill for a customer over a date range (used to prefill collections). */
export const useGenerateBill = () => {
  return useMutation({
    mutationFn: (data: GenerateBillPayload) => PaymentService.generateBill(data),
  });
};
