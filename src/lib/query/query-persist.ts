import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { queryCacheStorage } from '../../storage/cache.storage';

export const queryPersister = createSyncStoragePersister({
  storage: queryCacheStorage,
});
