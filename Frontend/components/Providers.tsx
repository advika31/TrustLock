'use client';

import { ReactNode } from 'react';
import { LocaleProvider } from '@/providers/LocaleProvider';
import { VoiceProvider } from '@/providers/VoiceProvider';
import { OfflineProvider } from '@/providers/OfflineProvider';
import { ToastProvider } from './Toast/ToastProvider';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <VoiceProvider>
        <OfflineProvider>
          <ToastProvider>{children}</ToastProvider>
        </OfflineProvider>
      </VoiceProvider>
    </LocaleProvider>
  );
}



