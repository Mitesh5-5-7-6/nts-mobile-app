import { apiClient, unwrap } from './client';
import './interceptors';
import type {
  MonthlyReportParams,
  MonthlyReportResponse,
  ApiResponseEnvelope,
} from '../types/api';

class ReportService {
  /**
   * Monthly financial report (payments).
   * GET /api/payments/monthly-report
   */
  async getMonthlyReport(params?: MonthlyReportParams): Promise<MonthlyReportResponse> {
    const response = await apiClient.get<ApiResponseEnvelope<MonthlyReportResponse>>(
      '/payments/monthly-report',
      { params }
    );
    return unwrap(response.data);
  }
}

export const reportService = new ReportService();
