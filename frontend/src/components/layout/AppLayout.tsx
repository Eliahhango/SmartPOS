'use client';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth';
import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Close mobile drawer on route change (e.g. browser back)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

  const sideBarWidth = sidebarCollapsed ? 'w-16' : 'w-64';

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen w-full overflow-x-hidden">
      {/* ─── Desktop sidebar (fixed, pinned left, visible lg+) ─── */}
      <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 ${sideBarWidth} bg-zinc-900 text-white z-30 transition-all duration-300`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        />
      </aside>

      {/* ─── Mobile drawer overlay (hidden lg+) ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-zinc-900 text-white flex flex-col shadow-2xl">
            <Sidebar
              isMobileDrawer
              onNavClick={() => setMobileMenuOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ─── Main content area ─── */}
      <main className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        {/* Mobile top bar with hamburger */}
        <div className="sticky top-0 z-20 lg:hidden bg-white border-b border-slate-200 px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2.5 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={22} className="text-slate-600" />
          </button>
          <Link href="/dashboard" className="text-lg font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
            SmartPOS
          </Link>
        </div>

        {/* Page content */}
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
