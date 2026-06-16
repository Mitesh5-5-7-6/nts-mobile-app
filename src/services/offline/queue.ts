import { getMutationQueue, setMutationQueue, QueuedMutation } from '../../storage/queue.storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export const OfflineQueue = {
  add: (mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>) => {
    const queue = getMutationQueue();
    const newMutation: QueuedMutation = {
      ...mutation,
      id: uuidv4(),
      timestamp: Date.now(),
      retryCount: 0,
    };
    setMutationQueue([...queue, newMutation]);
    return newMutation.id;
  },

  remove: (id: string) => {
    const queue = getMutationQueue();
    setMutationQueue(queue.filter(m => m.id !== id));
  },

  incrementRetry: (id: string) => {
    const queue = getMutationQueue();
    const updated = queue.map(m => {
      if (m.id === id) {
        return { ...m, retryCount: m.retryCount + 1 };
      }
      return m;
    });
    setMutationQueue(updated);
  },

  getQueue: () => {
    return getMutationQueue();
  },

  clear: () => {
    setMutationQueue([]);
  }
};
