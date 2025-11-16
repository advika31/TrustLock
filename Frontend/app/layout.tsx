import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import '../styles/globals.scss';

export const metadata: Metadata = {
  title: 'TrustLock - Secure KYC Verification',
  description: 'Secure KYC verification with explainable AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}

