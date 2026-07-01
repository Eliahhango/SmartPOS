import type { Metadata } from 'next';
import './globals.css';
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'SmartPOS - Supermarket POS & Inventory System',
  description: 'The Simple, Secure, and Scalable Way to Run Your Business',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
