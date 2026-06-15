import { apiClient, unwrap } from './client';
import './interceptors';
import type {
  Payment,
  PaymentStatsResponse,
  CustomerFinancialSummaryResponse,
  MonthlyReportParams,
  MonthlyReportResponse,
  GenerateBillRequest,
  GenerateBillResponse,
  GetPaymentsParams,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  RecordNtsPaymentRequest,
  RecordNtsPaymentResponse,
  GetGroupedPaymentsParams,
  GetGroupedPaymentsResponse,
  ToggleEntryStatusRequest,
  ToggleEntryStatusResponse,
  ApiResponseEnvelope,
  PaginationMeta,
} from '../types/api';

interface PaginatedPayments {
  data: Payment[];
  meta: PaginationMeta;
}

class PaymentService {
  // ─── Legacy Payments ───────────────────────────────────────────────────────

  /**
   * List payments with filtering, search, and pagination.
   * GET /api/payments
   */
  async getPayments(params?: GetPaymentsParams): Promise<PaginatedPayments> {
    const response = await apiClient.get<PaginatedPayments>('/payments', { params });
    return response.data;
  }

  /**
   * Fetch a single payment with embedded customer info.
   * GET /api/payments/:id
   */
  async getPaymentById(id: string): Promise<Payment> {
    const response = await apiClient.get<ApiResponseEnvelope<Payment>>(`/payments/${id}`);
    return unwrap(response.data);
  }

  /**
   * Record a new payment.
   * POST /api/payments
   */
  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    const response = await apiClient.post<ApiResponseEnvelope<Payment>>('/payments', data);
    return unwrap(response.data);
  }

  /**
   * Partially update a payment.
   * PATCH /api/payments/:id
   */
  async updatePayment(id: string, data: UpdatePaymentRequest): Promise<Payment> {
    const response = await apiClient.patch<ApiResponseEnvelope<Payment>>(`/payments/${id}`, data);
    return unwrap(response.data);
  }

  /**
   * Hard-delete a payment record (permanent).
   * DELETE /api/payments/:id
   */
  async deletePayment(id: string): Promise<void> {
    await apiClient.delete(`/payments/${id}`);
  }

  /**
   * Aggregate payment totals.
   * GET /api/payments/stats
   */
  async getPaymentStats(): Promise<PaymentStatsResponse> {
    const response = await apiClient.get<ApiResponseEnvelope<PaymentStatsResponse>>('/payments/stats');
    return unwrap(response.data);
  }

  /**
   * Full financial summary for a customer.
   * GET /api/payments/customer-summary/:customerId
   */
  async getCustomerSummary(customerId: string): Promise<CustomerFinancialSummaryResponse> {
    const response = await apiClient.get<ApiResponseEnvelope<CustomerFinancialSummaryResponse>>(
      `/payments/customer-summary/${customerId}`
    );
    return unwrap(response.data);
  }

  /**
   * Monthly financial report.
   * GET /api/payments/monthly-report
   */
  async getMonthlyReport(params?: MonthlyReportParams): Promise<MonthlyReportResponse> {
    const response = await apiClient.get<ApiResponseEnvelope<MonthlyReportResponse>>(
      '/payments/monthly-report',
      { params }
    );
    return unwrap(response.data);
  }

  /**
   * Calculate a bill for a customer over a date range.
   * POST /api/payments/generate-bill
   */
  async generateBill(data: GenerateBillRequest): Promise<GenerateBillResponse> {
    const response = await apiClient.post<ApiResponseEnvelope<GenerateBillResponse>>(
      '/payments/generate-bill',
      data
    );
    return unwrap(response.data);
  }

  // ─── Grouped Payments — NTS v1 ─────────────────────────────────────────────

  /**
   * Record a payment against a specific tiffin entry.
   * POST /api/nts/v1/payments
   */
  async recordNtsPayment(data: RecordNtsPaymentRequest): Promise<RecordNtsPaymentResponse> {
    const response = await apiClient.post<ApiResponseEnvelope<RecordNtsPaymentResponse>>(
      '/nts/v1/payments',
      data
    );
    return unwrap(response.data);
  }

  /**
   * Paginated list of customers grouped with their tiffin entry payment status.
   * GET /api/nts/v1/payments/grouped
   */
  async getGroupedPayments(params?: GetGroupedPaymentsParams): Promise<GetGroupedPaymentsResponse> {
    const response = await apiClient.get<ApiResponseEnvelope<GetGroupedPaymentsResponse>>(
      '/nts/v1/payments/grouped',
      { params }
    );
    return unwrap(response.data);
  }

  /**
   * Toggle morning/evening paid status on a tiffin entry.
   * PATCH /api/nts/v1/payments/:entryId/status
   */
  async toggleEntryStatus(
    entryId: string,
    data: ToggleEntryStatusRequest
  ): Promise<ToggleEntryStatusResponse> {
    const response = await apiClient.patch<ApiResponseEnvelope<ToggleEntryStatusResponse>>(
      `/nts/v1/payments/${entryId}/status`,
      data
    );
    return unwrap(response.data);
  }

  /**
   * Alias: get only pending payments for dashboard use.
   * GET /api/payments?status=pending
   */
  async getPendingPayments(): Promise<PaginatedPayments> {
    return this.getPayments({ status: 'pending', limit: 50 });
  }
}

export const paymentService = new PaymentService();
