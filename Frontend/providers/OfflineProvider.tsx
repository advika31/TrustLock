'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import {
  flushQueue as flushOfflineQueue,
  listRequests,
  OfflineRequest,
} from '@/services/offlineQueue';
import { replayQueuedRequest } from '@/services/api';

interface OfflineContextValue {
  isOnline: boolean;
  queue: OfflineRequest[];
  isSyncing: boolean;
  refreshQueue: () => Promise<void>;
  flushQueue: () => Promise<{ success: number; failed: number }>;
}

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const [queue, setQueue] = useState<OfflineRequest[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshQueue = useCallback(async () => {
    const items = await listRequests();
    setQueue(items);
  }, []);

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      void flushQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const flushQueue = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await flushOfflineQueue(replayQueuedRequest);
      await refreshQueue();
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [refreshQueue]);

  const value = useMemo(
    () => ({
      isOnline,
      queue,
      isSyncing,
      refreshQueue,
      flushQueue,
    }),
    [flushQueue, isOnline, isSyncing, queue, refreshQueue]
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline must be used within OfflineProvider');
  return context;
}



