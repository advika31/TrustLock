'use client';

import type { ApplicationSummary } from '@/types';
import styles from './ComplianceItem.module.scss';

interface ComplianceItemProps {
  application: ApplicationSummary;
  onClick: () => void;
}

/**
 * ComplianceItem component for dashboard list
 * Shows application summary with status, risk score, and timestamp
 */
export default function ComplianceItem({ application, onClick }: ComplianceItemProps) {
  const getStatusColor = () => {
    switch (application.status) {
      case 'approved':
        return 'var(--color-success)';
      case 'flagged':
        return 'var(--color-warning)';
      case 'rejected':
        return 'var(--color-danger)';
      case 'info_requested':
        return 'var(--color-info)';
      default:
        return 'var(--color-text-muted)';
    }
  };

  const getRiskLevel = () => {
    if (application.risk_score < 0.4) return 'low';
    if (application.risk_score < 0.6) return 'medium';
    return 'high';
  };

  const getRiskColor = () => {
    const level = getRiskLevel();
    if (level === 'low') return 'var(--color-success)';
    if (level === 'medium') return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={styles.complianceItem}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View application ${application.application_id} for ${application.applicant_name}`}
    >
      <div className={styles.content}>
        <div className={styles.mainInfo}>
          <h3 className={styles.applicantName}>{application.applicant_name}</h3>
          <p className={styles.applicationId}>ID: {application.application_id}</p>
        </div>

        <div className={styles.metadata}>
          <div className={styles.statusBadge} style={{ color: getStatusColor() }}>
            <span className={styles.statusDot} style={{ backgroundColor: getStatusColor() }} />
            {application.status}
          </div>

          <div className={styles.riskScore}>
            <span className={styles.riskLabel}>Risk:</span>
            <span
              className={styles.riskValue}
              style={{ color: getRiskColor() }}
            >
              {Math.round(application.risk_score * 100)}%
            </span>
            <span className={styles.riskLevel}>({getRiskLevel()})</span>
          </div>

          <div className={styles.timestamp}>
            <span className={styles.timestampLabel}>Last updated:</span>
            <time dateTime={application.last_event_timestamp}>
              {formatDate(application.last_event_timestamp)}
            </time>
          </div>
        </div>
      </div>

      <div className={styles.arrow}>→</div>
    </div>
  );
}

