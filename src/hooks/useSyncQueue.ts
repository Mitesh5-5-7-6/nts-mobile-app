import { useStore } from 'zustand';
import { syncStore, SyncQueueService } from '../services/offline/syncQueue';

export const useSyncQueue = () => {
  const isSyncing = useStore(syncStore, (state) => state.isSyncing);
  const queue = useStore(syncStore, (state) => state.queue);

  return {
    isSyncing,
    queue,
    pendingCount: queue.filter((i) => i.status === 'pending').length,
    failedCount: queue.filter((i) => i.status === 'failed').length,
    enqueue: SyncQueueService.enqueue,
    syncNow: SyncQueueService.sync,
    clearAll: SyncQueueService.clearAll,
  };
};
