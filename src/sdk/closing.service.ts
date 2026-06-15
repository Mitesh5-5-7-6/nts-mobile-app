import { apiClient, unwrap } from './client';
import './interceptors';
import type {
  MonthSummaryResponse,
  BackupResponse,
  RestoreRequest,
  RestoreResponse,
  ApiResponseEnvelope,
} from '../types/api';

class ClosingService {
  /**
   * Current calendar month summary vs last month.
   * GET /api/nts/v1/dashboard/month-summary
   */
  async getMonthSummary(): Promise<MonthSummaryResponse> {
    const response = await apiClient.get<ApiResponseEnvelope<MonthSummaryResponse>>(
      '/nts/v1/dashboard/month-summary'
    );
    return unwrap(response.data);
  }

  /**
   * Export all MongoDB collections and upload to OneDrive.
   * GET /api/cron/backup
   * Note: Requires cron secret — only for admin use.
   */
  async triggerBackup(cronSecret: string): Promise<BackupResponse> {
    const response = await apiClient.get<ApiResponseEnvelope<BackupResponse>>('/cron/backup', {
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
    return unwrap(response.data);
  }

  /**
   * Restore a backup from OneDrive.
   * POST /api/backup/restore
   */
  async restoreBackup(data: RestoreRequest): Promise<RestoreResponse> {
    const response = await apiClient.post<ApiResponseEnvelope<RestoreResponse>>(
      '/backup/restore',
      data
    );
    return unwrap(response.data);
  }
}

export const closingService = new ClosingService();
