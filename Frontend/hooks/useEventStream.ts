'use client';

import { useEffect, useState } from 'react';

export interface MonitoringEvent {
  id: string;
  application_id: string;
  event_type: string;
  message: string;
  timestamp: string;
  risk_score?: number;
}

export function useEventStream(path = '/api/mock/events') {
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const eventSource = new EventSource(path);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as MonitoringEvent;
        setEvents((prev) => [data, ...prev].slice(0, 50));
      } catch (error) {
        console.warn('Unable to parse SSE event', error);
      }
    };
    eventSource.onerror = () => {
      eventSource.close();
      setTimeout(() => setRetryCount((count) => count + 1), 5000);
    };
    return () => eventSource.close();
  }, [path, retryCount]);

  return events;
}

