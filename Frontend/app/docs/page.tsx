import styles from './page.module.scss';

/**
 * Documentation page
 * Summarizes integration points, backend services, and JSON shapes
 */
export default function DocsPage() {
  return (
    <div className={styles.docs}>
      <div className={styles.container}>
        <h1 className={styles.title}>TrustLock Integration Documentation</h1>

        <section className={styles.section}>
          <h2>Overview</h2>
          <p>
            TrustLock is a KYC verification platform that integrates with multiple backend
            microservices for OCR, face matching, risk scoring, and storage. This
            documentation outlines the integration points and expected request/response
            formats.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Frontend Integration Checklist</h2>
          <ol className={styles.checklist}>
            <li>
              <strong>OCR Endpoint:</strong> Provide endpoint at{' '}
              <code>${`{API_BASE}`}/infer/document</code> accepting base64 image. Expected
              response includes <code>ocr_json</code> with extracted fields and bounding
              boxes.
            </li>
            <li>
              <strong>Face Match Endpoint:</strong> Provide endpoint at{' '}
              <code>${`{API_BASE}`}/face/match</code> accepting two base64 images (ID photo
              and selfie). Returns similarity score, liveness result, and embedding hash.
            </li>
            <li>
              <strong>Risk Scoring Endpoint:</strong> Provide endpoint at{' '}
              <code>${`{RISK_URL}`}/score</code> accepting application features. Returns risk
              score, DRPA level, and explainable factors array.
            </li>
            <li>
              <strong>Storage Upload Endpoint:</strong> Provide endpoint at{' '}
              <code>${`{STORAGE_URL}`}/store/upload</code> accepting multipart/form-data or
              JSON with base64. Returns storage path and SHA256 hash.
            </li>
            <li>
              <strong>Audit Append Endpoint:</strong> Provide endpoint at{' '}
              <code>${`{API_BASE}`}/audit/append</code> for logging actions. Returns log
              hash.
            </li>
            <li>
              <strong>SSI Verification:</strong> Respond to <code>POST /ssi/verify</code> with
              verified attributes in VC format (mock implementation available).
            </li>
            <li>
              <strong>CORS Headers:</strong> Provide CORS headers for{' '}
              <code>${`{NEXT_PUBLIC_FRONTEND_ORIGIN}`}</code>.
            </li>
            <li>
              <strong>Authentication:</strong> Staff frontend uses JWT in Authorization header.
              Format: <code>Authorization: Bearer {'{token}'}</code>
            </li>
            <li>
              <strong>ONNX Endpoints:</strong> Expect input images as PNG/JPEG base64 at
              224x224 (or specify pre-processing). Return embeddings as <code>float32[]</code>{' '}
              with SHA256 <code>embedding_hash</code>.
            </li>
            <li>
              <strong>Health Check:</strong> Add <code>/health</code> route returning{' '}
              <code>{`{status: "ok", service: "ocr"}`}</code> for UI health badges.
            </li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2>Environment Variables</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Description</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>NEXT_PUBLIC_API_BASE</code>
                </td>
                <td>Base URL for main API</td>
                <td>
                  <code>http://localhost:8000</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>NEXT_PUBLIC_OCR_URL</code>
                </td>
                <td>OCR service URL</td>
                <td>
                  <code>http://localhost:8001</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>NEXT_PUBLIC_RISK_URL</code>
                </td>
                <td>Risk scoring service URL</td>
                <td>
                  <code>http://localhost:8002</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>NEXT_PUBLIC_STORAGE_URL</code>
                </td>
                <td>Storage service URL</td>
                <td>
                  <code>http://localhost:8003</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>NEXT_PUBLIC_MOCK</code>
                </td>
                <td>Enable mock mode (true/false)</td>
                <td>
                  <code>true</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>NEXT_PUBLIC_FRONTEND_ORIGIN</code>
                </td>
                <td>Frontend origin for CORS</td>
                <td>
                  <code>http://localhost:3000</code>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className={styles.section}>
          <h2>UI Testing Checklist</h2>
          <ul className={styles.checklist}>
            <li>Test on mobile viewport (375px, 414px)</li>
            <li>Test on tablet viewport (768px, 1024px)</li>
            <li>Test on desktop viewport (1280px, 1920px)</li>
            <li>Verify keyboard navigation (Tab, Enter, Space, Escape)</li>
            <li>Check focus rings on all interactive elements</li>
            <li>Test color contrast (WCAG AA minimum)</li>
            <li>Verify screen reader labels (aria-label, aria-labelledby)</li>
            <li>Test camera capture flow on mobile device</li>
            <li>Verify no layout shifts during loading states</li>
            <li>Check responsive breakpoints (no horizontal scroll)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Example API Calls</h2>
          <div className={styles.codeExample}>
            <h3>OCR Inference</h3>
            <pre>
              <code>{`POST ${process.env.NEXT_PUBLIC_OCR_URL || 'http://localhost:8001'}/infer/document
Content-Type: application/json

{
  "application_id": "app_123",
  "image_base64": "iVBORw0KGgoAAAANS..."
}

Response:
{
  "application_id": "app_123",
  "ocr_json": {
    "name": "John Doe",
    "date_of_birth": "1990-05-15",
    "address": "123 Main St, New York, NY 10001",
    "document_number": "DL12345678"
  },
  "doc_confidence": 0.92,
  "doc_hash": "abc123..."
}`}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}

