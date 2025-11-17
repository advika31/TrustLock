'use client';

import { useEffect, useState } from 'react';
import { getStatus } from '@/services/api';
import { useLocale } from '@/providers/LocaleProvider';
import XaiTrace from '@/components/XaiTrace';
import styles from './status.module.scss';

interface Props {
  appId: string;
}

export default function StatusClient({ appId }: Props) {
  const { t } = useLocale();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getStatus(appId);
        setStatus(data);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [appId]);

  if (loading) return <p>Loading status…</p>;
  if (!status) return <p>Not found</p>;

  return (
    <section className={styles.wrapper}>
      <header>
        <h1>{t('status.title')}</h1>
        <p>
          {t('status.status')}: <strong>{status.status}</strong>
        </p>
      </header>
      <div className={styles.cards}>
        <article>
          <h2>{t('status.riskLabel')}</h2>
          <p className={styles.score}>{status.risk?.risk_score ?? '--'}</p>
        </article>
        <article>
          <h2>{t('status.xaiTitle')}</h2>
          {status.risk ? (
            <XaiTrace
              trace={{
                application_id: appId,
                decision: status.status,
                confidence: 0.8,
                top_factors: status.risk.explanations,
                reasoning_chain: ['Documents validated', 'Face match verified'],
                model_version: status.risk?.audit_id,
              }}
              riskResponse={status.risk}
            />
          ) : (
            <p>No decision generated yet.</p>
          )}
        </article>
      </div>
      <article className={styles.audit}>
        <h2>{t('status.auditTrail')}</h2>
        <ol>
          {status.audit_log?.map((entry: any) => (
            <li key={entry.audit_id}>
              <strong>{entry.action}</strong> · {new Date(entry.timestamp).toLocaleString()}
            </li>
          ))}
        </ol>
      </article>
    </section>
  );
}


