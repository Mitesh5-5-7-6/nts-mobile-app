import { apiClient, unwrap } from './client';
import './interceptors';
import type {
  Expense,
  Vendor,
  ExpenseStatsResponse,
  ExpenseStatsParams,
  GetExpensesParams,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  GetVendorsParams,
  CreateVendorRequest,
  UpdateVendorRequest,
  ApiResponseEnvelope,
  PaginationMeta,
} from '../types/api';

interface PaginatedExpenses {
  data: Expense[];
  meta: PaginationMeta;
}

interface PaginatedVendors {
  data: Vendor[];
  meta: PaginationMeta;
}

class ExpenseService {
  // ─── Expenses ──────────────────────────────────────────────────────────────

  /**
   * List expenses with multi-field filtering and pagination.
   * GET /api/expenses
   */
  async getExpenses(params?: GetExpensesParams): Promise<PaginatedExpenses> {
    const response = await apiClient.get<PaginatedExpenses>('/expenses', { params });
    return response.data;
  }

  /**
   * Fetch a single expense by ID.
   * GET /api/expenses/:id
   */
  async getExpenseById(id: string): Promise<Expense> {
    const response = await apiClient.get<ApiResponseEnvelope<Expense>>(`/expenses/${id}`);
    return unwrap(response.data);
  }

  /**
   * Create a new expense.
   * POST /api/expenses
   */
  async createExpense(data: CreateExpenseRequest): Promise<Expense> {
    const response = await apiClient.post<ApiResponseEnvelope<Expense>>('/expenses', data);
    return unwrap(response.data);
  }

  /**
   * Partially update an expense.
   * PATCH /api/expenses/:id
   */
  async updateExpense(id: string, data: UpdateExpenseRequest): Promise<Expense> {
    const response = await apiClient.patch<ApiResponseEnvelope<Expense>>(`/expenses/${id}`, data);
    return unwrap(response.data);
  }

  /**
   * Soft-delete an expense.
   * DELETE /api/expenses/:id
   */
  async deleteExpense(id: string): Promise<void> {
    await apiClient.delete(`/expenses/${id}`);
  }

  /**
   * Expense analytics for a date range vs. previous period.
   * GET /api/expenses/stats
   */
  async getExpenseStats(params?: ExpenseStatsParams): Promise<ExpenseStatsResponse> {
    const response = await apiClient.get<ApiResponseEnvelope<ExpenseStatsResponse>>(
      '/expenses/stats',
      { params }
    );
    return unwrap(response.data);
  }

  // ─── Vendors ───────────────────────────────────────────────────────────────

  /**
   * List vendors with filtering.
   * GET /api/vendors
   */
  async getVendors(params?: GetVendorsParams): Promise<PaginatedVendors> {
    const response = await apiClient.get<PaginatedVendors>('/vendors', { params });
    return response.data;
  }

  /**
   * Fetch a single vendor by ID.
   * GET /api/vendors/:id
   */
  async getVendorById(id: string): Promise<Vendor> {
    const response = await apiClient.get<ApiResponseEnvelope<Vendor>>(`/vendors/${id}`);
    return unwrap(response.data);
  }

  /**
   * Create a vendor.
   * POST /api/vendors
   */
  async createVendor(data: CreateVendorRequest): Promise<Vendor> {
    const response = await apiClient.post<ApiResponseEnvelope<Vendor>>('/vendors', data);
    return unwrap(response.data);
  }

  /**
   * Partially update a vendor.
   * PATCH /api/vendors/:id
   */
  async updateVendor(id: string, data: UpdateVendorRequest): Promise<Vendor> {
    const response = await apiClient.patch<ApiResponseEnvelope<Vendor>>(`/vendors/${id}`, data);
    return unwrap(response.data);
  }

  /**
   * Soft-delete a vendor (sets is_active: false).
   * DELETE /api/vendors/:id
   */
  async deleteVendor(id: string): Promise<void> {
    await apiClient.delete(`/vendors/${id}`);
  }
}

export const expenseService = new ExpenseService();
