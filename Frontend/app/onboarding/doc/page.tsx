'use client';

import { useEffect, useState } from 'react';
import Stepper from '@/components/Stepper/Stepper';
import CameraCapture from '@/components/CameraCapture';
import { useOffline } from '@/providers/OfflineProvider';
import { useLocale } from '@/providers/LocaleProvider';
import { useToast } from '@/components/Toast/ToastProvider';
import { callRiskScore, startKyc, uploadDocument } from '@/services/api';
import { enqueueRequest } from '@/services/offlineQueue';
import type { CaptureResult } from '@/hooks/useCameraCapture';
import styles from './doc.module.scss';

const DOC_STEPS = ['selfie', 'id_front', 'id_back', 'address_proof'] as const;

export default function DocumentFlowPage() {
  const { t } = useLocale();
  const { isOnline } = useOffline();
  const { pushToast } = useToast();
  const [current, setCurrent] = useState(0);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [captures, setCaptures] = useState<Record<string, { preview: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      const response = await startKyc({
        user: { name: 'Demo User', email: 'demo@trustlock.test', phone: '+1-555-0000' },
        method: 'DOC',
        meta: { device_id: 'demo-device', locale: 'en-US' },
      });
      setApplicationId(response.application_id);
    }
    void bootstrap();
  }, []);

  const onCapture = async (
    documentType: (typeof DOC_STEPS)[number],
    result: CaptureResult
  ) => {
    if (!applicationId) return;
    setCaptures((prev) => ({ ...prev, [documentType]: { preview: result.base64 } }));
    const body = {
      application_id: applicationId,
      document_type: documentType,
      image_base64: result.base64,
    };
    if (!isOnline) {
      await enqueueRequest({ endpoint: '/store/upload', method: 'POST', payload: body });
      pushToast({
        message: `Saved ${documentType} for sync`,
        variant: 'info',
      });
      goNext();
      return;
    }
    await uploadDocument({
      application_id: applicationId,
      document_type: documentType,
      file: result.file,
    });
    pushToast({ message: `Captured ${documentType}`, variant: 'success' });
    goNext();
  };

  const goNext = () => {
    setCurrent((prev) => Math.min(prev + 1, DOC_STEPS.length));
  };

  const handleSubmit = async () => {
    if (!applicationId || submitting) return;
    setSubmitting(true);
    await callRiskScore({
      application_id: applicationId,
      features: {
        metadata: { riskHint: 0.42 },
      },
    });
    pushToast({ message: 'Submitted to risk service', variant: 'success' });
    setSubmitting(false);
  };

  const progressLabels = [
    t('onboarding.stepSelfie'),
    t('onboarding.stepIdFront'),
    t('onboarding.stepIdBack'),
    t('onboarding.stepAddress'),
    t('onboarding.stepConfirm'),
  ];

  const documentType = DOC_STEPS[current] ?? 'address_proof';
  const instructionMap: Record<string, string> = {
    selfie: t('onboarding.guidance.centerFace'),
    id_front: t('onboarding.guidance.moveCloser'),
    id_back: t('onboarding.guidance.moveCloser'),
    address_proof: t('onboarding.guidance.tooDark'),
  };

  const showConfirmation = current >= DOC_STEPS.length;

  return (
    <section className={styles.flow}>
      <Stepper steps={progressLabels} currentStep={Math.min(current, progressLabels.length - 1)} />
      {!showConfirmation ? (
        <div className={styles.stage}>
          <h2>{progressLabels[current]}</h2>
          <p>{instructionMap[documentType]}</p>
          <CameraCapture
            documentType={documentType}
            instruction={instructionMap[documentType]}
            onCapture={(result) => onCapture(documentType, result)}
          />
        </div>
      ) : (
        <div className={styles.review}>
          <h2>{t('onboarding.stepConfirm')}</h2>
          <div className={styles.previewGrid}>
            {DOC_STEPS.map((step) => (
              <figure key={step}>
                {captures[step]?.preview ? (
                  <img src={captures[step]?.preview} alt={step} />
                ) : (
                  <div className={styles.placeholder}>Missing</div>
                )}
                <figcaption>{step}</figcaption>
              </figure>
            ))}
          </div>
          <button type="button" className={styles.submitButton} onClick={handleSubmit}>
            {submitting ? 'Submitting…' : t('onboarding.stepSubmit')}
          </button>
        </div>
      )}
    </section>
  );
}

