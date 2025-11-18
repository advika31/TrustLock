'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { Locale } from '@/lib/i18n';
import { useLocale } from './LocaleProvider';

interface VoiceContextValue {
  enabled: boolean;
  toggle: () => void;
  speak: (text: string) => void;
  stop: () => void;
}

const VoiceContext = createContext<VoiceContextValue | undefined>(undefined);
const STORAGE_KEY = 'trustlock_voice_enabled';

export function VoiceProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const [enabled, setEnabled] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setEnabled(stored === 'true');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (text: string) => {
    if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = localeToBcp(locale);
    utterance.rate = 1;
    utterance.pitch = 1;
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      if (!next && utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  };

  const stop = () => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
  };

  const value = useMemo<VoiceContextValue>(
    () => ({
      enabled,
      toggle,
      speak,
      stop,
    }),
    [enabled]
  );

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

function localeToBcp(locale: Locale) {
  if (locale === 'hi-IN') return 'hi-IN';
  if (locale === 'es') return 'es-ES';
  return 'en-US';
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
}



