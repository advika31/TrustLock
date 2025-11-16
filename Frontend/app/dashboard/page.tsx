'use client';

import { useState } from 'react';
import ComplianceList from '@/components/ComplianceList';
import Modal from '@/components/Modal';
import CopilotSummary from '@/components/CopilotSummary';
import OCRResultViewer from '@/components/OCRResultViewer';
import XaiTrace from '@/components/XaiTrace';
import FaceMatchBadge from '@/components/FaceMatchBadge';
import { getApplication, appendAuditLog } from '@/lib/api';
import type { ApplicationDetails, XaiTrace as XaiTraceType } from '@/types';
import styles from './page.module.scss';

/**
 * Compliance officer dashboard
 * Lists applications with filters, search, and detailed review modal
 */
export default function DashboardPage() {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [applicationDetails, setApplicationDetails] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleItemClick = async (applicationId: string) => {
    setSelectedAppId(applicationId);
    setLoading(true);
    setError(null);

    try {
      const details = await getApplication(applicationId);
      setApplicationDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedAppId(null);
    setApplicationDetails(null);
    setError(null);
  };

  const handleAction = async (action: 'approve' | 'request_info' | 'reject') => {
    if (!selectedAppId || !applicationDetails) return;

    try {
      await appendAuditLog(selectedAppId, action, 'officer_123', {
        timestamp: new Date().toISOString(),
      });

      // Update local state
      setApplicationDetails({
        ...applicationDetails,
        status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'info_requested',
        audit_log: [
          ...applicationDetails.audit_log,
          {
            audit_id: `audit_${Date.now()}`,
            application_id: selectedAppId,
            action,
            actor: 'officer_123',
            timestamp: new Date().toISOString(),
            log_hash: 'mock_hash',
          },
        ],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform action');
    }
  };

  const xaiTrace: XaiTraceType | null = applicationDetails?.risk_assessment
    ? {
        application_id: applicationDetails.application_id,
        decision:
          applicationDetails.status === 'approved'
            ? 'approved'
            : applicationDetails.status === 'rejected'
            ? 'rejected'
            : 'flagged',
        confidence: applicationDetails.risk_assessment.risk_score,
        top_factors: applicationDetails.risk_assessment.explanations,
        reasoning_chain: [
          'Application submitted',
          'Documents verified',
          'Risk assessment completed',
          `Status: ${applicationDetails.status}`,
        ],
      }
    : null;

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <ComplianceList onItemClick={handleItemClick} />

        <Modal
          isOpen={!!selectedAppId}
          onClose={handleCloseModal}
          title={applicationDetails ? `Application: ${applicationDetails.application_id}` : 'Loading...'}
          size="large"
        >
          {loading && <div className={styles.loading}>Loading application details...</div>}
          {error && <div className={styles.error}>{error}</div>}
          {applicationDetails && !loading && (
            <div className={styles.modalContent}>
              <CopilotSummary
                applicationId={applicationDetails.application_id}
                onRegenerate={() => {
                  // Mock regenerate
                  console.log('Regenerate summary');
                }}
              />

              {applicationDetails.ocr_results && (
                <div className={styles.section}>
                  <h3>OCR Results</h3>
                  <OCRResultViewer
                    imageUrl={
                      applicationDetails.documents.find((d) => d.document_type === 'id_front')
                        ?.storage_path || ''
                    }
                    ocrJson={applicationDetails.ocr_results.ocr_json}
                    boundingBoxes={applicationDetails.ocr_results.ocr_json.bounding_boxes}
                  />
                </div>
              )}

              {applicationDetails.face_match && (
                <div className={styles.section}>
                  <h3>Face Match</h3>
                  <FaceMatchBadge
                    similarity={applicationDetails.face_match.similarity}
                    liveness={applicationDetails.face_match.liveness_result}
                    confidence={applicationDetails.face_match.confidence}
                  />
                </div>
              )}

              {xaiTrace && applicationDetails.risk_assessment && (
                <div className={styles.section}>
                  <h3>XAI Decision Trace</h3>
                  <XaiTrace trace={xaiTrace} riskResponse={applicationDetails.risk_assessment} />
                </div>
              )}

              <div className={styles.actions}>
                <button
                  onClick={() => handleAction('approve')}
                  className={styles.actionButton}
                  data-action="approve"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction('request_info')}
                  className={styles.actionButton}
                  data-action="request_info"
                >
                  Request Info
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  className={styles.actionButton}
                  data-action="reject"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

