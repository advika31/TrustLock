'use client';

import { useState } from 'react';
import { useEventStream } from '@/hooks/useEventStream';
import { triggerMonitoringEvent } from '@/services/api';
import styles from './demo.module.scss';

export default function DemoPage() {
  const events = useEventStream('/api/mock/events');
  const [application_id, setApplicationId] = useState('');

  const simulate = async (event_type: string) => {
    await triggerMonitoringEvent({
      application_id: application_id || events[0]?.application_id || 'demo',
      event_type,
    });
  };

  return (
    <section className={styles.wrapper}>
      <header>
        <h1>Continuous monitoring playground</h1>
        <p>Incoming SSE events stream below. Trigger a DRPA micro-verification.</p>
      </header>
      <div className={styles.controls}>
        <input
          value={application_id}
          onChange={(e) => setApplicationId(e.target.value)}
          placeholder="Application ID"
        />
        <button type="button" onClick={() => simulate('micro_verification')}>
          Trigger Micro-verification
        </button>
        <button type="button" onClick={() => simulate('sanctions_hit')}>
          Simulate Sanctions Hit
        </button>
      </div>
      <ul className={styles.timeline}>
        {events.map((event) => (
          <li key={event.id}>
            <h3>{event.event_type}</h3>
            <p>{event.message}</p>
            <small>{new Date(event.timestamp).toLocaleTimeString()}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}



