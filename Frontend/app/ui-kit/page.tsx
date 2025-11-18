/**
 * UI Kit Showcase Page
 * Demonstrates all dashboard components and design tokens in one place
 * Access at: http://localhost:3000/ui-kit (or :3001 with npm run ui:preview)
 */

'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { Header } from '../../components/Layout/Header';
import { InspectorPanel } from '../../components/Layout/InspectorPanel';
import { OverviewCards } from '../../components/OverviewCards';
import { ReviewList } from '../../components/ReviewList';
import styles from './page.module.scss';

export default function UIKitPage() {
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <span>📊</span>,
    },
    {
      href: '/cases',
      label: 'Cases',
      icon: <span>📋</span>,
      badge: 5,
    },
    {
      href: '/reviewers',
      label: 'Reviewers',
      icon: <span>👥</span>,
    },
    {
      href: '/reports',
      label: 'Reports',
      icon: <span>📈</span>,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <span>⚙️</span>,
    },
  ];

  const kpiCards = [
    {
      id: 'onboarded',
      label: 'Onboarded Today',
      value: '234',
      delta: 12,
      trend: 'up' as const,
      icon: <span>✓</span>,
    },
    {
      id: 'avg-time',
      label: 'Avg Review Time',
      value: '2m 34s',
      delta: -8,
      trend: 'down' as const,
      icon: <span>⏱</span>,
    },
    {
      id: 'fraud-detected',
      label: 'Fraud Detected',
      value: '12',
      delta: 5,
      trend: 'up' as const,
      icon: <span>🚨</span>,
    },
    {
      id: 'risk-avg',
      label: 'Avg Risk Score',
      value: '34%',
      delta: -3,
      trend: 'down' as const,
      icon: <span>⚠️</span>,
    },
  ];

  const casesToReview = [
    {
      id: 'case-001',
      name: 'John Doe',
      method: 'Passport Scan',
      riskLevel: 'high' as const,
      riskScore: 78,
      tags: ['PEP', 'Sanctions'],
      timestamp: '2 min ago',
    },
    {
      id: 'case-002',
      name: 'Jane Smith',
      method: 'Driver License',
      riskLevel: 'medium' as const,
      riskScore: 45,
      tags: ['Manual Review'],
      timestamp: '5 min ago',
    },
    {
      id: 'case-003',
      name: 'Alex Johnson',
      method: 'Selfie Match',
      riskLevel: 'low' as const,
      riskScore: 12,
      tags: [],
      timestamp: '12 min ago',
    },
  ];

  const handleReview = (caseId: string) => {
    setSelectedCase(caseId);
    setInspectorOpen(true);
  };

  const currentCase = casesToReview.find((c) => c.id === selectedCase);

  return (
    <div className={styles.wrapper}>
      <Sidebar navItems={navItems} />
      <Header notifications={5} userName="Demo User" />

      <div className={styles.layout}>
        <main className={styles.main}>
          {/* Page Title */}
          <section className={styles.pageHeader}>
            <h1>UI Component Showcase</h1>
            <p>
              All dashboard components and design tokens. Use this page to verify styling and
              test interactions.
            </p>
          </section>

          {/* KPI Cards Section */}
          <section className={styles.section}>
            <h2>KPI Cards (Overview)</h2>
            <p className={styles.description}>
              4-column grid with metric, delta badge, and hover lift effect. Responsive to 2-col
              tablet and 1-col mobile.
            </p>
            <OverviewCards cards={kpiCards} />
          </section>

          {/* Review List Section */}
          <section className={styles.section}>
            <h2>Review List</h2>
            <p className={styles.description}>
              Vertical stack of cases with thumbnails, risk meters, and review buttons.
            </p>
            <div className={styles.reviewContainer}>
              <ReviewList cases={casesToReview} onReview={handleReview} />
            </div>
          </section>

          {/* Design Tokens Section */}
          <section className={styles.section}>
            <h2>Design Tokens</h2>

            {/* Colors */}
            <div className={styles.subsection}>
              <h3>Accent Colors</h3>
              <div className={styles.colorGrid}>
                <div className={styles.colorSwatch}>
                  <div
                    className={styles.swatch}
                    style={{ backgroundColor: '#ff5470' }}
                  />
                  <code>--color-accent-1</code>
                  <p>#ff5470</p>
                </div>
                <div className={styles.colorSwatch}>
                  <div
                    className={styles.swatch}
                    style={{ backgroundColor: '#7a5cff' }}
                  />
                  <code>--color-accent-2</code>
                  <p>#7a5cff</p>
                </div>
                <div className={styles.colorSwatch}>
                  <div
                    className={styles.swatch}
                    style={{ backgroundColor: '#4f46e5' }}
                  />
                  <code>--color-accent-3</code>
                  <p>#4f46e5</p>
                </div>
              </div>
            </div>

            {/* Risk Colors */}
            <div className={styles.subsection}>
              <h3>Risk Colors</h3>
              <div className={styles.colorGrid}>
                <div className={styles.colorSwatch}>
                  <div
                    className={styles.swatch}
                    style={{ backgroundColor: '#14b8a6' }}
                  />
                  <code>--risk-low</code>
                  <p>#14b8a6</p>
                </div>
                <div className={styles.colorSwatch}>
                  <div
                    className={styles.swatch}
                    style={{ backgroundColor: '#f59e0b' }}
                  />
                  <code>--risk-med</code>
                  <p>#f59e0b</p>
                </div>
                <div className={styles.colorSwatch}>
                  <div
                    className={styles.swatch}
                    style={{ backgroundColor: '#ff3860' }}
                  />
                  <code>--risk-high</code>
                  <p>#ff3860</p>
                </div>
              </div>
            </div>

            {/* Typography Scale */}
            <div className={styles.subsection}>
              <h3>Typography Scale</h3>
              <div className={styles.typeScale}>
                <div className={styles.typeItem}>
                  <span style={{ fontSize: '32px', fontWeight: 600 }}>Heading 1</span>
                  <code>--type-h1: 32px</code>
                </div>
                <div className={styles.typeItem}>
                  <span style={{ fontSize: '24px', fontWeight: 600 }}>Heading 2</span>
                  <code>--type-h2: 24px</code>
                </div>
                <div className={styles.typeItem}>
                  <span style={{ fontSize: '14px', fontWeight: 400 }}>Body Text</span>
                  <code>--type-base: 14px</code>
                </div>
                <div className={styles.typeItem}>
                  <span style={{ fontSize: '12px', fontWeight: 400 }}>Small Text</span>
                  <code>--type-small: 12px</code>
                </div>
              </div>
            </div>

            {/* Spacing */}
            <div className={styles.subsection}>
              <h3>Spacing Scale</h3>
              <div className={styles.spacingGrid}>
                <div className={styles.spacingItem}>
                  <div
                    className={styles.spacingBox}
                    style={{ width: '8px', height: '8px' }}
                  />
                  <code>--gap-sm: 8px</code>
                </div>
                <div className={styles.spacingItem}>
                  <div
                    className={styles.spacingBox}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <code>--gap-md: 16px</code>
                </div>
                <div className={styles.spacingItem}>
                  <div
                    className={styles.spacingBox}
                    style={{ width: '24px', height: '24px' }}
                  />
                  <code>--gap-lg: 24px</code>
                </div>
              </div>
            </div>
          </section>

          {/* Component Patterns Section */}
          <section className={styles.section}>
            <h2>Component Patterns</h2>

            <div className={styles.subsection}>
              <h3>Buttons</h3>
              <div className={styles.buttonGrid}>
                <button className="btn-primary">Primary Button</button>
                <button className="btn-secondary">Secondary Button</button>
                <button style={{ padding: '10px 16px', fontSize: '14px' }}>
                  Tertiary Button
                </button>
              </div>
            </div>

            <div className={styles.subsection}>
              <h3>Cards</h3>
              <div className="card" style={{ padding: '20px' }}>
                <h4>Card Heading</h4>
                <p>
                  This is a standard card component using semantic tokens for background, border,
                  and shadow.
                </p>
              </div>
            </div>

            <div className={styles.subsection}>
              <h3>Badges</h3>
              <div className={styles.badgeGrid}>
                <span className="badge-risk badge-risk-low">Low Risk</span>
                <span className="badge-risk badge-risk-med">Medium Risk</span>
                <span className="badge-risk badge-risk-high">High Risk</span>
              </div>
            </div>
          </section>

          {/* Testing Checklist */}
          <section className={styles.section}>
            <h2>Testing Checklist</h2>
            <ul className={styles.checklist}>
              <li>✓ Responsive at 320px, 768px, 1024px, 1440px widths</li>
              <li>✓ Keyboard navigation (Tab, Enter)</li>
              <li>✓ Focus visible on all interactive elements</li>
              <li>✓ Color contrast ≥4.5:1 (run: npm run theme:check)</li>
              <li>✓ No console CSS errors (npm run dev)</li>
              <li>✓ Animations respect prefers-reduced-motion</li>
              <li>✓ ARIA labels on icon-only buttons</li>
              <li>✓ Semantic HTML structure</li>
            </ul>
          </section>
        </main>
      </div>

      {/* Inspector Panel for demo */}
      {currentCase && (
        <InspectorPanel
          isOpen={inspectorOpen}
          onClose={() => {
            setInspectorOpen(false);
            setSelectedCase(null);
          }}
          caseDetails={{
            id: currentCase.id,
            riskScore: currentCase.riskScore,
            riskLevel: currentCase.riskLevel,
            status: 'Pending Review',
            xaiFactors: [
              { label: 'Face Match', weight: 0.8 },
              { label: 'Document Quality', weight: 0.6 },
              { label: 'Liveness Check', weight: 0.9 },
            ],
          }}
          onApprove={() => alert(`Approved: ${currentCase.id}`)}
          onRequestInfo={() => alert(`Requesting info for: ${currentCase.id}`)}
          onReject={() => alert(`Rejected: ${currentCase.id}`)}
        />
      )}
    </div>
  );
}
