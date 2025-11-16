'use client';

import { useState, useEffect } from 'react';
import { API_CONFIG } from '@/lib/api';
import styles from './page.module.scss';

/**
 * Admin integrations page
 * Shows integration points, toggles for mock vs real, editable base URLs
 * Displays shared_schemas JSON snippets for each endpoint
 */
export default function IntegrationsPage() {
  const [mockMode, setMockMode] = useState(API_CONFIG.MOCK_MODE);
  const [apiBase, setApiBase] = useState(API_CONFIG.API_BASE);
  const [ocrUrl, setOcrUrl] = useState(API_CONFIG.OCR_URL);
  const [riskUrl, setRiskUrl] = useState(API_CONFIG.RISK_URL);
  const [storageUrl, setStorageUrl] = useState(API_CONFIG.STORAGE_URL);

  useEffect(() => {
    // In a real app, these would be persisted to localStorage or backend
    console.log('Integration settings updated:', {
      mockMode,
      apiBase,
      ocrUrl,
      riskUrl,
      storageUrl,
    });
  }, [mockMode, apiBase, ocrUrl, riskUrl, storageUrl]);

  const integrationPoints = [
    {
      name: 'OCR Service',
      person: 'Person A',
      endpoint: 'POST /infer/document',
      url: ocrUrl,
      description: 'Extracts text and bounding boxes from document images',
      request: {
        application_id: 'string',
        image_base64: 'string (base64 encoded image)',
        document_type: 'string (optional)',
      },
      response: {
        application_id: 'string',
        ocr_json: {
          name: 'string',
          date_of_birth: 'string',
          address: 'string',
          document_number: 'string',
          expiry_date: 'string',
          nationality: 'string',
          bounding_boxes: 'object (normalized coordinates)',
        },
        doc_confidence: 'number (0.0-1.0)',
        doc_hash: 'string (SHA256)',
        face_image_hash: 'string (SHA256, optional)',
      },
    },
    {
      name: 'Face Match Service',
      person: 'Person B',
      endpoint: 'POST /face/match',
      url: apiBase,
      description: 'Compares ID photo with selfie, performs liveness detection',
      request: {
        application_id: 'string',
        id_photo_base64: 'string',
        selfie_base64: 'string',
      },
      response: {
        application_id: 'string',
        similarity: 'number (0.0-1.0)',
        liveness_result: "'passed' | 'failed' | 'unknown'",
        embedding_hash: 'string (SHA256)',
        confidence: 'number (0.0-1.0)',
      },
    },
    {
      name: 'Risk Scoring Service',
      person: 'Person C',
      endpoint: 'POST /score',
      url: riskUrl,
      description: 'Calculates risk score and provides explainable factors',
      request: {
        application_id: 'string',
        features: {
          ocr_results: 'OcrResponse (optional)',
          face_match: 'FaceMatchResponse (optional)',
          document_hashes: 'string[]',
          metadata: 'object (optional)',
        },
      },
      response: {
        application_id: 'string',
        risk_score: 'number (0.0-1.0)',
        drpa_level: "'low' | 'medium' | 'high'",
        explanations: [
          {
            factor: 'string',
            weight: 'number (0.0-1.0)',
            contribution: 'number (-1.0 to 1.0)',
            description: 'string',
            suggested_action: "'approve' | 'flag' | 'request_info' | 'reject' (optional)",
          },
        ],
        audit_id: 'string',
        factors: 'object',
      },
    },
    {
      name: 'Storage Service',
      person: 'Person D',
      endpoint: 'POST /store/upload',
      url: storageUrl,
      description: 'Stores uploaded documents and returns storage path and hash',
      request: {
        application_id: 'string',
        document_type: 'string',
        file: 'File or base64 string',
      },
      response: {
        storage_path: 'string',
        hash: 'string (SHA256)',
        url: 'string (optional, pre-signed URL)',
      },
    },
    {
      name: 'Audit Service',
      person: 'System',
      endpoint: 'POST /audit/append',
      url: apiBase,
      description: 'Appends audit log entries',
      request: {
        application_id: 'string',
        action: 'string',
        actor: 'string',
        metadata: 'object (optional)',
      },
      response: {
        log_hash: 'string (SHA256)',
      },
    },
  ];

  return (
    <div className={styles.integrations}>
      <div className={styles.container}>
        <h1 className={styles.title}>Integration Configuration</h1>
        <p className={styles.description}>
          Configure backend endpoints and toggle between mock and real mode.
        </p>

        <div className={styles.configSection}>
          <h2 className={styles.sectionTitle}>Configuration</h2>
          <div className={styles.configGrid}>
            <div className={styles.configItem}>
              <label className={styles.label}>
                <input
                  type="checkbox"
                  checked={mockMode}
                  onChange={(e) => setMockMode(e.target.checked)}
                  className={styles.checkbox}
                />
                Mock Mode
              </label>
              <p className={styles.helpText}>
                When enabled, uses mock data instead of real API calls
              </p>
            </div>

            <div className={styles.configItem}>
              <label className={styles.label}>
                API Base URL
                <input
                  type="text"
                  value={apiBase}
                  onChange={(e) => setApiBase(e.target.value)}
                  className={styles.input}
                  placeholder="http://localhost:8000"
                />
              </label>
            </div>

            <div className={styles.configItem}>
              <label className={styles.label}>
                OCR Service URL
                <input
                  type="text"
                  value={ocrUrl}
                  onChange={(e) => setOcrUrl(e.target.value)}
                  className={styles.input}
                  placeholder="http://localhost:8001"
                />
              </label>
            </div>

            <div className={styles.configItem}>
              <label className={styles.label}>
                Risk Service URL
                <input
                  type="text"
                  value={riskUrl}
                  onChange={(e) => setRiskUrl(e.target.value)}
                  className={styles.input}
                  placeholder="http://localhost:8002"
                />
              </label>
            </div>

            <div className={styles.configItem}>
              <label className={styles.label}>
                Storage Service URL
                <input
                  type="text"
                  value={storageUrl}
                  onChange={(e) => setStorageUrl(e.target.value)}
                  className={styles.input}
                  placeholder="http://localhost:8003"
                />
              </label>
            </div>
          </div>
        </div>

        <div className={styles.endpointsSection}>
          <h2 className={styles.sectionTitle}>Integration Endpoints</h2>
          <div className={styles.endpointsList}>
            {integrationPoints.map((point, index) => (
              <div key={index} className={styles.endpointCard}>
                <div className={styles.endpointHeader}>
                  <h3 className={styles.endpointName}>{point.name}</h3>
                  <span className={styles.personTag}>{point.person}</span>
                </div>
                <p className={styles.endpointDescription}>{point.description}</p>
                <div className={styles.endpointDetails}>
                  <div className={styles.endpointDetail}>
                    <strong>Endpoint:</strong> <code>{point.endpoint}</code>
                  </div>
                  <div className={styles.endpointDetail}>
                    <strong>Base URL:</strong> <code>{point.url}</code>
                  </div>
                </div>
                <details className={styles.schemaDetails}>
                  <summary>Request/Response Schema</summary>
                  <div className={styles.schemaContent}>
                    <div className={styles.schemaSection}>
                      <h4>Request:</h4>
                      <pre className={styles.codeBlock}>
                        {JSON.stringify(point.request, null, 2)}
                      </pre>
                    </div>
                    <div className={styles.schemaSection}>
                      <h4>Response:</h4>
                      <pre className={styles.codeBlock}>
                        {JSON.stringify(point.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

