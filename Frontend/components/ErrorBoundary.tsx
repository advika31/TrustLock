'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.scss';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component to catch UI errors and show friendly message
 * Used for demo purposes to gracefully handle errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, log to error reporting service
    if (process.env.NEXT_PUBLIC_MOCK === 'true') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.errorBoundary} role="alert">
          <div className={styles.content}>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.message}>
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {process.env.NEXT_PUBLIC_MOCK === 'true' && this.state.error && (
              <details className={styles.details}>
                <summary>Error details (mock mode only)</summary>
                <pre className={styles.errorText}>{this.state.error.message}</pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className={styles.button}
              type="button"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

