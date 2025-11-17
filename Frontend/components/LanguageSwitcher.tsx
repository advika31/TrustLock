'use client';

import { ChangeEvent } from 'react';
import { useLocale } from '@/providers/LocaleProvider';
import styles from './LanguageSwitcher.module.scss';

export default function LanguageSwitcher() {
  const { locale, setLocale, supported, t } = useLocale();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLocale(event.target.value as typeof locale);
  };

  return (
    <label className={styles.switcher}>
      <span className="sr-only">{t('common.language')}</span>
      <select value={locale} onChange={handleChange} aria-label={t('common.language')}>
        {supported.map((code) => (
          <option key={code} value={code}>
            {labelForLocale(code)}
          </option>
        ))}
      </select>
    </label>
  );
}

function labelForLocale(code: string) {
  if (code === 'hi-IN') return 'हिन्दी';
  if (code === 'es') return 'Español';
  return 'English';
}


