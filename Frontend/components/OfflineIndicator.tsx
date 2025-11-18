'use client';

import { useOffline } from '@/providers/OfflineProvider';
import { useToast } from './Toast/ToastProvider';
import styles from './OfflineIndicator.module.scss';

export default function OfflineIndicator() {
  const { isOnline, queue, flushQueue, isSyncing } = useOffline();
  const { pushToast } = useToast();

  const handleSync = async () => {
    const result = await flushQueue();
    pushToast({
      message: `Synced ${result.success} items${result.failed ? `, ${result.failed} failed` : ''}`,
      variant: result.failed ? 'warning' : 'success',
    });
  };

  if (isOnline && queue.length === 0) {
    return null;
  }

  return (
    <div className={styles.offline} role="status" aria-live="polite">
      <div>
        <strong>{isOnline ? 'Sync pending' : 'Offline mode'}</strong>
        <span>
          {queue.length} item{queue.length === 1 ? '' : 's'} queued
        </span>
      </div>
      <button type="button" onClick={handleSync} disabled={isSyncing}>
        {isSyncing ? 'Syncing…' : 'Retry'}
      </button>
    </div>
  );
}



