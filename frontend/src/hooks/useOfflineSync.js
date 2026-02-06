import { useEffect } from 'react';
import { offlineService, formService } from '../services';

export default function useOfflineSync() {
  useEffect(() => {
    const trySync = async () => {
      const queued = await offlineService.getQueued();
      if (!queued || queued.length === 0) return;

      for (const item of queued) {
        try {
          // payload stored under item.payload
          await formService.syncOffline([item.payload]);
          await offlineService.deleteQueued(item.id);
        } catch (err) {
          // stop if any failure to avoid tight loop
          console.warn('Offline sync failed for item', item.id, err.message);
          break;
        }
      }
    };

    // Try sync when online
    window.addEventListener('online', trySync);

    // Try immediate sync on mount
    if (navigator.onLine) trySync();

    return () => window.removeEventListener('online', trySync);
  }, []);
}
