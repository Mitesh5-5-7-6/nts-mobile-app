import { getMutationQueue, setMutationQueue } from '../../storage/queue.storage';
import { NetworkService } from './network';
import { DailyEntryService } from '../api/daily-entry.service';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import type { SyncQueueItem } from '../../types/api.types';
import { createStore } from 'zustand/vanilla';

const MAX_RETRIES = 3;

interface SyncState {
  isSyncing: boolean;
  queue: SyncQueueItem[];
  setSyncing: (val: boolean) => void;
  setQueue: (q: SyncQueueItem[]) => void;
}

// Global store for UI reactivity
export const syncStore = createStore<SyncState>((set) => ({
  isSyncing: false,
  queue: getMutationQueue(),
  setSyncing: (val) => set({ isSyncing: val }),
  setQueue: (q) => {
    setMutationQueue(q);
    set({ queue: q });
  },
}));

export const SyncQueueService = {
  enqueue: async (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'>) => {
    const queue = syncStore.getState().queue;
    const newItem: SyncQueueItem = {
      ...item,
      id: uuidv4(),
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };
    syncStore.getState().setQueue([...queue, newItem]);
    
    // Attempt immediate sync if online
    if (await NetworkService.isOnline()) {
      SyncQueueService.sync();
    }
    return newItem.id;
  },

  remove: (id: string) => {
    const queue = syncStore.getState().queue;
    syncStore.getState().setQueue(queue.filter((m) => m.id !== id));
  },

  updateStatus: (id: string, status: SyncQueueItem['status'], errorMessage?: string) => {
    const queue = syncStore.getState().queue;
    syncStore.getState().setQueue(
      queue.map((m) => (m.id === id ? { ...m, status, errorMessage } : m))
    );
  },

  incrementRetry: (id: string, errorMessage: string) => {
    const queue = syncStore.getState().queue;
    syncStore.getState().setQueue(
      queue.map((m) => {
        if (m.id === id) {
          const count = m.retryCount + 1;
          return {
            ...m,
            retryCount: count,
            status: count >= MAX_RETRIES ? 'failed' : 'pending',
            errorMessage,
          };
        }
        return m;
      })
    );
  },

  sync: async () => {
    const state = syncStore.getState();
    if (state.isSyncing) return;

    const isOnline = await NetworkService.isOnline();
    if (!isOnline) return;

    // Get all pending items that haven't permanently failed
    const pendingItems = state.queue.filter((item) => item.status === 'pending');
    if (pendingItems.length === 0) return;

    state.setSyncing(true);

    for (const mutation of pendingItems) {
      if (!(await NetworkService.isOnline())) break;

      SyncQueueService.updateStatus(mutation.id, 'syncing');

      try {
        if (mutation.type === 'TIFFIN_BULK_SAVE') {
          await DailyEntryService.bulkSave(mutation.payload);
        }

        // Success! Remove from queue.
        SyncQueueService.remove(mutation.id);
      } catch (error: any) {
        // Handle failure
        const status = error.response?.status;
        const msg = error.message || 'Sync failed';

        // 400-level errors (except 408 Timeout and 429 Rate Limit) are usually fatal (e.g., validation)
        if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
          SyncQueueService.updateStatus(mutation.id, 'failed', msg);
        } else {
          SyncQueueService.incrementRetry(mutation.id, msg);
        }
      }
    }

    state.setSyncing(false);
  },

  clearAll: () => {
    syncStore.getState().setQueue([]);
  },
};
