'use client';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth';
import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-semibold tracking-wide uppercase">
        <p className="text-center sm:text-left leading-relaxed">
          &copy; {new Date().getFullYear()} SmartPOS Technologies Inc. All rights reserved.
        </p>
        <div className="flex gap-6 justify-end text-[11px]">
          <Link href="/security" className="hover:text-slate-600 transition-colors">Security Center</Link>
          <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="sticky top-0 h-screen shrink-0">
        <Sidebar />
      </div>
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppContent>{children}</AppContent>
    </AuthProvider>
  );
}
