import { EventEmitter } from 'events';
import crypto from 'crypto';
import {
  AuditLogEntry,
  FaceMatchResponse,
  KycApplication,
  RiskExplanation,
  RiskResponse,
} from '@/types';

type ApplicationStatus = KycApplication['status'];

interface ApplicationRecord {
  application_id: string;
  name: string;
  email: string;
  phone: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  method: 'DOC' | 'SSI' | 'BRANCH';
  risk_score: number;
  drpa_level: 'low' | 'medium' | 'high';
  audit_log: AuditLogEntry[];
  documents: Array<{
    document_type: string;
    url: string;
    uploaded_at: string;
  }>;
  face_match?: FaceMatchResponse;
  risk?: RiskResponse;
}

const applications = new Map<string, ApplicationRecord>();
const reviewQueue: ApplicationRecord[] = [];
const monitoringEvents: MonitoringEvent[] = [];
const adminSettings = {
  thresholds: { low: 40, high: 75 },
  modelVersion: 'TRUSTLOCK-RISK-v2.3.1',
  webhookUrl: 'https://hooks.trustlock.mock/risk',
};

const eventBus = new EventEmitter();

export interface MonitoringEvent {
  id: string;
  application_id: string;
  event_type: string;
  message: string;
  timestamp: string;
  risk_score?: number;
}

export function ensureSeedData() {
  if (applications.size > 0) return;
  const now = new Date();
  const baseCases: Array<Partial<ApplicationRecord> & { name: string }> = [
    {
      name: 'Ava Patel',
      email: 'ava.patel@example.com',
      phone: '+1-555-0001',
      status: 'approved',
      method: 'DOC',
      risk_score: 18,
      drpa_level: 'low',
    },
    {
      name: 'Rafael Torres',
      email: 'rafael.torres@example.com',
      phone: '+34-600-123-456',
      status: 'flagged',
      method: 'DOC',
      risk_score: 78,
      drpa_level: 'high',
    },
    {
      name: 'Neha Singh',
      email: 'neha.singh@example.com',
      phone: '+91-800-112-2233',
      status: 'pending',
      method: 'SSI',
      risk_score: 42,
      drpa_level: 'medium',
    },
  ];

  baseCases.forEach((entry, index) => {
    const id = crypto.randomUUID();
    const record: ApplicationRecord = {
      application_id: id,
      name: entry.name,
      email: entry.email!,
      phone: entry.phone!,
      status: entry.status as ApplicationStatus,
      created_at: new Date(now.getTime() - index * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - index * 1800 * 1000).toISOString(),
      method: entry.method as ApplicationRecord['method'],
      risk_score: entry.risk_score!,
      drpa_level: entry.drpa_level!,
      audit_log: [],
      documents: [],
      risk: buildRiskResponse(id, entry.risk_score!, entry.drpa_level!),
    };
    applications.set(id, record);
    reviewQueue.push(record);
  });

  appendMonitoringEvent({
    id: crypto.randomUUID(),
    application_id: Array.from(applications.keys())[1],
    event_type: 'sanctions_hit',
    message: 'OFAC secondary match detected for beneficiary',
    timestamp: new Date().toISOString(),
    risk_score: 82,
  });
}

export function startKycRecord(payload: {
  name: string;
  email: string;
  phone: string;
  method: 'DOC' | 'SSI' | 'BRANCH';
}) {
  ensureSeedData();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const record: ApplicationRecord = {
    application_id: id,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    status: 'pending',
    created_at: now,
    updated_at: now,
    method: payload.method,
    risk_score: 0,
    drpa_level: 'low',
    audit_log: [],
    documents: [],
  };
  applications.set(id, record);
  reviewQueue.unshift(record);
  appendAuditLog(id, 'Application started', 'system');
  return record;
}

export function listReviewQueue() {
  ensureSeedData();
  return reviewQueue.map((app) => ({
    application_id: app.application_id,
    name: app.name,
    status: app.status,
    risk_score: app.risk_score,
    drpa_level: app.drpa_level,
    created_at: app.created_at,
  }));
}

export function getApplication(id: string) {
  ensureSeedData();
  return applications.get(id);
}

export function appendDocument(
  id: string,
  document_type: string,
  image_base64: string
) {
  const app = getApplication(id);
  if (!app) throw new Error('Application not found');
  const doc = {
    document_type,
    url: image_base64,
    uploaded_at: new Date().toISOString(),
  };
  app.documents.push(doc);
  app.updated_at = new Date().toISOString();
  appendAuditLog(id, `Uploaded ${document_type}`, 'applicant');
  return doc;
}

export function appendAuditLog(
  application_id: string,
  action: string,
  actor: string,
  metadata?: Record<string, unknown>
) {
  const app = getApplication(application_id);
  if (!app) return null;
  const entry: AuditLogEntry = {
    audit_id: crypto.randomUUID(),
    application_id,
    action,
    actor,
    timestamp: new Date().toISOString(),
    metadata,
    log_hash: crypto.randomUUID(),
  };
  app.audit_log.unshift(entry);
  return entry;
}

export function persistFaceMatch(
  application_id: string,
  result: Pick<FaceMatchResponse, 'similarity' | 'liveness_result'>
) {
  const app = getApplication(application_id);
  if (!app) return null;
  const faceMatch: FaceMatchResponse = {
    application_id,
    similarity: result.similarity,
    liveness_result: result.liveness_result,
    embedding_hash: crypto.randomUUID(),
    confidence: result.similarity,
  };
  app.face_match = faceMatch;
  appendAuditLog(application_id, 'Face match evaluated', 'system', faceMatch);
  return faceMatch;
}

export function persistRisk(application_id: string, score: number, level: 'low' | 'medium' | 'high') {
  const app = getApplication(application_id);
  if (!app) return null;
  const risk = buildRiskResponse(application_id, score, level);
  app.risk = risk;
  app.risk_score = score;
  app.drpa_level = level;
  appendAuditLog(application_id, 'Risk score refreshed', 'system', risk);
  return risk;
}

function buildRiskResponse(
  application_id: string,
  score: number,
  level: 'low' | 'medium' | 'high'
): RiskResponse {
  const factors: RiskExplanation[] = [
    {
      factor: 'face_similarity',
      weight: 0.3,
      contribution: score / 100,
      description: 'Compares selfie and document headshot embeddings.',
      suggested_action: score > 70 ? 'flag' : 'approve',
    },
    {
      factor: 'document_authenticity',
      weight: 0.25,
      contribution: (100 - score) / 120,
      description: 'Edge, hologram, and template checks.',
    },
    {
      factor: 'watchlist_match',
      weight: 0.2,
      contribution: score > 60 ? 0.4 : 0.1,
      description: 'Sanctions and PEP screening confidence.',
      suggested_action: score > 80 ? 'request_info' : undefined,
    },
  ];
  return {
    application_id,
    risk_score: score,
    drpa_level: level,
    explanations: factors,
    audit_id: `audit_${application_id}`,
    factors: {
      document_authenticity: pseudoRandom(application_id, 'doc'),
      face_match_confidence: pseudoRandom(application_id, 'face'),
      data_consistency: pseudoRandom(application_id, 'data'),
      watchlist_match: pseudoRandom(application_id, 'watch'),
      behavioral_anomalies: pseudoRandom(application_id, 'behavior'),
    },
  };
}

export function updateCaseStatus(
  application_id: string,
  action: 'approve' | 'reject' | 'request_info',
  note?: string
) {
  const app = getApplication(application_id);
  if (!app) throw new Error('Application not found');
  let status: ApplicationStatus = app.status;
  if (action === 'approve') status = 'approved';
  if (action === 'reject') status = 'rejected';
  if (action === 'request_info') status = 'info_requested';
  app.status = status;
  app.updated_at = new Date().toISOString();
  appendAuditLog(application_id, `Case ${action}`, 'officer', { note });
  return app;
}

export function getAdminConfig() {
  return adminSettings;
}

export function updateAdminConfig(payload: Partial<typeof adminSettings>) {
  Object.assign(adminSettings, payload);
  return adminSettings;
}

export function appendMonitoringEvent(event: MonitoringEvent) {
  monitoringEvents.unshift(event);
  eventBus.emit('event', event);
}

export function listMonitoringEvents() {
  ensureSeedData();
  return monitoringEvents;
}

export function subscribeToEvents(handler: (event: MonitoringEvent) => void) {
  eventBus.on('event', handler);
  return () => eventBus.off('event', handler);
}

function pseudoRandom(seed: string, salt: string) {
  const hash = crypto.createHash('sha256').update(`${seed}-${salt}`).digest('hex');
  return parseInt(hash.slice(0, 6), 16) / 0xffffff;
}

