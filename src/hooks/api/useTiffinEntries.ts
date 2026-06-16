import { QUERY_KEYS } from '@/constants/queryKeys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '../../services/analytics/analytics';
import { AnalyticsEventNames } from '../../services/analytics/events';
import { DailyEntryService } from '../../services/api/daily-entry.service';
import type {
  BulkEntryPayload,
  TiffinEntry,
} from '../../types/api.types';
import { useSyncQueue } from '../useSyncQueue';

// export const tiffinKeys = {
//   all: ['tiffin-entries'] as const,
//   byDate: (date: string) => [...tiffinKeys.all, 'date', date] as const,
//   preview: (date: string, fromDate?: string) => [...tiffinKeys.all, 'preview', date, fromDate] as const,
// };

export const useTiffinEntriesByDate = (date: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.dailyEntries.byDate(date),
    queryFn: () => DailyEntryService.getByDate(date),
    select: (res) => res.data,
    enabled: !!date,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useTiffinPreview = (date: string, fromDate?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.dailyEntries.preview(date, fromDate),
    queryFn: () => DailyEntryService.getPreview(date, fromDate),
    select: (res) => res.data,
    enabled: !!date,
    staleTime: 1000 * 60 * 5,
  });
};

export const useBulkSaveTiffinEntries = () => {
  const queryClient = useQueryClient();
  const { enqueue } = useSyncQueue();

  return useMutation({
    mutationFn: async (payload: BulkEntryPayload) => {
      try {
        const result = await DailyEntryService.bulkSave(payload);
        return result;
      } catch (error) {
        // Enqueue the mutation on network failure
        await enqueue({
          type: 'TIFFIN_BULK_SAVE',
          payload,
        });
        throw error;
      }
    },
    onMutate: async (payload) => {
      // Optimistic update
      const dateStr = payload.entry_date;
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.dailyEntries.byDate(dateStr) });

      const previousData = queryClient.getQueryData<TiffinEntry[]>(QUERY_KEYS.dailyEntries.byDate(dateStr));

      // Build optimistic entries
      queryClient.setQueryData<TiffinEntry[]>(QUERY_KEYS.dailyEntries.byDate(dateStr), (old) => {
        if (!old) return old;

        const next = [...old];
        payload.entries.forEach((updateItem) => {
          const idx = next.findIndex(e => e.customer_id === updateItem.customer_id);
          if (idx >= 0) {
            next[idx] = {
              ...next[idx],
              morning_qty: updateItem.morning_qty,
              morning_price: updateItem.morning_price,
              evening_qty: updateItem.evening_qty,
              evening_price: updateItem.evening_price,
              total_qty: updateItem.morning_qty + updateItem.evening_qty,
              total_amount: (updateItem.morning_qty * updateItem.morning_price) + (updateItem.evening_qty * updateItem.evening_price),
              morning_paid: updateItem.morning_paid ?? next[idx].morning_paid,
              evening_paid: updateItem.evening_paid ?? next[idx].evening_paid,
              is_manual_price: updateItem.is_manual_price ?? next[idx].is_manual_price,
              notes: updateItem.notes !== undefined ? updateItem.notes : next[idx].notes,
              updatedAt: new Date().toISOString(),
            };
          } else {
            // In reality we might not have the full customer object for the optimistic insert
            // so it's tricky, but usually bulk update modifies existing generated preview/list.
          }
        });
        return next;
      });

      return { previousData };
    },
    onError: (_err, newPayload, context) => {
      // Note: we don't rollback if it's enqueued for sync because we WANT the UI
      // to reflect the optimistic state while offline. 
      // If it's a real 400 Validation Error, maybe we rollback. We can check error.
      // But for simplicity, the syncQueue handles offline state.
      // queryClient.setQueryData(QUERY_KEYS.dailyEntries.byDate(newPayload.entry_date), context?.previousData);
    },
    onSettled: (data, error, variables) => {
      // Invalidate to fetch latest
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyEntries.byDate(variables.entry_date) });
      // Update dashboard stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.stats() });
      analyticsService.trackEvent(AnalyticsEventNames.TIFFIN_ENTRY_UPDATED);
    },
  });
};
