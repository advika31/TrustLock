'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { OCRResultViewerProps } from '@/types';
import styles from './OCRResultViewer.module.scss';

/**
 * OCRResultViewer component displaying parsed OCR fields with bounding boxes
 * Shows extracted text fields and highlights bounding boxes on hover/focus
 */
export default function OCRResultViewer({
  imageUrl,
  ocrJson,
  boundingBoxes,
}: OCRResultViewerProps) {
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fields = [
    { key: 'name', label: 'Name' },
    { key: 'date_of_birth', label: 'Date of Birth' },
    { key: 'address', label: 'Address' },
    { key: 'document_number', label: 'Document Number' },
    { key: 'expiry_date', label: 'Expiry Date' },
    { key: 'nationality', label: 'Nationality' },
  ];

  const getBoundingBoxStyle = (fieldKey: string) => {
    const box = boundingBoxes?.[fieldKey as keyof typeof boundingBoxes];
    if (!box) return { display: 'none' };

    const [x, y, width, height] = box;
    return {
      position: 'absolute' as const,
      left: `${x * 100}%`,
      top: `${y * 100}%`,
      width: `${width * 100}%`,
      height: `${height * 100}%`,
    };
  };

  const isFieldActive = (fieldKey: string) => {
    return hoveredField === fieldKey || focusedField === fieldKey;
  };

  return (
    <div className={styles.ocrViewer}>
      <div className={styles.imageSection}>
        <div className={styles.imageContainer}>
          {imageUrl.startsWith('data:') ? (
            <img
              src={imageUrl}
              alt="Document with OCR bounding boxes"
              className={styles.image}
            />
          ) : (
            <Image
              src={imageUrl}
              alt="Document with OCR bounding boxes"
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
          {boundingBoxes &&
            fields.map((field) => {
              const box = boundingBoxes[field.key as keyof typeof boundingBoxes];
              if (!box) return null;

              return (
                <div
                  key={field.key}
                  className={`${styles.boundingBox} ${isFieldActive(field.key) ? styles.boundingBoxActive : ''}`}
                  style={getBoundingBoxStyle(field.key)}
                  onMouseEnter={() => setHoveredField(field.key)}
                  onMouseLeave={() => setHoveredField(null)}
                  onFocus={() => setFocusedField(field.key)}
                  onBlur={() => setFocusedField(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Bounding box for ${field.label}`}
                />
              );
            })}
        </div>
      </div>

      <div className={styles.resultsSection}>
        <h3 className={styles.title}>Extracted Fields</h3>
        <dl className={styles.fieldList}>
          {fields.map((field) => {
            const value = ocrJson[field.key as keyof typeof ocrJson];
            if (!value) return null;

            return (
              <div
                key={field.key}
                className={`${styles.field} ${isFieldActive(field.key) ? styles.fieldActive : ''}`}
                onMouseEnter={() => setHoveredField(field.key)}
                onMouseLeave={() => setHoveredField(null)}
                onFocus={() => setFocusedField(field.key)}
                onBlur={() => setFocusedField(null)}
                tabIndex={0}
              >
                <dt className={styles.fieldLabel}>{field.label}:</dt>
                <dd className={styles.fieldValue}>{String(value)}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}

