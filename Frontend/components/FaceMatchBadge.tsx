'use client';

import type { FaceMatchBadgeProps } from '@/types';
import styles from './FaceMatchBadge.module.scss';

/**
 * FaceMatchBadge component showing similarity score, confidence, and liveness result
 * Color-coded based on confidence levels
 */
export default function FaceMatchBadge({
  similarity,
  liveness,
  confidence,
}: FaceMatchBadgeProps) {
  const similarityPercent = Math.round(similarity * 100);
  const confidencePercent = confidence ? Math.round(confidence * 100) : null;

  // Determine color based on similarity
  const getSimilarityColor = () => {
    if (similarity >= 0.9) return 'var(--color-success)';
    if (similarity >= 0.7) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const getLivenessColor = () => {
    if (liveness === 'passed') return 'var(--color-success)';
    if (liveness === 'failed') return 'var(--color-danger)';
    return 'var(--color-text-muted)';
  };

  const getLivenessLabel = () => {
    if (liveness === 'passed') return 'Liveness: Passed';
    if (liveness === 'failed') return 'Liveness: Failed';
    return 'Liveness: Unknown';
  };

  return (
    <div className={styles.badge} role="status" aria-live="polite">
      <div className={styles.similaritySection}>
        <div className={styles.similarityLabel}>Face Similarity</div>
        <div
          className={styles.similarityValue}
          style={{ color: getSimilarityColor() }}
        >
          {similarityPercent}%
        </div>
        <div className={styles.similarityBar}>
          <div
            className={styles.similarityFill}
            style={{
              width: `${similarityPercent}%`,
              backgroundColor: getSimilarityColor(),
            }}
            role="progressbar"
            aria-valuenow={similarityPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Face similarity: ${similarityPercent}%`}
          />
        </div>
      </div>

      {confidencePercent !== null && (
        <div className={styles.confidenceSection}>
          <span className={styles.confidenceLabel}>Confidence:</span>
          <span className={styles.confidenceValue}>{confidencePercent}%</span>
        </div>
      )}

      <div className={styles.livenessSection}>
        <span
          className={styles.livenessBadge}
          style={{ color: getLivenessColor() }}
        >
          {getLivenessLabel()}
        </span>
      </div>
    </div>
  );
}

