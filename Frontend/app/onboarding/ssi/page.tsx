'use client';

import { useState } from 'react';
import { useLocale } from '@/providers/LocaleProvider';
import styles from './ssi.module.scss';

const ATTRIBUTES = [
  { label: 'Full name', value: 'Ava Patel' },
  { label: 'DOB', value: '1994-05-18' },
  { label: 'Document #', value: 'IND-7783-2219' },
  { label: 'Address', value: 'Mumbai, India' },
];

export default function SsiPage() {
  const { t } = useLocale();
  const [connected, setConnected] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [sharing, setSharing] = useState(false);

  const connectWallet = () => {
    setConnected(true);
  };

  const share = async () => {
    setSharing(true);
    await new Promise((res) => setTimeout(res, 800));
    setConsentGiven(true);
    setSharing(false);
  };

  return (
    <section className={styles.wrapper}>
      <header>
        <h1>{t('onboarding.ssiFlow')}</h1>
        <p>{t('onboarding.ssi.consentBody')}</p>
      </header>
      <div className={styles.columns}>
        <article>
          <h2>{t('onboarding.ssi.consentTitle')}</h2>
          <ul>
            {ATTRIBUTES.map((attr) => (
              <li key={attr.label}>
                <span>{attr.label}</span>
                <strong>{attr.value}</strong>
              </li>
            ))}
          </ul>
          <button type="button" onClick={connectWallet} disabled={connected}>
            {connected ? 'Wallet connected' : t('onboarding.ssi.connect')}
          </button>
        </article>
        <article>
          <h2>Consent log</h2>
          <ol>
            <li>Request created → TrustLock wants VC #KYC-basic</li>
            <li>Scope: name, dob, address, doc #</li>
            <li>Status: {consentGiven ? 'Shared' : 'Pending user consent'}</li>
          </ol>
          <button
            type="button"
            onClick={share}
            disabled={!connected || consentGiven || sharing}
            className={styles.primary}
          >
            {sharing ? 'Signing…' : t('demo.simulate')}
          </button>
        </article>
      </div>
    </section>
  );
}


