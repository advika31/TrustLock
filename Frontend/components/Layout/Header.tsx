'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './Header.module.scss';

/**
 * Header Component
 * Premium header with search, notifications, language switcher, and user menu
 */

interface HeaderProps {
  onSearch?: (query: string) => void;
  notifications?: number;
  userName?: string;
  userAvatar?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  notifications = 0,
  userName = 'User',
  userAvatar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <header className={styles.header} role="banner">
      <div className={styles.container}>
        {/* Logo / Branding */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>TL</div>
          <span className={styles.logoText}>TrustLock</span>
        </div>

        {/* Search bar (centered) */}
        <div className={styles.searchBar}>
          <svg
            className={styles.searchIcon}
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 12l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search cases, documents..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchInput}
            aria-label="Search"
          />
        </div>

        {/* Right section: notifications, language, user */}
        <div className={styles.rightSection}>
          {/* Notifications */}
          <button
            className={styles.iconButton}
            aria-label={`Notifications ${notifications > 0 ? `(${notifications} unread)` : ''}`}
            title="Notifications"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 2C10 2 6 6 6 10V15H14V10C14 6 10 2 10 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path d="M9 18H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {notifications > 0 && (
              <span className={styles.badge} aria-hidden="true">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>

          {/* Language switcher */}
          <button
            className={styles.iconButton}
            aria-label="Language"
            title="Language settings"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M10 2C12 4 13 7 13 10C13 13 12 16 10 18M10 2C8 4 7 7 7 10C7 13 8 16 10 18"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="M2 10H18" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>

          {/* User menu */}
          <div className={styles.userMenu} ref={userMenuRef}>
            <button
              className={styles.userButton}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              aria-label={`User menu for ${userName}`}
            >
              <div className={styles.avatar}>
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} />
                ) : (
                  <span>{userName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <svg
                className={`${styles.chevron} ${isUserMenuOpen ? styles.open : ''}`}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {isUserMenuOpen && (
              <div className={styles.dropdown} role="menu">
                <a href="/profile" className={styles.menuItem} role="menuitem">
                  Profile
                </a>
                <a href="/settings" className={styles.menuItem} role="menuitem">
                  Settings
                </a>
                <hr className={styles.divider} />
                <button
                  className={styles.menuItem}
                  onClick={() => {
                    // Handle logout
                    setIsUserMenuOpen(false);
                  }}
                  role="menuitem"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
