'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/providers/LocaleProvider';
import LanguageSwitcher from './LanguageSwitcher';
import VoiceToggle from './VoiceToggle';
import OfflineIndicator from './OfflineIndicator';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: ReactNode;
}

const NAV_LINKS = [
  { href: '/', labelKey: 'nav.landing' },
  { href: '/onboarding', labelKey: 'nav.onboarding' },
  { href: '/dashboard', labelKey: 'nav.dashboard' },
  { href: '/admin', labelKey: 'nav.admin' },
  { href: '/demo', labelKey: 'nav.demo' },
];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Link href="/">TrustLock</Link>
          <p>{t('app.tagline')}</p>
        </div>
        <nav className={styles.nav} aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? styles.active : ''}
            >
              {t(link.labelKey)}
            </Link>
          ))}
          <a href="https://github.com" target="_blank" rel="noreferrer">
            {t('nav.docs')}
          </a>
        </nav>
        <div className={styles.actions}>
          <LanguageSwitcher />
          <VoiceToggle />
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} TrustLock · Human-crafted verification UX</p>
        <div>
          <a href="/README.md">README</a>
          <a href="/docs/integration">Integration Notes</a>
        </div>
      </footer>
      <OfflineIndicator />
    </div>
  );
}

