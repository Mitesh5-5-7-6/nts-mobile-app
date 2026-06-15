import { apiClient, unwrap } from './client';
import './interceptors';
import type {
  TiffinEntry,
  TiffinEntryPreviewResponse,
  BulkUpsertTiffinRequest,
  BulkUpsertTiffinResponse,
  GetTiffinEntriesParams,
  TiffinEntryPreviewParams,
  ApiResponseEnvelope,
} from '../types/api';

class DailyEntryService {
  /**
   * Fetch all tiffin entries for a specific date.
   * GET /api/tiffin-entries?date=YYYY-MM-DD
   */
  async getDailyEntries(params: GetTiffinEntriesParams): Promise<TiffinEntry[]> {
    const response = await apiClient.get<ApiResponseEnvelope<TiffinEntry[]>>('/tiffin-entries', {
      params,
    });
    return unwrap(response.data);
  }

  /**
   * Upsert tiffin entries for a date in bulk.
   * POST /api/tiffin-entries/bulk
   */
  async bulkUpsertEntries(data: BulkUpsertTiffinRequest): Promise<BulkUpsertTiffinResponse> {
    const response = await apiClient.post<ApiResponseEnvelope<BulkUpsertTiffinResponse>>(
      '/tiffin-entries/bulk',
      data
    );
    return unwrap(response.data);
  }

  /**
   * Generate a preview row per active customer using 3-tier merge strategy.
   * GET /api/tiffin-entries/preview?date=YYYY-MM-DD&fromDate=YYYY-MM-DD
   */
  async getPreview(params: TiffinEntryPreviewParams): Promise<TiffinEntryPreviewResponse[]> {
    const response = await apiClient.get<ApiResponseEnvelope<TiffinEntryPreviewResponse[]>>(
      '/tiffin-entries/preview',
      { params }
    );
    return unwrap(response.data);
  }
}

export const dailyEntryService = new DailyEntryService();
