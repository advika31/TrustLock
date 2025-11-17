'use client';

import { ChangeEvent, useState } from 'react';
import { CaptureResult, useCameraCapture } from '@/hooks/useCameraCapture';
import { useSpeechGuidance } from '@/hooks/useSpeechGuidance';
import styles from './CameraCapture.module.scss';

interface Props {
  documentType: 'selfie' | 'id_front' | 'id_back' | 'address_proof';
  onCapture: (payload: CaptureResult) => void;
  instruction?: string;
}

export default function CameraCapture({ documentType, onCapture, instruction }: Props) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [useCamera, setUseCamera] = useState(true);
  const { videoRef, canvasRef, capture, guidance, hasPermission, lightScore, blurScore } =
    useCameraCapture({ documentType });

  useSpeechGuidance(instruction || guidance);

  const handleTriggerCapture = async () => {
    if (!useCamera) return;
    setCountdown(3);
    let counter = 3;
    const timer = setInterval(async () => {
      counter -= 1;
      if (counter <= 0) {
        clearInterval(timer);
        setCountdown(null);
        const result = await capture();
        if (result) {
          onCapture(result);
        }
      } else {
        setCountdown(counter);
      }
    }, 1000);
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    onCapture({
      file,
      base64,
      metadata: {
        width: 0,
        height: 0,
        lightScore,
        blurScore,
        edgesDetected: true,
      },
    });
  };

  return (
    <section className={styles.captureShell}>
      {useCamera && hasPermission && (
        <div className={styles.preview} role="img" aria-label="Live camera preview">
          <video ref={videoRef} autoPlay muted playsInline />
          <canvas ref={canvasRef} className={styles.overlay} aria-hidden="true" />
          <div className={styles.feedback}>
            <p>{guidance}</p>
            <dl>
              <div>
                <dt>Light</dt>
                <dd>{Math.round(lightScore * 100)}%</dd>
              </div>
              <div>
                <dt>Clarity</dt>
                <dd>{Math.round(blurScore)}</dd>
              </div>
            </dl>
          </div>
          {countdown !== null && <div className={styles.countdown}>{countdown}</div>}
        </div>
      )}

      <div className={styles.actions}>
        {hasPermission === false && (
          <p role="alert">Camera permission denied. Use upload instead.</p>
        )}
        {useCamera && hasPermission && (
          <button type="button" onClick={handleTriggerCapture} className={styles.primary}>
            Capture
          </button>
        )}
        <label className={styles.secondary}>
          Upload
          <input type="file" accept="image/*" onChange={handleUpload} />
        </label>
        <button type="button" className={styles.ghost} onClick={() => setUseCamera(!useCamera)}>
          {useCamera ? 'Use upload fallback' : 'Use camera'}
        </button>
      </div>
    </section>
  );
}

async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return `data:${file.type};base64,${btoa(binary)}`;
}

