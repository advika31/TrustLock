import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { ErrorBoundary } from './ErrorBoundary';
import '../styles/globals.scss';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout component wrapping all pages
 * Includes Header, Footer, and ErrorBoundary
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <ErrorBoundary>
      <div className="layout">
        <Header />
        <main role="main">{children}</main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

