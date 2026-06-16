import { createStorageHelper } from './index';
import type { SyncQueueItem } from '../types/api.types';

const queueStorage = createStorageHelper('offline');
const QUEUE_KEY = 'mutationQueue';

export const getMutationQueue = (): SyncQueueItem[] => {
  const data = queueStorage.getString(QUEUE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as SyncQueueItem[];
  } catch {
    return [];
  }
};

export const setMutationQueue = (queue: SyncQueueItem[]) => {
  queueStorage.set(QUEUE_KEY, JSON.stringify(queue));
};

export const clearMutationQueue = () => {
  queueStorage.delete(QUEUE_KEY);
};
