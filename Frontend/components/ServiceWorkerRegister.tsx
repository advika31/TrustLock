'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(() => console.info('Service worker registered'))
        .catch((error) => console.error('SW registration failed', error));
    }
  }, []);

  return null;
}


