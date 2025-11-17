'use client';

import { useState } from 'react';
import styles from './branch.module.scss';

export default function BranchPage() {
  const [sensor, setSensor] = useState(24);
  const [silentMode, setSilentMode] = useState(true);

  return (
    <section className={styles.wrapper}>
      <header>
        <h1>Branch & IoT orchestration</h1>
        <p>Simulate kiosk and queue-less silent onboarding.</p>
      </header>
      <div className={styles.grid}>
        <article className={styles.article}>
          <h2>IoT Sensors</h2>
          <p>Ambient light</p>
          <input
            type="range"
            min={10}
            max={80}
            value={sensor}
            onChange={(event) => setSensor(Number(event.target.value))}
            className={styles.rangeInput}
          />
          <span>{sensor} lux</span>
        </article>
        <article className={styles.article}>
          <h2>Silent Mode</h2>
          <label>
            <input
              type="checkbox"
              checked={silentMode}
              onChange={(event) => setSilentMode(event.target.checked)}
            />
            Enable human-less enrollments
          </label>
          <p>Status: {silentMode ? 'Auto-capturing via kiosk camera' : 'Manual review desk'}</p>
        </article>
      </div>
    </section>
  );
}


