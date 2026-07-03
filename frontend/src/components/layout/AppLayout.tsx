'use client';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth';
import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';
import { useState } from 'react';

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-slate-400 font-semibold tracking-wide uppercase">
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
      {/* Mobile sidebar overlay */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileToggle={() => setMobileSidebarOpen(false)}
      />

      {/* Desktop sidebar */}
      <div className="hidden md:block sticky top-0 h-screen shrink-0">
        <Sidebar />
      </div>

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar with hamburger */}
        <div className="sticky top-0 z-30 md:hidden bg-white border-b border-slate-200 px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2.5 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={22} className="text-slate-600" />
          </button>
          <Link href="/dashboard" className="text-lg font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
            SmartPOS
          </Link>
        </div>
        {/* Spacer for fixed top bar on mobile */}
        <div className="md:hidden h-0" />
        <div className="flex-1 p-4 sm:p-6 max-w-[1600px] mx-auto w-full">
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
