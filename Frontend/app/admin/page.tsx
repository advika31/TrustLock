'use client';

import { useEffect, useState } from 'react';
import { getAdminSettings, updateAdminSettings } from '@/services/api';
import styles from './admin.module.scss';

export default function AdminPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAdminSettings();
      setSettings(data);
      setLoading(false);
    }
    void load();
  }, []);

  const handleThresholdChange = (key: 'low' | 'high', value: number) => {
    setSettings((prev: any) => ({
      ...prev,
      thresholds: { ...prev.thresholds, [key]: value },
    }));
  };

  const save = async () => {
    await updateAdminSettings(settings);
  };

  if (loading) return <p>Loading settings…</p>;

  return (
    <section className={styles.wrapper}>
      <article className={styles.article}>
        <h2>Risk thresholds</h2>
        <div className={styles.grid}>
          <label>
            Low
            <input
              type="number"
              value={settings.thresholds.low}
              onChange={(event) => handleThresholdChange('low', Number(event.target.value))}
              className={styles.textInput}
            />
          </label>
          <label>
            High
            <input
              type="number"
              value={settings.thresholds.high}
              onChange={(event) => handleThresholdChange('high', Number(event.target.value))}
              className={styles.textInput}
            />
          </label>
        </div>
        <button type="button" onClick={save}>
          Save thresholds
        </button>
      </article>
      <article className={styles.article}>
        <h2>Model info</h2>
        <p>Current model: {settings.modelVersion}</p>
        <button type="button">Download audit export</button>
      </article>
    </section>
  );
}



