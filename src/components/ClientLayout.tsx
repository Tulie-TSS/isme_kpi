'use client';
import { useAuth } from '@/lib/auth-context';
import { AppProvider } from '@/lib/context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gray-50)',
      }}>
        <div className="login-spinner" />
      </div>
    );
  }

  // If on login page, render children directly (no sidebar/header)
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // If not authenticated and not on login, show nothing (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated - show full layout
  return (
    <AppProvider>
      <Sidebar />
      <Header />
      <main className="main-content">
        {children}
      </main>
    </AppProvider>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}
