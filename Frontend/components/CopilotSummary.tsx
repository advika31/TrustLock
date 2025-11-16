'use client';

import { useState } from 'react';
import type { CopilotSummaryProps } from '@/types';
import styles from './CopilotSummary.module.scss';

/**
 * CopilotSummary component showing AI-style summary
 * Includes "Regenerate" button (mock functionality)
 */
export default function CopilotSummary({
  applicationId,
  summary,
  onRegenerate,
}: CopilotSummaryProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentSummary, setCurrentSummary] = useState(
    summary ||
      `Application ${applicationId} shows moderate risk indicators. Document authenticity verified with 92% confidence. Face match similarity at 88% with liveness passed. Recommend manual review due to watchlist potential match.`
  );

  const handleRegenerate = async () => {
    if (isRegenerating || !onRegenerate) return;

    setIsRegenerating(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In real mode, onRegenerate would call the backend
    if (onRegenerate) {
      onRegenerate();
    }

    // Update summary with mock variation
    const variations = [
      `Application ${applicationId} requires additional verification. OCR extraction completed successfully. Face matching indicates high confidence match. Risk assessment flags potential inconsistencies in address data.`,
      `Review of application ${applicationId} indicates standard processing path. All documents verified. No significant risk factors detected. Ready for approval.`,
      `Application ${applicationId} flagged for enhanced due diligence. Document quality acceptable. Face match confidence borderline. Recommend requesting additional identity proof.`,
    ];
    setCurrentSummary(variations[Math.floor(Math.random() * variations.length)]);
    setIsRegenerating(false);
  };

  return (
    <div className={styles.copilotSummary} role="region" aria-label="AI Copilot Summary">
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.icon}>🤖</span>
          AI Copilot Summary
        </h3>
        {onRegenerate && (
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className={styles.regenerateButton}
            aria-label="Regenerate summary"
          >
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        )}
      </div>
      <div className={styles.content}>
        <p className={styles.summaryText}>{currentSummary}</p>
      </div>
      <div className={styles.footer}>
        <span className={styles.disclaimer}>
          This is an AI-generated summary. Always verify critical information.
        </span>
      </div>
    </div>
  );
}

