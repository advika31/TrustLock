/**
 * TrustLock Frontend API Client
 * 
 * This module provides typed functions for all backend integration points.
 * In MOCK mode, returns deterministic sample data matching shared_schemas.
 * In REAL mode, performs fetch calls to configured backend endpoints.
 * 
 * Integration points:
 * - Person A: OCR Service (POST /infer/document)
 * - Person B: Face Match Service (POST /face/match)
 * - Person C: Risk Scoring Service (POST /score)
 * - Person D: Storage Service (POST /store/upload)
 * - Audit Service: (POST /audit/append)
 */

import type {
  KycApplication,
  ApplicationSummary,
  ApplicationDetails,
  DocumentUploadResponse,
  OcrResponse,
  FaceMatchResponse,
  RiskResponse,
  StorageUploadResponse,
  AuditAppendResponse,
  StartKycPayload,
  UploadDocumentPayload,
  InferDocumentPayload,
  FaceMatchPayload,
  ScoreRiskPayload,
  ListApplicationsFilter,
  SSIVerifyRequest,
  SSIVerifyResponse,
} from '@/types';

// ============================================================================
// Configuration
// ============================================================================

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK === 'true';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
const OCR_URL = process.env.NEXT_PUBLIC_OCR_URL || 'http://localhost:8001';
const RISK_URL = process.env.NEXT_PUBLIC_RISK_URL || 'http://localhost:8002';
const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8003';
const AUTH_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN;

// ============================================================================
// Fetch Helper with Error Handling
// ============================================================================

async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add JWT token if available (for staff/admin endpoints)
  if (AUTH_TOKEN) {
    headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    // Add timeout (10 seconds)
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response;
}

// ============================================================================
// File to Base64 Helper
// ============================================================================

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// Mock Data Generators
// ============================================================================

function generateMockApplicationId(): string {
  return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateMockHash(): string {
  return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function generateMockTimestamp(): string {
  return new Date().toISOString();
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Start a new KYC application
 * Endpoint: POST ${API_BASE}/kyc/start
 * 
 * Request body: { user_id?, method, metadata? }
 * Response: KycApplication
 */
export async function startKyc(payload: StartKycPayload): Promise<KycApplication> {
  if (MOCK_MODE) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      application_id: generateMockApplicationId(),
      user_id: payload.user_id,
      status: 'pending',
      created_at: generateMockTimestamp(),
      updated_at: generateMockTimestamp(),
    };
  }

  const response = await fetchWithAuth(`${API_BASE}/kyc/start`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Upload a document (ID front/back, address proof, selfie)
 * Endpoint: POST ${STORAGE_URL}/store/upload
 * 
 * Request: multipart/form-data or JSON with base64
 * Response: DocumentUploadResponse
 */
export async function uploadDocument(
  payload: UploadDocumentPayload
): Promise<DocumentUploadResponse> {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const file = typeof payload.file === 'string' ? null : payload.file;
    const hash = generateMockHash();
    
    return {
      application_id: payload.application_id,
      document_id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      document_type: payload.document_type,
      storage_path: `/storage/${payload.application_id}/${payload.document_type}/${hash}.jpg`,
      hash,
      uploaded_at: generateMockTimestamp(),
      mime_type: file?.type || 'image/jpeg',
    };
  }

  // In real mode, convert File to base64 or use FormData
  let body: string | FormData;
  let headers: HeadersInit = {};

  if (typeof payload.file === 'string') {
    // Already base64
    body = JSON.stringify({
      application_id: payload.application_id,
      document_type: payload.document_type,
      file_base64: payload.file,
    });
    headers['Content-Type'] = 'application/json';
  } else {
    // Use FormData for file upload
    const formData = new FormData();
    formData.append('application_id', payload.application_id);
    formData.append('document_type', payload.document_type);
    formData.append('file', payload.file);
    body = formData;
    // Don't set Content-Type, let browser set it with boundary
  }

  const response = await fetchWithAuth(`${STORAGE_URL}/store/upload`, {
    method: 'POST',
    headers,
    body,
  });

  return response.json();
}

/**
 * Run OCR inference on a document image
 * Endpoint: POST ${OCR_URL}/infer/document
 * 
 * Request: { application_id, image_base64, document_type? }
 * Response: OcrResponse
 * 
 * Expected ocr_json shape:
 * {
 *   name?: string,
 *   date_of_birth?: string,
 *   address?: string,
 *   document_number?: string,
 *   expiry_date?: string,
 *   nationality?: string,
 *   bounding_boxes?: { ... }
 * }
 */
export async function inferDocument(
  payload: InferDocumentPayload
): Promise<OcrResponse> {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate realistic mock OCR data
    const mockNames = ['John Doe', 'Jane Smith', 'Ahmed Hassan', 'Maria Garcia'];
    const mockAddresses = [
      '123 Main St, New York, NY 10001',
      '456 Oak Ave, Los Angeles, CA 90001',
      '789 Elm Rd, Chicago, IL 60601',
    ];
    
    return {
      application_id: payload.application_id,
      ocr_json: {
        name: mockNames[Math.floor(Math.random() * mockNames.length)],
        date_of_birth: '1990-05-15',
        address: mockAddresses[Math.floor(Math.random() * mockAddresses.length)],
        document_number: `DL${Math.random().toString().substr(2, 8)}`,
        expiry_date: '2028-12-31',
        nationality: 'US',
        bounding_boxes: {
          name: [0.1, 0.2, 0.4, 0.05],
          date_of_birth: [0.1, 0.3, 0.3, 0.05],
          address: [0.1, 0.4, 0.6, 0.1],
          document_number: [0.1, 0.5, 0.4, 0.05],
        },
      },
      doc_confidence: 0.92 + Math.random() * 0.08,
      doc_hash: generateMockHash(),
      face_image_hash: generateMockHash(),
    };
  }

  const response = await fetchWithAuth(`${OCR_URL}/infer/document`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Perform face matching between ID photo and selfie
 * Endpoint: POST ${API_BASE}/face/match
 * 
 * Request: { application_id, id_photo_base64, selfie_base64 }
 * Response: FaceMatchResponse
 * 
 * Expected response:
 * {
 *   application_id: string,
 *   similarity: number (0.0-1.0),
 *   liveness_result: 'passed' | 'failed' | 'unknown',
 *   embedding_hash: string (SHA256),
 *   confidence: number (0.0-1.0)
 * }
 */
export async function faceMatch(payload: FaceMatchPayload): Promise<FaceMatchResponse> {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Simulate varying similarity scores
    const similarity = 0.75 + Math.random() * 0.2; // 0.75-0.95
    
    return {
      application_id: payload.application_id,
      similarity,
      liveness_result: similarity > 0.85 ? 'passed' : 'unknown',
      embedding_hash: generateMockHash(),
      confidence: similarity * 0.95,
    };
  }

  const response = await fetchWithAuth(`${API_BASE}/face/match`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Score risk for an application
 * Endpoint: POST ${RISK_URL}/score
 * 
 * Request: { application_id, features: { ocr_results?, face_match?, document_hashes?, metadata? } }
 * Response: RiskResponse
 * 
 * Expected response:
 * {
 *   application_id: string,
 *   risk_score: number (0.0-1.0),
 *   drpa_level: 'low' | 'medium' | 'high',
 *   explanations: Array<{ factor, weight, contribution, description, suggested_action? }>,
 *   audit_id: string,
 *   factors: { document_authenticity, face_match_confidence, data_consistency, watchlist_match, behavioral_anomalies }
 * }
 */
export async function scoreRisk(payload: ScoreRiskPayload): Promise<RiskResponse> {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const riskScore = 0.2 + Math.random() * 0.5; // 0.2-0.7
    const drpaLevel: RiskResponse['drpa_level'] = 
      riskScore < 0.4 ? 'low' : riskScore < 0.6 ? 'medium' : 'high';
    
    const explanations: RiskResponse['explanations'] = [
      {
        factor: 'Document Authenticity',
        weight: 0.3,
        contribution: riskScore > 0.5 ? 0.4 : -0.2,
        description: riskScore > 0.5 
          ? 'Document shows signs of tampering or low confidence OCR match'
          : 'Document authenticity verified with high confidence',
        suggested_action: riskScore > 0.5 ? 'flag' : 'approve',
      },
      {
        factor: 'Face Match Confidence',
        weight: 0.25,
        contribution: payload.features.face_match 
          ? (payload.features.face_match.similarity - 0.85) * 2
          : 0.1,
        description: payload.features.face_match?.similarity 
          ? `Face similarity: ${(payload.features.face_match.similarity * 100).toFixed(1)}%`
          : 'Face match not performed',
        suggested_action: payload.features.face_match?.similarity && payload.features.face_match.similarity > 0.9 
          ? 'approve' : 'flag',
      },
      {
        factor: 'Data Consistency',
        weight: 0.2,
        contribution: Math.random() * 0.3 - 0.15,
        description: 'OCR extracted data is consistent across documents',
        suggested_action: 'approve',
      },
      {
        factor: 'Watchlist Match',
        weight: 0.15,
        contribution: riskScore > 0.6 ? 0.3 : -0.1,
        description: riskScore > 0.6 
          ? 'Potential match found in watchlist (requires manual review)'
          : 'No matches found in watchlist databases',
        suggested_action: riskScore > 0.6 ? 'flag' : 'approve',
      },
      {
        factor: 'Behavioral Anomalies',
        weight: 0.1,
        contribution: Math.random() * 0.2 - 0.1,
        description: 'No significant behavioral anomalies detected',
        suggested_action: 'approve',
      },
    ];
    
    return {
      application_id: payload.application_id,
      risk_score: riskScore,
      drpa_level: drpaLevel,
      explanations,
      audit_id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      factors: {
        document_authenticity: 0.85 + Math.random() * 0.1,
        face_match_confidence: payload.features.face_match?.confidence || 0.8,
        data_consistency: 0.9 + Math.random() * 0.1,
        watchlist_match: riskScore > 0.6 ? 0.3 : 0.05,
        behavioral_anomalies: 0.1 + Math.random() * 0.1,
      },
    };
  }

  const response = await fetchWithAuth(`${RISK_URL}/score`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * List applications with filters (for compliance dashboard)
 * Endpoint: GET ${API_BASE}/applications?status=...&risk_level=...&date_from=...&date_to=...&search=...
 * 
 * Response: ApplicationSummary[]
 */
export async function listApplications(
  filter: ListApplicationsFilter = {}
): Promise<ApplicationSummary[]> {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockApplications: ApplicationSummary[] = [
      {
        application_id: 'app_001',
        applicant_name: 'John Doe',
        status: 'flagged',
        risk_score: 0.65,
        last_event_timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        application_id: 'app_002',
        applicant_name: 'Jane Smith',
        status: 'approved',
        risk_score: 0.25,
        last_event_timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        application_id: 'app_003',
        applicant_name: 'Ahmed Hassan',
        status: 'pending',
        risk_score: 0.45,
        last_event_timestamp: new Date(Date.now() - 1800000).toISOString(),
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        application_id: 'app_004',
        applicant_name: 'Maria Garcia',
        status: 'info_requested',
        risk_score: 0.55,
        last_event_timestamp: new Date(Date.now() - 7200000).toISOString(),
        created_at: new Date(Date.now() - 259200000).toISOString(),
      },
    ];
    
    // Apply filters
    let filtered = [...mockApplications];
    
    if (filter.status) {
      filtered = filtered.filter(app => app.status === filter.status);
    }
    
    if (filter.risk_level) {
      const riskMap: Record<string, [number, number]> = {
        low: [0, 0.4],
        medium: [0.4, 0.6],
        high: [0.6, 1.0],
      };
      const [min, max] = riskMap[filter.risk_level] || [0, 1];
      filtered = filtered.filter(app => app.risk_score >= min && app.risk_score < max);
    }
    
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicant_name.toLowerCase().includes(searchLower) ||
        app.application_id.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }

  const params = new URLSearchParams();
  if (filter.status) params.append('status', filter.status);
  if (filter.risk_level) params.append('risk_level', filter.risk_level);
  if (filter.date_from) params.append('date_from', filter.date_from);
  if (filter.date_to) params.append('date_to', filter.date_to);
  if (filter.search) params.append('search', filter.search);

  const response = await fetchWithAuth(`${API_BASE}/applications?${params.toString()}`);
  return response.json();
}

/**
 * Get detailed application data
 * Endpoint: GET ${API_BASE}/applications/:application_id
 * 
 * Response: ApplicationDetails
 */
export async function getApplication(applicationId: string): Promise<ApplicationDetails> {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock detailed application
    return {
      application_id: applicationId,
      status: 'flagged',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      risk_score: 0.65,
      drpa_level: 'medium',
      documents: [
        {
          application_id: applicationId,
          document_id: 'doc_001',
          document_type: 'id_front',
          storage_path: '/storage/mock/id_front.jpg',
          hash: generateMockHash(),
          uploaded_at: new Date(Date.now() - 86400000).toISOString(),
          mime_type: 'image/jpeg',
        },
        {
          application_id: applicationId,
          document_id: 'doc_002',
          document_type: 'selfie',
          storage_path: '/storage/mock/selfie.jpg',
          hash: generateMockHash(),
          uploaded_at: new Date(Date.now() - 86350000).toISOString(),
          mime_type: 'image/jpeg',
        },
      ],
      ocr_results: {
        application_id: applicationId,
        ocr_json: {
          name: 'John Doe',
          date_of_birth: '1990-05-15',
          address: '123 Main St, New York, NY 10001',
          document_number: 'DL12345678',
        },
        doc_confidence: 0.92,
        doc_hash: generateMockHash(),
      },
      face_match: {
        application_id: applicationId,
        similarity: 0.88,
        liveness_result: 'passed',
        embedding_hash: generateMockHash(),
        confidence: 0.85,
      },
      risk_assessment: await scoreRisk({
        application_id: applicationId,
        features: {},
      }),
      audit_log: [
        {
          audit_id: 'audit_001',
          application_id: applicationId,
          action: 'application_created',
          actor: 'system',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          log_hash: generateMockHash(),
        },
      ],
    };
  }

  const response = await fetchWithAuth(`${API_BASE}/applications/${applicationId}`);
  return response.json();
}

/**
 * Append audit log entry
 * Endpoint: POST ${API_BASE}/audit/append
 * 
 * Request: { application_id, action, actor, metadata? }
 * Response: AuditAppendResponse
 */
export async function appendAuditLog(
  applicationId: string,
  action: string,
  actor: string,
  metadata?: Record<string, unknown>
): Promise<AuditAppendResponse> {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { log_hash: generateMockHash() };
  }

  const response = await fetchWithAuth(`${API_BASE}/audit/append`, {
    method: 'POST',
    body: JSON.stringify({
      application_id: applicationId,
      action,
      actor,
      metadata,
    }),
  });

  return response.json();
}

/**
 * Verify SSI/Verifiable Credential (Mock)
 * Endpoint: POST ${API_BASE}/ssi/verify
 * 
 * Request: { credential_jwt, presentation_request? }
 * Response: SSIVerifyResponse
 */
export async function verifySSI(payload: SSIVerifyRequest): Promise<SSIVerifyResponse> {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      verified: true,
      attributes: {
        name: 'John Doe',
        date_of_birth: '1990-05-15',
        address: '123 Main St, New York, NY 10001',
        document_number: 'VC12345678',
      },
      issuer: 'did:example:issuer',
      credential_hash: generateMockHash(),
    };
  }

  const response = await fetchWithAuth(`${API_BASE}/ssi/verify`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.json();
}

// Export configuration for UI components
export const API_CONFIG = {
  MOCK_MODE,
  API_BASE,
  OCR_URL,
  RISK_URL,
  STORAGE_URL,
};

