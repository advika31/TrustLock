'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.scss';

/**
 * Sidebar Navigation Component
 * Dark premium sidebar with collapsible state and keyboard-accessible nav
 */

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  navItems: NavItem[];
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems, onCollapsedChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const handleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Collapse button */}
      <button
        className={styles.collapseButton}
        onClick={handleCollapse}
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        title={isCollapsed ? 'Expand' : 'Collapse'}
        data-testid="sidebar-collapse-btn"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hamburger/close icon */}
          <path
            d="M3 5h14M3 10h14M3 15h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Navigation list */}
      <nav className={styles.nav}>
        <ul className={styles.navList} role="list">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} role="listitem">
                <Link
                  href={item.href}
                  className={`${styles.navItem} ${active ? styles.active : ''}`}
                  title={item.label}
                  data-testid={`nav-link-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  <span className={styles.label}>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span
                      className={styles.badge}
                      aria-label={`${item.badge} items`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer info (optional) */}
      <div className={styles.footer}>
        <span className={styles.version}>v2.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
