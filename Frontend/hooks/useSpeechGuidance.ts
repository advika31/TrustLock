'use client';

import { useEffect } from 'react';
import { useVoice } from '@/providers/VoiceProvider';

export function useSpeechGuidance(message?: string) {
  const { enabled, speak } = useVoice();
  useEffect(() => {
    if (!message || !enabled) return;
    speak(message);
  }, [enabled, message, speak]);
}


