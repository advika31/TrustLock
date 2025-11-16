'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './Header.module.scss';

/**
 * Header component with navigation and theme toggle
 * Responsive with mobile menu
 */
export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark-mode');
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/onboard', label: 'Get Started' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/admin/integrations', label: 'Integrations' },
    { href: '/docs', label: 'Docs' },
  ];

  return (
    <header className={styles.header} role="banner">
      <div className={styles.container}>
        <div className={styles.content}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>🔒</span>
            <span className={styles.logoText}>TrustLock</span>
          </Link>

          <nav className={styles.nav} aria-label="Main navigation">
            <button
              className={styles.mobileToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
              aria-controls="main-nav"
            >
              <span className={styles.hamburger}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>

            <ul
              id="main-nav"
              className={`${styles.navList} ${mobileMenuOpen ? styles.navListOpen : ''}`}
            >
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <button
            className={styles.themeToggle}
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}

