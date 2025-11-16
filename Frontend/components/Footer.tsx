import Link from 'next/link';
import styles from './Footer.module.scss';

/**
 * Footer component with links and copyright
 */
export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.title}>TrustLock</h3>
            <p className={styles.description}>
              Secure KYC verification with explainable AI
            </p>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Resources</h4>
            <ul className={styles.links}>
              <li>
                <Link href="/docs">Documentation</Link>
              </li>
              <li>
                <Link href="/admin/integrations">Integrations</Link>
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Legal</h4>
            <ul className={styles.links}>
              <li>
                <Link href="/docs#privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/docs#terms">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>&copy; {new Date().getFullYear()} TrustLock. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

