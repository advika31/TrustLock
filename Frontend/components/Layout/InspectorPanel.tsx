'use client';

import React, { useState, useEffect } from 'react';
import styles from './InspectorPanel.module.scss';

/**
 * Inspector Panel Component
 * Right-side sliding panel for case details (desktop) or modal (mobile)
 */

interface CaseDetails {
  id: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  xaiFactors?: Array<{ label: string; weight: number }>;
  status: string;
}

interface InspectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  caseDetails?: CaseDetails;
  onApprove?: (id: string) => void;
  onRequestInfo?: (id: string) => void;
  onReject?: (id: string) => void;
}

type TabType = 'details' | 'documents' | 'timeline' | 'xai' | 'audit';

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  isOpen,
  onClose,
  caseDetails,
  onApprove,
  onRequestInfo,
  onReject,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  useEffect(() => {
    // Lock body scroll when panel is open on mobile
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !caseDetails) return null;

  const riskColor = {
    low: '#14b8a6',
    medium: '#f59e0b',
    high: '#ff3860',
  }[caseDetails.riskLevel];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className={styles.backdrop}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.inspector} ${isOpen ? styles.open : ''}`}
        role="complementary"
        aria-label="Case details inspector"
      >
        {/* Close button */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close inspector"
          title="Close"
          data-testid="inspector-close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Case Details</h2>
            <p className={styles.caseId}>ID: {caseDetails.id}</p>
          </div>
        </div>

        {/* Risk score display */}
        <div className={styles.riskSection}>
          <div className={styles.riskMeter}>
            <svg width="80" height="80" viewBox="0 0 80 80" className={styles.riskCircle}>
              <circle cx="40" cy="40" r="36" fill="none" stroke="var(--border-1)" strokeWidth="2" />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke={riskColor}
                strokeWidth="3"
                strokeDasharray={`${(caseDetails.riskScore / 100) * 226} 226`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px' }}
              />
            </svg>
            <div className={styles.riskText}>
              <span className={styles.score}>{caseDetails.riskScore}%</span>
            </div>
          </div>
          <div className={styles.riskLabel} style={{ color: riskColor }}>
            {caseDetails.riskLevel.charAt(0).toUpperCase() + caseDetails.riskLevel.slice(1)} Risk
          </div>
        </div>

        {/* Tab navigation */}
        <nav className={styles.tabNav} role="tablist">
          {(['details', 'documents', 'timeline', 'xai', 'audit'] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`tab-${tab}`}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className={styles.content}>
          {activeTab === 'details' && (
            <div id="tab-details" role="tabpanel" className={styles.tabPanel}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <label>Status</label>
                  <span>{caseDetails.status}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div id="tab-documents" role="tabpanel" className={styles.tabPanel}>
              <p className={styles.placeholder}>Documents will be displayed here</p>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div id="tab-timeline" role="tabpanel" className={styles.tabPanel}>
              <p className={styles.placeholder}>Timeline events will be displayed here</p>
            </div>
          )}

          {activeTab === 'xai' && (
            <div id="tab-xai" role="tabpanel" className={styles.tabPanel}>
              {caseDetails.xaiFactors && caseDetails.xaiFactors.length > 0 ? (
                <div className={styles.xaiFactors}>
                  {caseDetails.xaiFactors.map((factor) => (
                    <div key={factor.label} className={styles.xaiFactor}>
                      <div className={styles.xaiLabel}>{factor.label}</div>
                      <div className={styles.xaiBar}>
                        <div
                          className={styles.xaiBarFill}
                          style={{
                            width: `${factor.weight * 100}%`,
                            background: `linear-gradient(90deg, hsl(${factor.weight * 120}, 100%, 50%), hsl(${factor.weight * 40}, 100%, 50%))`,
                          }}
                        />
                      </div>
                      <span className={styles.xaiWeight}>{(factor.weight * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.placeholder}>No XAI factors available</p>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div id="tab-audit" role="tabpanel" className={styles.tabPanel}>
              <p className={styles.placeholder}>Audit logs will be displayed here</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className={styles.actions}>
          {confirmAction ? (
            <div className={styles.confirmation}>
              <p>Confirm {confirmAction}?</p>
              <div className={styles.confirmButtons}>
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setConfirmAction(null)}
                >
                  Cancel
                </button>
                <button
                  className={`${styles.btn} ${confirmAction === 'Approve' ? styles.btnSuccess : styles.btnDanger}`}
                  onClick={() => {
                    if (confirmAction === 'Approve') onApprove?.(caseDetails.id);
                    else if (confirmAction === 'Reject') onReject?.(caseDetails.id);
                    setConfirmAction(null);
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.actionButtons}>
              <button
                className={`${styles.btn} ${styles.btnSuccess}`}
                onClick={() => setConfirmAction('Approve')}
                title="Approve this case"
              >
                Approve
              </button>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => onRequestInfo?.(caseDetails.id)}
                title="Request more information"
              >
                Info
              </button>
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={() => setConfirmAction('Reject')}
                title="Reject this case"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default InspectorPanel;
