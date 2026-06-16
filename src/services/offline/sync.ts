import { OfflineQueue } from './queue';
import { NetworkService } from './network';
import apiClient from '../api/client';

const MAX_RETRIES = 3;

export const SyncService = {
  isSyncing: false,

  sync: async () => {
    if (SyncService.isSyncing) return;
    
    const isOnline = await NetworkService.isOnline();
    if (!isOnline) return;

    const queue = OfflineQueue.getQueue();
    if (queue.length === 0) return;

    SyncService.isSyncing = true;

    for (const mutation of queue) {
      // Check online status before each request in case it drops during sync
      if (!(await NetworkService.isOnline())) {
        break;
      }

      if (mutation.retryCount >= MAX_RETRIES) {
        // Drop it or move to a dead-letter queue
        OfflineQueue.remove(mutation.id);
        continue;
      }

      try {
        await apiClient.request({
          url: mutation.url,
          method: mutation.method,
          data: mutation.data,
          headers: mutation.headers,
        });
        
        // Success, remove from queue
        OfflineQueue.remove(mutation.id);
      } catch (error: any) {
        // If it's a 4xx error (validation, not found, etc), we probably shouldn't retry it blindly
        // unless it's a 429 or network error.
        const status = error.response?.status;
        if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
          OfflineQueue.remove(mutation.id); // Drop invalid requests
        } else {
          OfflineQueue.incrementRetry(mutation.id);
        }
      }
    }

    SyncService.isSyncing = false;
  }
};
