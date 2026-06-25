import type {
  ApiResponse,
  CreatePaymentPayload,
  GeneratedBill,
  GenerateBillPayload,
  GroupedPaymentsParams,
  GroupedPaymentsResult,
  PaginationMeta,
  Payment,
  PaymentListParams,
  PaymentStats,
  RecordEntryPaymentPayload,
  UpdateEntryStatusPayload,
  UpdateEntryStatusResult,
  UpdatePaymentPayload,
} from '../../types/api.types';
import apiClient from './client';

/**
 * Payment API endpoints.
 *
 * The backend exposes two payment systems:
 *  1. Classic billing-period payments at /api/payments — used for the customer
 *     ledger, collection recording and aggregate stats.
 *  2. Grouped tiffin-entry payments at /api/nts/v1/payments — drives the
 *     customer-grouped ledger screen and per-entry paid/pending toggling.
 *
 * apiClient baseURL is the API root (/api), so we address each accordingly.
 */
const BASE = '/payments';
const NTS_BASE = '/nts/v1/payments';

const buildListParams = (params?: PaymentListParams) => {
  if (!params) return {};
  const p: Record<string, string | number> = {};
  if (params.page) p.page = params.page;
  if (params.limit) p.limit = params.limit;
  if (params.search) p.search = params.search;
  if (params.status) p.status = params.status;
  if (params.start_date) p.start_date = params.start_date;
  if (params.end_date) p.end_date = params.end_date;
  if (params.customer_id) p.customer_id = params.customer_id;
  return p;
};

const buildGroupedParams = (params?: GroupedPaymentsParams) => {
  if (!params) return {};
  const p: Record<string, string | number> = {};
  if (params.startDate) p.startDate = params.startDate;
  if (params.endDate) p.endDate = params.endDate;
  if (params.customerId) p.customerId = params.customerId;
  if (params.status) p.status = params.status;
  if (params.search) p.search = params.search;
  if (params.page) p.page = params.page;
  if (params.limit) p.limit = params.limit;
  return p;
};

export const PaymentService = {
  // ─── Classic billing-period payments ──────────────────────────────────────
  getAll: async (params?: PaymentListParams) => {
    const response = await apiClient.get<ApiResponse<Payment[]> & { meta: PaginationMeta }>(
      BASE,
      { params: buildListParams(params) },
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Payment>>(`${BASE}/${id}`);
    return response.data;
  },

  create: async (data: CreatePaymentPayload) => {
    const response = await apiClient.post<ApiResponse<Payment>>(BASE, data);
    return response.data;
  },

  update: async (id: string, data: UpdatePaymentPayload) => {
    const response = await apiClient.patch<ApiResponse<Payment>>(`${BASE}/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`${BASE}/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get<ApiResponse<PaymentStats>>(`${BASE}/stats`);
    return response.data;
  },

  generateBill: async (data: GenerateBillPayload) => {
    const response = await apiClient.post<ApiResponse<GeneratedBill>>(`${BASE}/generate-bill`, data);
    return response.data;
  },

  // ─── Grouped tiffin-entry payments (NTS v1) ───────────────────────────────
  getGrouped: async (params?: GroupedPaymentsParams) => {
    const response = await apiClient.get<ApiResponse<GroupedPaymentsResult> & { meta: PaginationMeta }>(
      `${NTS_BASE}/grouped`,
      { params: buildGroupedParams(params) },
    );
    return response.data;
  },

  recordEntryPayment: async (data: RecordEntryPaymentPayload) => {
    const response = await apiClient.post<ApiResponse<{ paymentId: string; entryId: string; syncedFlags: { morning_paid: boolean; evening_paid: boolean } }>>(
      NTS_BASE,
      data,
    );
    return response.data;
  },

  updateEntryStatus: async (entryId: string, data: UpdateEntryStatusPayload) => {
    const response = await apiClient.patch<ApiResponse<UpdateEntryStatusResult>>(
      `${NTS_BASE}/${entryId}/status`,
      data,
    );
    return response.data;
  },
};

export default PaymentService;
