'use client';

import { useState } from 'react';
import styles from './DocumentViewer.module.scss';

interface Doc {
  id: string;
  title: string;
  image?: string;
  metadata?: Record<string, string>;
}

interface Props {
  documents: Doc[];
}

export default function DocumentViewer({ documents }: Props) {
  const [active, setActive] = useState(documents[0]?.id);
  const [zoom, setZoom] = useState(1);

  const current = documents.find((doc) => doc.id === active) ?? documents[0];
  if (!current) return null;

  return (
    <div className={styles.viewer}>
      <aside>
        <ul>
          {documents.map((doc) => (
            <li key={doc.id}>
              <button
                type="button"
                className={doc.id === active ? styles.active : ''}
                onClick={() => {
                  setActive(doc.id);
                  setZoom(1);
                }}
              >
                {doc.title}
              </button>
            </li>
          ))}
        </ul>
        <div className={styles.controls}>
          <button type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
            -
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}>
            +
          </button>
        </div>
      </aside>
      <div className={styles.preview}>
        {current.image ? (
          <img src={current.image} alt={current.title} style={{ transform: `scale(${zoom})` }} />
        ) : (
          <div className={styles.placeholder}>No image available</div>
        )}
        {current.metadata && (
          <dl>
            {Object.entries(current.metadata).map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}


