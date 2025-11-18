'use client';

import React from 'react';
import styles from './ReviewList.module.scss';

/**
 * Review List Component
 * Vertical list of flagged cases with quick review actions
 */

interface CaseItem {
  id: string;
  name: string;
  method: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  thumbnail?: string;
  tags?: string[];
  timestamp?: string;
}

interface ReviewListProps {
  cases: CaseItem[];
  onReview: (caseId: string) => void;
  isLoading?: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  cases,
  onReview,
  isLoading = false,
}) => {
  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    const colors = {
      low: '#14b8a6',
      medium: '#f59e0b',
      high: '#ff3860',
    };
    return colors[level];
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingPlaceholder}>Loading cases...</div>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
            <path d="M24 16V24L20 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <h3>No cases to review</h3>
          <p>All applications are up to date</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} role="region" aria-label="Cases pending review">
      <div className={styles.list}>
        {cases.map((caseItem) => (
          <div
            key={caseItem.id}
            className={styles.caseItem}
            role="article"
            aria-label={`Case ${caseItem.name}, ${caseItem.riskLevel} risk`}
            data-testid={`review-case-${caseItem.id}`}
          >
            {/* Thumbnail */}
            <div className={styles.thumbnail}>
              {caseItem.thumbnail ? (
                <img src={caseItem.thumbnail} alt={caseItem.name} />
              ) : (
                <div className={styles.placeholderAvatar}>
                  {caseItem.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className={styles.info}>
              <h4 className={styles.name}>{caseItem.name}</h4>
              <p className={styles.method}>{caseItem.method}</p>

              {/* Tags */}
              {caseItem.tags && caseItem.tags.length > 0 && (
                <div className={styles.tags}>
                  {caseItem.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Risk Meter */}
            <div className={styles.riskMeter}>
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="var(--border-1)" strokeWidth="1.5" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke={getRiskColor(caseItem.riskLevel)}
                  strokeWidth="2"
                  strokeDasharray={`${(caseItem.riskScore / 100) * 150.8} 150.8`}
                  strokeLinecap="round"
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '28px 28px',
                  }}
                />
              </svg>
              <div className={styles.riskScore}>
                <span className={styles.percentage}>{caseItem.riskScore}%</span>
              </div>
            </div>

            {/* Review Button */}
            <button
              className={styles.reviewButton}
              onClick={() => onReview(caseItem.id)}
              aria-label={`Review case ${caseItem.name}`}
              title="Open case for review"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2L2 8l6 6m6-6l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              Review
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
