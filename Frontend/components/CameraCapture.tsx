'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { CameraCaptureProps } from '@/types';
import styles from './CameraCapture.module.scss';

/**
 * CameraCapture component with live preview and guidance
 * Features:
 * - Live camera preview with getUserMedia
 * - Reactive guidance overlay (brightness, blur detection)
 * - File upload fallback
 * - Mock mode: "Use sample image" button
 * - Accessibility: proper ARIA labels, keyboard navigation
 */
export default function CameraCapture({
  onCapture,
  onError,
  documentType = 'id_front',
  aspectRatio = 4 / 3,
  showGuidance = true,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [guidance, setGuidance] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [useCamera, setUseCamera] = useState(true);
  const [brightness, setBrightness] = useState<number>(0.5);
  const [blur, setBlur] = useState<number>(0);

  const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK === 'true';

  // Initialize camera
  useEffect(() => {
    if (!useCamera || !videoRef.current) return;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: documentType === 'selfie' ? 'user' : 'environment',
            aspectRatio,
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setHasPermission(true);
        }
      } catch (error) {
        setHasPermission(false);
        if (onError) {
          onError(error as Error);
        }
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [useCamera, documentType, aspectRatio, onError]);

  // Analyze video for guidance
  useEffect(() => {
    if (!useCamera || !videoRef.current || !showGuidance || !hasPermission) return;

    const analyzeFrame = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Calculate brightness (average of RGB values)
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalBrightness += (r + g + b) / 3;
      }
      const avgBrightness = totalBrightness / (data.length / 4) / 255;
      setBrightness(avgBrightness);

      // Simple blur detection using Laplacian variance
      let variance = 0;
      let mean = 0;
      const laplacianKernel = [0, -1, 0, -1, 4, -1, 0, -1, 0];
      const laplacianValues: number[] = [];

      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * canvas.width + (x + kx)) * 4;
              const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
              sum += gray * laplacianKernel[(ky + 1) * 3 + (kx + 1)];
            }
          }
          laplacianValues.push(Math.abs(sum));
        }
      }

      if (laplacianValues.length > 0) {
        mean = laplacianValues.reduce((a, b) => a + b, 0) / laplacianValues.length;
        variance = laplacianValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / laplacianValues.length;
      }

      setBlur(variance);

      // Update guidance
      const guidanceMessages: string[] = [];
      if (avgBrightness < 0.3) {
        guidanceMessages.push('Move to a brighter area');
      } else if (avgBrightness > 0.9) {
        guidanceMessages.push('Reduce glare or move to less bright area');
      }
      if (variance < 100) {
        guidanceMessages.push('Hold steady and move closer');
      }
      if (guidanceMessages.length === 0) {
        guidanceMessages.push('Ready to capture');
      }

      setGuidance(guidanceMessages.join('. '));
    };

    const interval = setInterval(analyzeFrame, 500);
    return () => clearInterval(interval);
  }, [useCamera, showGuidance, hasPermission]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${documentType}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      }
    }, 'image/jpeg', 0.9);
  }, [documentType, onCapture]);

  const handleCapture = () => {
    if (isCapturing) return;

    setIsCapturing(true);
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          capturePhoto();
          setIsCapturing(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  const handleUseSample = () => {
    // Create a sample image (white canvas with text)
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#333';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Sample Document', canvas.width / 2, canvas.height / 2);
    }
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'sample.jpg', { type: 'image/jpeg' });
        onCapture(file);
      }
    }, 'image/jpeg');
  };

  if (hasPermission === false) {
    return (
      <div className={styles.error} role="alert">
        <p>Camera permission denied. Please use file upload instead.</p>
        <label className={styles.uploadButton}>
          Upload File
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className={styles.fileInput}
            aria-label="Upload document image"
          />
        </label>
      </div>
    );
  }

  return (
    <div className={styles.cameraCapture}>
      {useCamera && hasPermission && (
        <div className={styles.previewContainer}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.video}
            style={{ aspectRatio: `${aspectRatio}` }}
            aria-label={`Camera preview for ${documentType}`}
          />
          <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
          {showGuidance && guidance && (
            <div className={styles.guidance} role="status" aria-live="polite">
              {guidance}
            </div>
          )}
          {countdown !== null && (
            <div className={styles.countdown} role="status" aria-live="assertive">
              {countdown}
            </div>
          )}
        </div>
      )}

      <div className={styles.controls}>
        {!useCamera && (
          <label className={styles.uploadButton}>
            Choose File
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className={styles.fileInput}
              aria-label="Upload document image"
            />
          </label>
        )}

        {useCamera && hasPermission && (
          <button
            onClick={handleCapture}
            disabled={isCapturing || countdown !== null}
            className={styles.captureButton}
            aria-label="Capture photo"
          >
            {countdown !== null ? `Capturing in ${countdown}...` : 'Capture Photo'}
          </button>
        )}

        {MOCK_MODE && (
          <button
            onClick={handleUseSample}
            className={styles.sampleButton}
            aria-label="Use sample image (mock mode)"
          >
            Use Sample Image
          </button>
        )}

        <button
          onClick={() => setUseCamera(!useCamera)}
          className={styles.toggleButton}
          aria-label={useCamera ? 'Switch to file upload' : 'Switch to camera'}
        >
          {useCamera ? 'Switch to Upload' : 'Switch to Camera'}
        </button>
      </div>
    </div>
  );
}

