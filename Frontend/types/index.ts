/**
 * TypeScript interfaces matching TrustLock shared_schemas
 * These define the expected request/response shapes for all backend integrations
 */

// ============================================================================
// KYC Application Types
// ============================================================================

export interface KycApplication {
  application_id: string;
  user_id?: string;
  status: 'pending' | 'approved' | 'flagged' | 'rejected' | 'info_requested';
  created_at: string; // ISO 8601 timestamp
  updated_at: string;
  risk_score?: number; // 0.0 to 1.0
  drpa_level?: 'low' | 'medium' | 'high';
}

export interface ApplicationSummary {
  application_id: string;
  applicant_name: string;
  status: KycApplication['status'];
  risk_score: number;
  last_event_timestamp: string;
  created_at: string;
}

export interface ApplicationDetails extends KycApplication {
  documents: DocumentUploadResponse[];
  ocr_results?: OcrResponse;
  face_match?: FaceMatchResponse;
  risk_assessment?: RiskResponse;
  audit_log: AuditLogEntry[];
}

// ============================================================================
// Document Upload Types
// ============================================================================

export interface DocumentUploadResponse {
  application_id: string;
  document_id: string;
  document_type: 'id_front' | 'id_back' | 'address_proof' | 'selfie';
  storage_path: string;
  hash: string; // SHA256
  uploaded_at: string;
  mime_type: string;
}

// ============================================================================
// OCR Response Types
// ============================================================================

export interface OcrResponse {
  application_id: string;
  ocr_json: {
    name?: string;
    date_of_birth?: string;
    address?: string;
    document_number?: string;
    expiry_date?: string;
    nationality?: string;
    // Bounding boxes for each field: [x, y, width, height] in normalized coordinates (0-1)
    bounding_boxes?: {
      name?: [number, number, number, number];
      date_of_birth?: [number, number, number, number];
      address?: [number, number, number, number];
      document_number?: [number, number, number, number];
      expiry_date?: [number, number, number, number];
    };
  };
  doc_confidence: number; // 0.0 to 1.0
  doc_hash: string; // SHA256 of document image
  face_image_hash?: string; // SHA256 of extracted face from ID
}

// ============================================================================
// Face Match Types
// ============================================================================

export interface FaceMatchResponse {
  application_id: string;
  similarity: number; // 0.0 to 1.0
  liveness_result: 'passed' | 'failed' | 'unknown';
  embedding_hash: string; // SHA256 of face embedding
  confidence: number; // 0.0 to 1.0
}

// ============================================================================
// Risk Scoring Types
// ============================================================================

export interface RiskResponse {
  application_id: string;
  risk_score: number; // 0.0 to 1.0
  drpa_level: 'low' | 'medium' | 'high';
  explanations: RiskExplanation[];
  audit_id: string;
  factors: {
    document_authenticity: number;
    face_match_confidence: number;
    data_consistency: number;
    watchlist_match: number;
    behavioral_anomalies: number;
  };
}

export interface RiskExplanation {
  factor: string;
  weight: number; // 0.0 to 1.0
  contribution: number; // -1.0 to 1.0 (negative = reduces risk, positive = increases risk)
  description: string;
  suggested_action?: 'approve' | 'flag' | 'request_info' | 'reject';
}

// ============================================================================
// XAI Decision Trace Types
// ============================================================================

export interface XaiTrace {
  application_id: string;
  decision: 'approved' | 'flagged' | 'rejected';
  confidence: number;
  top_factors: RiskExplanation[];
  reasoning_chain: string[];
  model_version?: string;
}

// ============================================================================
// Storage Types
// ============================================================================

export interface StorageUploadResponse {
  storage_path: string;
  hash: string; // SHA256
  url?: string; // Optional pre-signed URL
}

// ============================================================================
// Audit Log Types
// ============================================================================

export interface AuditLogEntry {
  audit_id: string;
  application_id: string;
  action: string;
  actor: string; // 'system' | 'officer_id' | 'applicant'
  timestamp: string;
  metadata?: Record<string, unknown>;
  log_hash: string; // SHA256 of log entry
}

export interface AuditAppendResponse {
  log_hash: string;
}

// ============================================================================
// SSI/Verifiable Credential Types (Mock)
// ============================================================================

export interface SSIVerifyRequest {
  credential_jwt: string;
  presentation_request?: Record<string, unknown>;
}

export interface SSIVerifyResponse {
  verified: boolean;
  attributes: {
    name?: string;
    date_of_birth?: string;
    address?: string;
    document_number?: string;
  };
  issuer: string;
  credential_hash: string;
}

// ============================================================================
// API Request Types
// ============================================================================

export interface StartKycPayload {
  user_id?: string;
  method: 'upload' | 'ssi' | 'branch';
  metadata?: Record<string, unknown>;
}

export interface UploadDocumentPayload {
  application_id: string;
  document_type: DocumentUploadResponse['document_type'];
  file: File | string; // File object or base64 string
}

export interface InferDocumentPayload {
  application_id: string;
  image_base64: string; // Base64 encoded image
  document_type?: string;
}

export interface FaceMatchPayload {
  application_id: string;
  id_photo_base64: string;
  selfie_base64: string;
}

export interface ScoreRiskPayload {
  application_id: string;
  features: {
    ocr_results?: OcrResponse;
    face_match?: FaceMatchResponse;
    document_hashes?: string[];
    metadata?: Record<string, unknown>;
  };
}

export interface ListApplicationsFilter {
  status?: KycApplication['status'];
  risk_level?: RiskResponse['drpa_level'];
  date_from?: string;
  date_to?: string;
  search?: string;
}

// ============================================================================
// UI Component Props Types
// ============================================================================

export interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onError?: (error: Error) => void;
  documentType?: DocumentUploadResponse['document_type'];
  aspectRatio?: number;
  showGuidance?: boolean;
}

export interface DocumentCardProps {
  document: DocumentUploadResponse;
  onRecapture?: () => void;
  imageUrl?: string;
}

export interface OCRResultViewerProps {
  imageUrl: string;
  ocrJson: OcrResponse['ocr_json'];
  boundingBoxes?: OcrResponse['ocr_json']['bounding_boxes'];
}

export interface FaceMatchBadgeProps {
  similarity: number;
  liveness: FaceMatchResponse['liveness_result'];
  confidence?: number;
}

export interface XaiTraceProps {
  trace: XaiTrace;
  riskResponse?: RiskResponse;
}

export interface CopilotSummaryProps {
  applicationId: string;
  summary?: string;
  onRegenerate?: () => void;
}

