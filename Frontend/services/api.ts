import {
  AuditAppendResponse,
  FaceMatchPayload,
  FaceMatchResponse,
  KycApplication,
  RiskResponse,
  ScoreRiskPayload,
  StartKycPayload,
  UploadDocumentPayload,
} from '@/types';
import type { OfflineRequest } from './offlineQueue';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/mock';
const RETRIES = 2;
const TIMEOUT_MS = 15000;

interface RequestOptions extends RequestInit {
  retries?: number;
  timeout?: number;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const retries = options.retries ?? RETRIES;
  const timeout = options.timeout ?? TIMEOUT_MS;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
      clearTimeout(timer);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API error ${response.status} ${response.statusText}: ${errorText}`
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return (await response.json()) as T;
      }
      return (await response.text()) as T;
    } catch (error) {
      clearTimeout(timer);
      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  throw new Error('Request failed after retries');
}

export async function startKyc(payload: StartKycPayload) {
  return request<{ application_id: string; status: string; created_at: string }>(
    '/kyc/start',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function uploadDocument(payload: UploadDocumentPayload) {
  const base64 =
    typeof payload.file === 'string' ? payload.file : await fileToBase64(payload.file);

  return request<{
    storage_path: string;
    hash: string;
  }>('/store/upload', {
    method: 'POST',
    body: JSON.stringify({
      application_id: payload.application_id,
      document_type: payload.document_type,
      image_base64: base64,
    }),
  });
}

export async function callOCR(body: {
  application_id: string;
  document_type: string;
  image_base64: string;
}) {
  return request('/ocr', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function callFaceMatch(payload: FaceMatchPayload) {
  return request<FaceMatchResponse>('/face/match', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function callRiskScore(payload: ScoreRiskPayload) {
  return request<RiskResponse>('/risk/score', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function appendAudit(body: {
  application_id: string;
  action: string;
  actor: string;
  metadata?: Record<string, unknown>;
}) {
  return request<AuditAppendResponse>('/audit/append', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getReviewQueue() {
  return request<{
    applications: Array<{
      application_id: string;
      name: string;
      status: KycApplication['status'];
      risk_score: number;
      drpa_level: string;
      created_at: string;
    }>;
  }>('/review-queue', { method: 'GET' });
}

export async function getCase(id: string) {
  return request(`/case/${id}`, { method: 'GET' });
}

export async function actionCase(
  id: string,
  action: 'approve' | 'reject' | 'request_info',
  note?: string
) {
  return request(`/case/${id}`, {
    method: 'POST',
    body: JSON.stringify({ action, note }),
  });
}

export async function getStatus(applicationId: string) {
  return request(`/status/${applicationId}`, { method: 'GET' });
}

export async function getAdminSettings() {
  return request('/admin/settings', { method: 'GET' });
}

export async function updateAdminSettings(body: Record<string, unknown>) {
  return request('/admin/settings', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function triggerMonitoringEvent(body: {
  application_id: string;
  event_type: string;
}) {
  return request('/events', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function replayQueuedRequest(entry: OfflineRequest) {
  return fetch(`${API_BASE_URL}${entry.endpoint}`, {
    method: entry.method,
    headers: {
      'Content-Type': 'application/json',
      ...(entry.headers || {}),
    },
    body: entry.payload ? JSON.stringify(entry.payload) : undefined,
  });
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



