'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface CameraOptions {
  documentType?: string;
  aspectRatio?: number;
}

export interface CaptureResult {
  file: File;
  base64: string;
  metadata: {
    width: number;
    height: number;
    lightScore: number;
    blurScore: number;
    edgesDetected: boolean;
  };
}

export function useCameraCapture({ documentType, aspectRatio = 4 / 3 }: CameraOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [guidance, setGuidance] = useState('Initializing camera…');
  const [lightScore, setLightScore] = useState(0);
  const [blurScore, setBlurScore] = useState(0);
  const [edgesDetected, setEdgesDetected] = useState(false);

  const initCamera = useCallback(async () => {
    if (!navigator.mediaDevices) {
      setHasPermission(false);
      setGuidance('Camera not available. Use upload instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: documentType === 'selfie' ? 'user' : 'environment',
          aspectRatio,
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
      setGuidance('Align document within frame. Hold steady.');
    } catch (error) {
      console.error(error);
      setHasPermission(false);
      setGuidance('Camera permission denied. Use upload fallback.');
    }
  }, [aspectRatio, documentType]);

  useEffect(() => {
    void initCamera();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [initCamera]);

  useEffect(() => {
    const interval = setInterval(() => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || !hasPermission) return;
      const ctx = canvas.getContext('2d');
      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { avgBrightness, laplacianVariance, edgeConfidence } = analyzeFrame(imageData);

      setLightScore(avgBrightness);
      setBlurScore(laplacianVariance);
      setEdgesDetected(edgeConfidence > 0.5);

      const messages: string[] = [];
      if (avgBrightness < 0.35) messages.push('Too dark. Move near light.');
      if (avgBrightness > 0.9) messages.push('Reduce glare.');
      if (laplacianVariance < 80) messages.push('Image looks blurry. Hold steady.');
      if (edgeConfidence < 0.4) messages.push('Move closer so edges fill the overlay.');
      if (messages.length === 0) messages.push('Great! Tap capture when ready.');
      setGuidance(messages.join(' '));
    }, 600);
    return () => clearInterval(interval);
  }, [hasPermission]);

  const capture = useCallback(async (): Promise<CaptureResult | null> => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    autoEnhanceCanvas(ctx, canvas.width, canvas.height);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error('Unable to capture frame'));
            return;
          }
          const file = new File([blob], `${documentType || 'document'}.jpg`, {
            type: 'image/jpeg',
          });
          const base64 = await fileToBase64(file);
          resolve({
            file,
            base64,
            metadata: {
              width: canvas.width,
              height: canvas.height,
              lightScore,
              blurScore,
              edgesDetected,
            },
          });
        },
        'image/jpeg',
        0.92
      );
    });
  }, [blurScore, documentType, edgesDetected, lightScore]);

  const stop = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  return {
    videoRef,
    canvasRef,
    hasPermission,
    guidance,
    lightScore,
    blurScore,
    edgesDetected,
    capture,
    stop,
  };
}

function analyzeFrame(imageData: ImageData) {
  const { data, width, height } = imageData;
  let brightnessSum = 0;
  const laplacianKernel = [0, -1, 0, -1, 4, -1, 0, -1, 0];
  const responses: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    brightnessSum += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  const avgBrightness = brightnessSum / (data.length / 4) / 255;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          sum += gray * laplacianKernel[(ky + 1) * 3 + (kx + 1)];
        }
      }
      responses.push(Math.abs(sum));
    }
  }

  const mean = responses.reduce((acc, val) => acc + val, 0) / responses.length;
  const laplacianVariance =
    responses.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / responses.length;

  const edgeConfidence = measureEdges(imageData);

  return { avgBrightness, laplacianVariance, edgeConfidence };
}

function measureEdges(imageData: ImageData) {
  const { data, width, height } = imageData;
  const perimeterSamples = 200;
  let edgeMatches = 0;
  for (let i = 0; i < perimeterSamples; i++) {
    const x = Math.floor((i / perimeterSamples) * (width - 1));
    const y = Math.floor((i / perimeterSamples) * (height - 1));
    const idx = (y * width + x) * 4;
    const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    if (gray < 60 || gray > 200) {
      edgeMatches += 1;
    }
  }
  return edgeMatches / perimeterSamples;
}

function autoEnhanceCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  let min = 255;
  let max = 0;
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    min = Math.min(min, gray);
    max = Math.max(max, gray);
  }
  const contrast = 255 / (max - min || 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp((data[i] - min) * contrast);
    data[i + 1] = clamp((data[i + 1] - min) * contrast);
    data[i + 2] = clamp((data[i + 2] - min) * contrast);
  }

  ctx.putImageData(imageData, 0, 0);

  deskewCanvas(ctx, width, height);
  autoCrop(ctx, width, height);
}

function deskewCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const topStrip = ctx.getImageData(0, 0, width, 1);
  const bottomStrip = ctx.getImageData(0, height - 1, width, 1);
  const avgTop = averageRow(topStrip.data);
  const avgBottom = averageRow(bottomStrip.data);
  const tilt = Math.max(Math.min((avgBottom - avgTop) / 5000, 0.02), -0.02);
  if (Math.abs(tilt) < 0.002) return;
  ctx.setTransform(1, tilt, -tilt, 1, 0, 0);
  ctx.drawImage(ctx.canvas, 0, 0, width, height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function averageRow(data: Uint8ClampedArray) {
  let total = 0;
  const sample = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    total += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  return total / sample;
}

function autoCrop(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const margin = 0.05;
  const cropWidth = width * (1 - margin * 2);
  const cropHeight = height * (1 - margin * 2);
  const image = ctx.getImageData(
    width * margin,
    height * margin,
    cropWidth,
    cropHeight
  );
  ctx.canvas.width = cropWidth;
  ctx.canvas.height = cropHeight;
  ctx.putImageData(image, 0, 0);
}

function clamp(value: number) {
  return Math.max(0, Math.min(255, value));
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

