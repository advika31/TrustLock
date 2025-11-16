'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CameraCapture from '@/components/CameraCapture';
import DocumentCard from '@/components/DocumentCard';
import OCRResultViewer from '@/components/OCRResultViewer';
import FaceMatchBadge from '@/components/FaceMatchBadge';
import XaiTrace from '@/components/XaiTrace';
import {
  startKyc,
  uploadDocument,
  inferDocument,
  faceMatch,
  scoreRisk,
} from '@/lib/api';
import type {
  KycApplication,
  DocumentUploadResponse,
  OcrResponse,
  FaceMatchResponse,
  RiskResponse,
  XaiTrace as XaiTraceType,
} from '@/types';
import styles from './page.module.scss';

/**
 * Onboarding flow with 3-step UI
 * Step 1: Choose method (Upload/SSI/Branch)
 * Step 2: Document capture (front/back/address/selfie)
 * Step 3: Review with OCR, face match, XAI trace
 */
export default function OnboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mockFlagged = searchParams.get('mock') === 'flagged';

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<'upload' | 'ssi' | 'branch' | null>(null);
  const [application, setApplication] = useState<KycApplication | null>(null);
  const [documents, setDocuments] = useState<DocumentUploadResponse[]>([]);
  const [documentImages, setDocumentImages] = useState<Record<string, string>>({});
  const [ocrResult, setOcrResult] = useState<OcrResponse | null>(null);
  const [faceMatchResult, setFaceMatchResult] = useState<FaceMatchResponse | null>(null);
  const [riskResult, setRiskResult] = useState<RiskResponse | null>(null);
  const [xaiTrace, setXaiTrace] = useState<XaiTraceType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Choose method
  const handleMethodSelect = async (selectedMethod: 'upload' | 'ssi' | 'branch') => {
    setMethod(selectedMethod);
    setLoading(true);
    setError(null);

    try {
      const app = await startKyc({ method: selectedMethod });
      setApplication(app);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start application');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Capture documents
  const handleDocumentCapture = async (
    file: File,
    documentType: DocumentUploadResponse['document_type']
  ) => {
    if (!application) return;

    setLoading(true);
    setError(null);

    try {
      const uploadResult = await uploadDocument({
        application_id: application.application_id,
        document_type: documentType,
        file,
      });

      setDocuments((prev) => [...prev, uploadResult]);

      // Store image as data URL for display
      const imageDataUrl = await fileToBase64Helper(file);
      setDocumentImages((prev) => ({
        ...prev,
        [uploadResult.document_id]: `data:image/jpeg;base64,${imageDataUrl}`,
      }));

      // If ID front captured, run OCR
      if (documentType === 'id_front') {
        const base64 = await fileToBase64Helper(file);
        const ocr = await inferDocument({
          application_id: application.application_id,
          image_base64: base64,
        });
        setOcrResult(ocr);
      }

      // If both ID front and selfie captured, run face match
      const idFront = documents.find((d) => d.document_type === 'id_front') || uploadResult;
      const selfie = documents.find((d) => d.document_type === 'selfie');
      const newSelfie = documentType === 'selfie' ? uploadResult : null;

      if (idFront && (selfie || newSelfie)) {
        const idBase64 = await fileToBase64Helper(file);
        const selfieBase64 = newSelfie
          ? await fileToBase64Helper(file)
          : await fetch(selfie!.storage_path).then((r) => r.blob()).then((b) => fileToBase64Helper(new File([b], 'selfie.jpg')));

        const faceMatchRes = await faceMatch({
          application_id: application.application_id,
          id_photo_base64: idBase64,
          selfie_base64: selfieBase64,
        });
        setFaceMatchResult(faceMatchRes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Review and finalize
  const handleProceedToReview = async () => {
    if (!application || !ocrResult) return;

    setLoading(true);
    setError(null);

    try {
      // Score risk
      const risk = await scoreRisk({
        application_id: application.application_id,
        features: {
          ocr_results: ocrResult,
          face_match: faceMatchResult || undefined,
          document_hashes: documents.map((d) => d.hash),
        },
      });
      setRiskResult(risk);

      // Generate XAI trace
      const trace: XaiTraceType = {
        application_id: application.application_id,
        decision: mockFlagged || risk.risk_score > 0.6 ? 'flagged' : 'approved',
        confidence: risk.risk_score,
        top_factors: risk.explanations,
        reasoning_chain: [
          'Document OCR extraction completed',
          'Face matching performed',
          'Risk factors analyzed',
          mockFlagged || risk.risk_score > 0.6
            ? 'Application flagged for manual review'
            : 'Application approved automatically',
        ],
      };
      setXaiTrace(trace);

      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process review');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  return (
    <div className={styles.onboard}>
      <div className={styles.container}>
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <div className={styles.progressSteps}>
            <span className={step >= 1 ? styles.active : ''}>1. Method</span>
            <span className={step >= 2 ? styles.active : ''}>2. Documents</span>
            <span className={step >= 3 ? styles.active : ''}>3. Review</span>
          </div>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className={styles.step}>
            <h1 className={styles.title}>Choose Verification Method</h1>
            <div className={styles.methods}>
              <button
                onClick={() => handleMethodSelect('upload')}
                disabled={loading}
                className={styles.methodButton}
              >
                <span className={styles.methodIcon}>📄</span>
                <h3>Upload Document</h3>
                <p>Upload ID documents and selfie for verification</p>
              </button>
              <button
                onClick={() => handleMethodSelect('ssi')}
                disabled={loading}
                className={styles.methodButton}
              >
                <span className={styles.methodIcon}>🔐</span>
                <h3>Verifiable Credential (SSI)</h3>
                <p>Use self-sovereign identity credentials (Mock)</p>
              </button>
              <button
                onClick={() => handleMethodSelect('branch')}
                disabled={loading}
                className={styles.methodButton}
              >
                <span className={styles.methodIcon}>🏢</span>
                <h3>Branch (IoT)</h3>
                <p>Verify at a physical branch location (Mock)</p>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.step}>
            <h1 className={styles.title}>Capture Documents</h1>
            <div className={styles.captureSection}>
              {!documents.find((d) => d.document_type === 'id_front') && (
                <div className={styles.captureCard}>
                  <h3>ID Front</h3>
                  <CameraCapture
                    onCapture={(file) => handleDocumentCapture(file, 'id_front')}
                    documentType="id_front"
                  />
                </div>
              )}

              {!documents.find((d) => d.document_type === 'id_back') && (
                <div className={styles.captureCard}>
                  <h3>ID Back (Optional)</h3>
                  <CameraCapture
                    onCapture={(file) => handleDocumentCapture(file, 'id_back')}
                    documentType="id_back"
                  />
                </div>
              )}

              {!documents.find((d) => d.document_type === 'selfie') && (
                <div className={styles.captureCard}>
                  <h3>Selfie</h3>
                  <CameraCapture
                    onCapture={(file) => handleDocumentCapture(file, 'selfie')}
                    documentType="selfie"
                    aspectRatio={1}
                  />
                </div>
              )}

              {documents.length > 0 && (
                <div className={styles.documentsGrid}>
                  {documents.map((doc) => (
                    <DocumentCard
                      key={doc.document_id}
                      document={doc}
                      imageUrl={documentImages[doc.document_id]}
                    />
                  ))}
                </div>
              )}

              {ocrResult && (
                <div className={styles.reviewSection}>
                  <button
                    onClick={handleProceedToReview}
                    disabled={loading}
                    className={styles.proceedButton}
                  >
                    Proceed to Review
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && ocrResult && riskResult && xaiTrace && (
          <div className={styles.step}>
            <h1 className={styles.title}>Review Results</h1>
            <div className={styles.reviewContent}>
              {ocrResult && (
                <div className={styles.reviewCard}>
                  <h2>OCR Results</h2>
                  <OCRResultViewer
                    imageUrl={
                      documentImages[
                        documents.find((d) => d.document_type === 'id_front')?.document_id || ''
                      ] || ''
                    }
                    ocrJson={ocrResult.ocr_json}
                    boundingBoxes={ocrResult.ocr_json.bounding_boxes}
                  />
                </div>
              )}

              {faceMatchResult && (
                <div className={styles.reviewCard}>
                  <h2>Face Match</h2>
                  <FaceMatchBadge
                    similarity={faceMatchResult.similarity}
                    liveness={faceMatchResult.liveness_result}
                    confidence={faceMatchResult.confidence}
                  />
                </div>
              )}

              <div className={styles.reviewCard}>
                <h2>XAI Decision Trace</h2>
                <XaiTrace trace={xaiTrace} riskResponse={riskResult} />
              </div>

              <div className={styles.actions}>
                <button onClick={handleComplete} className={styles.completeButton}>
                  View in Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to convert file to base64
async function fileToBase64Helper(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

