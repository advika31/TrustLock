'use client';

import { useState } from 'react';
import type { XaiTraceProps } from '@/types';
import styles from './XaiTrace.module.scss';

/**
 * XaiTrace component displaying human-readable decision trace
 * Shows top factors, weights, contributions, and suggested actions
 * Accessible table + collapsible detail items
 */
export default function XaiTrace({ trace, riskResponse }: XaiTraceProps) {
  const [expandedFactors, setExpandedFactors] = useState<Set<string>>(new Set());

  const toggleFactor = (factor: string) => {
    const newExpanded = new Set(expandedFactors);
    if (newExpanded.has(factor)) {
      newExpanded.delete(factor);
    } else {
      newExpanded.add(factor);
    }
    setExpandedFactors(newExpanded);
  };

  const getDecisionColor = () => {
    if (trace.decision === 'approved') return 'var(--color-success)';
    if (trace.decision === 'flagged') return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const factors = riskResponse?.explanations || trace.top_factors;

  return (
    <div className={styles.xaiTrace} role="region" aria-label="XAI Decision Trace">
      <div className={styles.header}>
        <h3 className={styles.title}>Decision Trace</h3>
        <div className={styles.decision}>
          <span className={styles.decisionLabel}>Decision:</span>
          <span
            className={styles.decisionValue}
            style={{ color: getDecisionColor() }}
          >
            {trace.decision.toUpperCase()}
          </span>
          <span className={styles.confidence}>
            (Confidence: {Math.round(trace.confidence * 100)}%)
          </span>
        </div>
      </div>

      {trace.reasoning_chain && trace.reasoning_chain.length > 0 && (
        <div className={styles.reasoningChain}>
          <h4 className={styles.reasoningTitle}>Reasoning Chain</h4>
          <ol className={styles.reasoningList}>
            {trace.reasoning_chain.map((step, index) => (
              <li key={index} className={styles.reasoningStep}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className={styles.factorsSection}>
        <h4 className={styles.factorsTitle}>Top Contributing Factors</h4>
        <div className={styles.factorsTable} role="table" aria-label="Risk factors">
          <div className={styles.tableHeader} role="row">
            <div className={styles.tableCell} role="columnheader">Factor</div>
            <div className={styles.tableCell} role="columnheader">Weight</div>
            <div className={styles.tableCell} role="columnheader">Contribution</div>
            <div className={styles.tableCell} role="columnheader">Action</div>
          </div>
          {factors.map((factor, index) => {
            const isExpanded = expandedFactors.has(factor.factor);
            const contributionPercent = Math.round(factor.contribution * 100);
            const contributionColor =
              factor.contribution > 0 ? 'var(--color-danger)' : 'var(--color-success)';

            return (
              <div key={index} className={styles.tableRow} role="row">
                <div className={styles.tableCell} role="cell">
                  <button
                    className={styles.factorButton}
                    onClick={() => toggleFactor(factor.factor)}
                    aria-expanded={isExpanded}
                    aria-controls={`factor-details-${index}`}
                  >
                    <span className={styles.factorName}>{factor.factor}</span>
                    <span className={styles.expandIcon}>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </button>
                </div>
                <div className={styles.tableCell} role="cell">
                  {Math.round(factor.weight * 100)}%
                </div>
                <div className={styles.tableCell} role="cell">
                  <span
                    className={styles.contribution}
                    style={{ color: contributionColor }}
                  >
                    {contributionPercent > 0 ? '+' : ''}
                    {contributionPercent}%
                  </span>
                </div>
                <div className={styles.tableCell} role="cell">
                  {factor.suggested_action && (
                    <span
                      className={styles.actionBadge}
                      data-action={factor.suggested_action}
                    >
                      {factor.suggested_action}
                    </span>
                  )}
                </div>
                {isExpanded && (
                  <div
                    id={`factor-details-${index}`}
                    className={styles.factorDetails}
                    role="region"
                    aria-label={`Details for ${factor.factor}`}
                  >
                    <p className={styles.factorDescription}>{factor.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {trace.model_version && (
        <div className={styles.modelInfo}>
          <span className={styles.modelLabel}>Model Version:</span>
          <code className={styles.modelVersion}>{trace.model_version}</code>
        </div>
      )}
    </div>
  );
}

