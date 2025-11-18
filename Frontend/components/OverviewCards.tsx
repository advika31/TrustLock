'use client';

import React from 'react';
import styles from './OverviewCards.module.scss';

/**
 * Overview Cards Component
 * Display key performance indicators with icons, metrics, and delta badges
 */

interface KPICard {
  id: string;
  label: string;
  value: number | string;
  delta?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

interface OverviewCardsProps {
  cards: KPICard[];
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ cards }) => {
  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return '#14b8a6'; // green for positive
      case 'down':
        return '#ff3860'; // red for negative
      default:
        return '#9fb0c8'; // gray for neutral
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <div className={styles.container}>
      {cards.map((card) => (
        <div
          key={card.id}
          className={styles.card}
          role="status"
          aria-label={`${card.label}: ${card.value}`}
          data-testid={`kpi-card-${card.id}`}
        >
          {/* Icon */}
          <div className={styles.iconContainer}>{card.icon}</div>

          {/* Content */}
          <div className={styles.content}>
            <p className={styles.label}>{card.label}</p>
            <div className={styles.valueRow}>
              <span className={styles.value}>{card.value}</span>
              {typeof card.delta === 'number' && (
                <span
                  className={`${styles.delta} ${
                    card.trend === 'up'
                      ? styles.deltaUp
                      : card.trend === 'down'
                        ? styles.deltaDown
                        : styles.deltaNeutral
                  }`}
                  style={{ color: getTrendColor(card.trend) }}
                  role="img"
                  aria-label={`${card.trend === 'up' ? 'increase' : card.trend === 'down' ? 'decrease' : 'change'} of ${Math.abs(card.delta)}%`}
                >
                  {getTrendIcon(card.trend)} {Math.abs(card.delta)}%
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;
