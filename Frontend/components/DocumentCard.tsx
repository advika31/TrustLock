'use client';

import Image from 'next/image';
import type { DocumentCardProps } from '@/types';
import styles from './DocumentCard.module.scss';

/**
 * DocumentCard component showing captured document image
 * Displays document type tag, upload status, and re-capture button
 */
export default function DocumentCard({
  document,
  onRecapture,
  imageUrl,
}: DocumentCardProps) {
  const documentTypeLabels: Record<string, string> = {
    id_front: 'ID Front',
    id_back: 'ID Back',
    address_proof: 'Address Proof',
    selfie: 'Selfie',
  };

  const statusColors: Record<string, string> = {
    uploaded: 'var(--color-success)',
    processing: 'var(--color-warning)',
    error: 'var(--color-danger)',
  };

  return (
    <div className={styles.documentCard}>
      <div className={styles.imageContainer}>
        {imageUrl && imageUrl.startsWith('data:') ? (
          // Use img tag for data URLs
          <img
            src={imageUrl}
            alt={`${documentTypeLabels[document.document_type] || document.document_type} document`}
            className={styles.image}
          />
        ) : imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/')) ? (
          <Image
            src={imageUrl}
            alt={`${documentTypeLabels[document.document_type] || document.document_type} document`}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>📄</span>
            <span className={styles.placeholderText}>Document Image</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.typeTag} data-type={document.document_type}>
            {documentTypeLabels[document.document_type] || document.document_type}
          </span>
          <span className={styles.status} style={{ color: statusColors.uploaded }}>
            ✓ Uploaded
          </span>
        </div>

        <div className={styles.metadata}>
          <p className={styles.hash}>
            <span className={styles.label}>Hash:</span>
            <code className={styles.hashValue}>{document.hash.substring(0, 16)}...</code>
          </p>
          <p className={styles.timestamp}>
            {new Date(document.uploaded_at).toLocaleString()}
          </p>
        </div>

        {onRecapture && (
          <button
            onClick={onRecapture}
            className={styles.recaptureButton}
            aria-label={`Re-capture ${documentTypeLabels[document.document_type]}`}
          >
            Re-capture
          </button>
        )}
      </div>
    </div>
  );
}

