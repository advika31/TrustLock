'use client';

import { useEffect, useState } from 'react';
import { getReviewQueue, actionCase } from '@/services/api';
import { useToast } from '@/components/Toast/ToastProvider';
import styles from './dashboard.module.scss';

interface ReviewItem {
  application_id: string;
  name: string;
  status: string;
  risk_score: number;
  drpa_level: string;
  created_at: string;
}

export default function DashboardClient() {
  const { pushToast } = useToast();
  const [loggedIn, setLoggedIn] = useState(false);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (loggedIn) {
      void load();
    }
  }, [loggedIn]);

  const load = async () => {
    setLoading(true);
    const data = await getReviewQueue();
    setItems(data.applications);
    setLoading(false);
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    await Promise.all(selected.map((id) => actionCase(id, action)));
    pushToast({ message: `${action}d ${selected.length} case(s)`, variant: 'success' });
    setSelected([]);
    void load();
  };

  if (!loggedIn) {
    return (
      <div className={styles.login}>
        <h1>Officer portal</h1>
        <button type="button" onClick={() => setLoggedIn(true)}>
          Enter Demo Mode
        </button>
      </div>
    );
  }

  return (
    <section className={styles.wrapper}>
      <header>
        <h1>Flagged queue</h1>
        <div className={styles.bulk}>
          <button type="button" onClick={() => handleAction('approve')} disabled={!selected.length}>
            Approve
          </button>
          <button type="button" onClick={() => handleAction('reject')} disabled={!selected.length}>
            Reject
          </button>
        </div>
      </header>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={selected.length === items.length}
                  onChange={(event) =>
                    setSelected(event.target.checked ? items.map((item) => item.application_id) : [])
                  }
                />
              </th>
              <th>Name</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.application_id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(item.application_id)}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelected((prev) => [...prev, item.application_id]);
                      } else {
                        setSelected((prev) => prev.filter((id) => id !== item.application_id));
                      }
                    }}
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.status}</td>
                <td>
                  <span data-risk={item.drpa_level}>{item.risk_score}</span>
                </td>
                <td>{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}


