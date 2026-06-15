import { apiClient, unwrap } from './client';
import './interceptors';
import type {
  Customer,
  CustomerStatsResponse,
  GetCustomersParams,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  ApiResponseEnvelope,
  PaginationMeta,
} from '../types/api';

interface PaginatedCustomers {
  data: Customer[];
  meta: PaginationMeta;
}

class CustomerService {
  /**
   * List active customers with search and pagination.
   * GET /api/customers
   */
  async getCustomers(params?: GetCustomersParams): Promise<PaginatedCustomers> {
    const response = await apiClient.get<PaginatedCustomers>('/customers', { params });
    return response.data;
  }

  /**
   * Fetch a single customer by ID.
   * GET /api/customers/:id
   */
  async getCustomerById(id: string): Promise<Customer> {
    const response = await apiClient.get<ApiResponseEnvelope<Customer>>(`/customers/${id}`);
    return unwrap(response.data);
  }

  /**
   * Create a new customer.
   * POST /api/customers
   */
  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    const response = await apiClient.post<ApiResponseEnvelope<Customer>>('/customers', data);
    return unwrap(response.data);
  }

  /**
   * Partially update a customer.
   * PATCH /api/customers/:id
   */
  async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<Customer> {
    const response = await apiClient.patch<ApiResponseEnvelope<Customer>>(`/customers/${id}`, data);
    return unwrap(response.data);
  }

  /**
   * Soft-delete a customer (sets is_active: false).
   * DELETE /api/customers/:id
   */
  async deleteCustomer(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  }

  /**
   * Aggregate customer counts (total, active, inactive, outstanding).
   * GET /api/customers/stats
   */
  async getCustomerStats(): Promise<CustomerStatsResponse> {
    const response = await apiClient.get<ApiResponseEnvelope<CustomerStatsResponse>>('/customers/stats');
    return unwrap(response.data);
  }
}

export const customerService = new CustomerService();
