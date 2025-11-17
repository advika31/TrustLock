'use client';

import Link from 'next/link';
import { useLocale } from '@/providers/LocaleProvider';
import styles from './page.module.scss';

const featureIcons = ['📄', '🗣️', '🧠', '📡'];

export default function LandingPage() {
  const { t } = useLocale();
  const features = [
    { title: t('landing.featureDoc'), body: 'Auto-crop, deskew, and brightness normalization keep docs legible.' },
    { title: t('landing.featureVoice'), body: 'Built-in TTS instructions and low-literacy textual guide.' },
    { title: t('landing.featureXai'), body: 'Every decision comes with factor bars and printable audit notes.' },
    { title: t('landing.featureMonitoring'), body: 'Mock SSE feed showcases DRPA event bursts in real time.' },
  ];

  return (
    <div className={styles.landing}>
      <section className={styles.hero}>
        <div>
          <p className={styles.pill}>PWA · Offline · Voice ready</p>
          <h1>{t('landing.heroTitle')}</h1>
          <p>{t('landing.heroBody')}</p>
          <div className={styles.ctas}>
            <Link href="/onboarding" className={styles.primary}>
              {t('landing.ctaOnboarding')}
            </Link>
            <Link href="/dashboard" className={styles.secondary}>
              {t('landing.ctaCompliance')}
            </Link>
            <Link href="/admin" className={styles.secondaryMuted}>
              {t('landing.ctaAdmin')}
            </Link>
          </div>
        </div>
        <div className={styles.heroCard}>
          <h2>{t('demo.title')}</h2>
          <ul>
            <li>✅ {t('demo.lowRisk')}</li>
            <li>🚨 {t('demo.flagged')}</li>
            <li>📡 DRPA heartbeat &amp; SSE feed</li>
          </ul>
          <Link href="/demo">Launch Playground →</Link>
        </div>
      </section>
      <section>
        <h2>{t('landing.sectionTitle')}</h2>
        <div className={styles.grid}>
          {features.map((feature, index) => (
            <article key={feature.title}>
              <span aria-hidden="true" className={styles.icon}>
                {featureIcons[index]}
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.quickLinks}>
        <div>
          <h3>README</h3>
          <p>Integration guide, API contracts, and accessibility notes.</p>
          <a href="/README.md">Open README</a>
        </div>
        <div>
          <h3>Docs & Integration</h3>
          <p>Architecture diagram + Person A/B/C/D hand-off instructions.</p>
          <a href="/docs/integration">Open docs</a>
        </div>
      </section>
    </div>
  );
}

