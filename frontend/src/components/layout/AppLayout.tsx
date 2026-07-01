'use client';
import { AuthProvider, useAuth } from '@/lib/auth';
import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-[1600px] mx-auto">
          {children}
        </div>
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
