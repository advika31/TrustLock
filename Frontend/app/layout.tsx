import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Layout from '@/components/Layout';
import Providers from '@/components/Providers';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import '../styles/globals.scss';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'TrustLock - Secure KYC Verification',
  description: 'Secure KYC verification with explainable AI',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Providers>
          <Layout>
            {children}
            <ServiceWorkerRegister />
          </Layout>
        </Providers>
      </body>
    </html>
  );
}

