import type {
  ApiResponse,
  BulkEntryPayload,
  BulkEntryResult,
  TiffinEntry,
  TiffinEntryPreview,
} from '../../types/api.types';
import apiClient from './client';

/**
 * Tiffin Entries API endpoints.
 *
 * These live at /api/tiffin-entries (NOT under /api/nts/v1).
 */
const BASE = '/tiffin-entries';

export const DailyEntryService = {
  /**
   * Fetch all tiffin entries for a specific date.
   */
  getByDate: async (date: string) => {
    const response = await apiClient.get<ApiResponse<TiffinEntry[]>>(
      BASE,
      { params: { date } }
    );
    return response.data;
  },

  /**
   * Generate a preview for active customers on a target date.
   * Uses 3-tier merge: existing entry → fromDate copy → customer defaults.
   */
  getPreview: async (date: string, fromDate?: string) => {
    const params: Record<string, string> = { date };
    if (fromDate) params.fromDate = fromDate;
    const response = await apiClient.get<ApiResponse<TiffinEntryPreview[]>>(
      `${BASE}/preview`,
      { params }
    );
    return response.data;
  },

  /**
   * Bulk upsert tiffin entries for a date.
   * One entry per customer per date.
   */
  bulkSave: async (payload: BulkEntryPayload) => {
    const response = await apiClient.post<ApiResponse<BulkEntryResult>>(
      `${BASE}/bulk`,
      payload
    );
    return response.data;
  },
};
