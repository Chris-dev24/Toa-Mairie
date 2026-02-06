import React, { useEffect, useState } from 'react';
import { offlineService } from '../services';

const OfflineQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const items = await offlineService.getQueued();
      setQueue(items || []);
    } catch (err) {
      console.error('Failed to load offline queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    try {
      await offlineService.deleteQueued(id);
      setQueue((q) => q.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Failed to delete queued item', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">File d'attente hors-ligne</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : queue.length === 0 ? (
        <p>Aucune soumission en attente.</p>
      ) : (
        <div className="space-y-3">
          {queue.map((item) => (
            <div key={item.id} className="border p-3 rounded-md bg-white flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-600">Form ID: {item.payload.formId}</div>
                <div className="text-xs text-gray-500">Queued at: {new Date(item.createdAt).toLocaleString()}</div>
                <pre className="text-xs mt-2 max-w-xl overflow-auto bg-gray-50 p-2 rounded">{JSON.stringify(item.payload.data, null, 2)}</pre>
              </div>
              <div className="ml-4 flex flex-col gap-2">
                <button onClick={() => remove(item.id)} className="px-3 py-1 bg-red-600 text-white rounded">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfflineQueue;
