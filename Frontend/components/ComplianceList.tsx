'use client';

import { useState, useEffect } from 'react';
import type { ApplicationSummary, ListApplicationsFilter } from '@/types';
import { listApplications } from '@/lib/api';
import ComplianceItem from './ComplianceItem';
import styles from './ComplianceList.module.scss';

interface ComplianceListProps {
  onItemClick: (applicationId: string) => void;
}

/**
 * ComplianceList component displaying filtered list of applications
 * Includes search, filters, and loading/empty states
 */
export default function ComplianceList({ onItemClick }: ComplianceListProps) {
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListApplicationsFilter>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadApplications();
  }, [filters]);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const filterWithSearch = { ...filters, search: searchQuery || undefined };
      const data = await listApplications(filterWithSearch);
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Debounce search
    const timeoutId = setTimeout(() => {
      loadApplications();
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleFilterChange = (key: keyof ListApplicationsFilter, value: string | undefined) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (value) {
        newFilters[key] = value as any;
      } else {
        delete newFilters[key];
      }
      return newFilters;
    });
  };

  return (
    <div className={styles.complianceList}>
      <div className={styles.header}>
        <h2 className={styles.title}>Compliance Dashboard</h2>
        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className={styles.searchInput}
            aria-label="Search applications"
          />

          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className={styles.filterSelect}
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="flagged">Flagged</option>
            <option value="rejected">Rejected</option>
            <option value="info_requested">Info Requested</option>
          </select>

          <select
            value={filters.risk_level || ''}
            onChange={(e) => handleFilterChange('risk_level', e.target.value || undefined)}
            className={styles.filterSelect}
            aria-label="Filter by risk level"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className={styles.loading} role="status" aria-live="polite">
          <p>Loading applications...</p>
        </div>
      )}

      {error && (
        <div className={styles.error} role="alert">
          <p>Error: {error}</p>
          <button onClick={loadApplications} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <div className={styles.empty} role="status">
          <p>No applications found matching your filters.</p>
        </div>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className={styles.list} role="list">
          {applications.map((app) => (
            <ComplianceItem
              key={app.application_id}
              application={app}
              onClick={() => onItemClick(app.application_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

