import type {
  ApiResponse,
  CreateExpensePayload,
  Expense,
  ExpenseListParams,
  ExpenseStats,
  ExpenseStatsParams,
  PaginationMeta,
  UpdateExpensePayload,
} from '../../types/api.types';
import apiClient from './client';

/**
 * Expense API endpoints (live at /api/expenses).
 * apiClient baseURL is the API root (/api).
 */
const BASE = '/expenses';

const buildListParams = (params?: ExpenseListParams) => {
  if (!params) return {};
  const p: Record<string, string | number> = {};
  if (params.page) p.page = params.page;
  if (params.limit) p.limit = params.limit;
  if (params.search) p.search = params.search;
  if (params.category) p.category = params.category;
  if (params.status) p.status = params.status;
  if (params.payment_method) p.payment_method = params.payment_method;
  if (params.start_date) p.start_date = params.start_date;
  if (params.end_date) p.end_date = params.end_date;
  if (params.vendor_id) p.vendor_id = params.vendor_id;
  if (params.is_recurring) p.is_recurring = params.is_recurring;
  return p;
};

export const ExpenseService = {
  getAll: async (params?: ExpenseListParams) => {
    const response = await apiClient.get<ApiResponse<Expense[]> & { meta: PaginationMeta }>(
      BASE,
      { params: buildListParams(params) },
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Expense>>(`${BASE}/${id}`);
    return response.data;
  },

  create: async (data: CreateExpensePayload) => {
    const response = await apiClient.post<ApiResponse<Expense>>(BASE, data);
    return response.data;
  },

  update: async (id: string, data: UpdateExpensePayload) => {
    const response = await apiClient.patch<ApiResponse<Expense>>(`${BASE}/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`${BASE}/${id}`);
    return response.data;
  },

  getStats: async (params?: ExpenseStatsParams) => {
    const p: Record<string, string> = {};
    if (params?.start_date) p.start_date = params.start_date;
    if (params?.end_date) p.end_date = params.end_date;
    const response = await apiClient.get<ApiResponse<ExpenseStats>>(`${BASE}/stats`, { params: p });
    return response.data;
  },
};

export default ExpenseService;
