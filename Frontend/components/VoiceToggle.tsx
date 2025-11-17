'use client';

import { useVoice } from '@/providers/VoiceProvider';
import { useLocale } from '@/providers/LocaleProvider';
import styles from './VoiceToggle.module.scss';

export default function VoiceToggle() {
  const { enabled, toggle } = useVoice();
  const { t } = useLocale();

  return (
    <button
      type="button"
      className={styles.voiceToggle}
      onClick={toggle}
      aria-pressed={enabled}
    >
      <span aria-hidden="true">{enabled ? '🔊' : '🔈'}</span>
      <span>{enabled ? t('common.voiceOn') : t('common.voiceOff')}</span>
    </button>
  );
}


