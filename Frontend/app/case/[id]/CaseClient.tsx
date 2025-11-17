'use client';

import { useEffect, useState } from 'react';
import DocumentViewer from '@/components/DocumentViewer';
import XaiTrace from '@/components/XaiTrace';
import { actionCase, getCase } from '@/services/api';
import { useToast } from '@/components/Toast/ToastProvider';
import styles from './case.module.scss';

interface Props {
  caseId: string;
}

export default function CaseClient({ caseId }: Props) {
  const { pushToast } = useToast();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getCase(caseId);
      setRecord(data);
      setLoading(false);
    }
    void load();
  }, [caseId]);

  const handleAction = async (action: 'approve' | 'reject' | 'request_info') => {
    await actionCase(caseId, action);
    pushToast({ message: `Case ${action}d`, variant: 'success' });
  };

  if (loading) return <p>Loading…</p>;
  if (!record) return <p>Case not found.</p>;

  const documents = record.documents.map((doc: any) => ({
    id: doc.document_type,
    title: doc.document_type,
    image: doc.url,
  }));

  return (
    <section className={styles.wrapper}>
      <header>
        <h1>{record.name}</h1>
        <span>Status: {record.status}</span>
      </header>
      <div className={styles.columns}>
        <DocumentViewer documents={documents} />
        <article className={styles.xai}>
          <XaiTrace
            trace={{
              application_id: record.application_id,
              decision: record.status,
              confidence: record.risk?.risk_score ?? 0.5,
              top_factors: record.risk?.explanations ?? [],
              reasoning_chain: ['Document analysis', 'Face match', 'Watchlist scan'],
            }}
            riskResponse={record.risk}
          />
        </article>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={() => handleAction('approve')}>
          Approve
        </button>
        <button type="button" onClick={() => handleAction('request_info')}>
          Request Info
        </button>
        <button type="button" onClick={() => handleAction('reject')}>
          Reject
        </button>
      </div>
    </section>
  );
}


