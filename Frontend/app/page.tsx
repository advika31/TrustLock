import Link from 'next/link';
import styles from './page.module.scss';

/**
 * Landing page with Get Started CTA
 * Responsive design with clear call-to-action
 */
export default function HomePage() {
  return (
    <div className={styles.landing}>
      <div className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.content}>
            <h1 className={styles.title}>
              TrustLock
              <span className={styles.subtitle}>Secure KYC Verification</span>
            </h1>
            <p className={styles.description}>
              Verify identities with confidence using explainable AI. Our platform
              combines document OCR, face matching, and risk assessment to provide
              transparent, auditable KYC decisions.
            </p>
            <div className={styles.ctaGroup}>
              <Link href="/onboard" className={styles.ctaPrimary}>
                Get Started
              </Link>
              <Link href="/docs" className={styles.ctaSecondary}>
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.featuresTitle}>Key Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📄</div>
              <h3 className={styles.featureTitle}>Document OCR</h3>
              <p className={styles.featureDescription}>
                Extract and verify information from ID documents with high accuracy.
              </p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>👤</div>
              <h3 className={styles.featureTitle}>Face Matching</h3>
              <p className={styles.featureDescription}>
                Compare ID photos with selfies using advanced biometric verification.
              </p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🤖</div>
              <h3 className={styles.featureTitle}>Explainable AI</h3>
              <p className={styles.featureDescription}>
                Transparent decision traces showing how risk scores are calculated.
              </p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🔒</div>
              <h3 className={styles.featureTitle}>Compliance Dashboard</h3>
              <p className={styles.featureDescription}>
                Review and manage applications with comprehensive audit trails.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

