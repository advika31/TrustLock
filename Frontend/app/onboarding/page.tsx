'use client';

import Link from 'next/link';
import { useLocale } from '@/providers/LocaleProvider';
import styles from './page.module.scss';

export default function OnboardingIndex() {
  const { t } = useLocale();
  const flows = [
    {
      title: t('onboarding.docFlow'),
      body: t('onboarding.docIntro'),
      href: '/onboarding/doc',
    },
    {
      title: t('onboarding.ssiFlow'),
      body: t('onboarding.ssiIntro'),
      href: '/onboarding/ssi',
    },
    {
      title: t('onboarding.branchFlow'),
      body: t('onboarding.branchIntro'),
      href: '/onboarding/branch',
    },
  ];
  return (
    <section className={styles.wrapper}>
      <header>
        <p>{t('onboarding.title')}</p>
        <h1>3 guided experiences</h1>
      </header>
      <div className={styles.grid}>
        {flows.map((flow) => (
          <article key={flow.href}>
            <h2>{flow.title}</h2>
            <p>{flow.body}</p>
            <Link href={flow.href}>Launch flow →</Link>
          </article>
        ))}
      </div>
    </section>
  );
}


