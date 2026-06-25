import type {
  ApiResponse,
  CreateCustomerPayload,
  Customer,
  CustomerPaymentSummary,
  CustomerStats,
  PaginationMeta,
  UpdateCustomerPayload,
} from '../../types/api.types';
import apiClient from './client';

/**
 * Customer API endpoints.
 *
 * NOTE: The customer endpoints live at /api/customers (NOT under /api/nts/v1).
 * Since our apiClient baseURL is /api/nts/v1, we use a relative path hack:
 * '../../customers' resolves to /api/customers from /api/nts/v1.
 * Alternatively, we build the full URL. We'll use the latter for clarity.
 */
const BASE = '/customers';

export const CustomerService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get<ApiResponse<Customer[]> & { meta: PaginationMeta }>(
      BASE,
      { params }
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Customer>>(
      `${BASE}/${id}`
    );
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get<ApiResponse<CustomerStats>>(
      `${BASE}/stats`
    );
    return response.data;
  },

  create: async (data: CreateCustomerPayload) => {
    const response = await apiClient.post<ApiResponse<Customer>>(
      BASE,
      data
    );
    return response.data;
  },

  update: async (id: string, data: UpdateCustomerPayload) => {
    const response = await apiClient.patch<ApiResponse<Customer>>(
      `${BASE}/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${BASE}/${id}`
    );
    return response.data;
  },

  getPaymentSummary: async (customerId: string) => {
    const response = await apiClient.get<ApiResponse<CustomerPaymentSummary>>(
      `/payments/customer-summary/${customerId}`
    );
    return response.data;
  },
};
