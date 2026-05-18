'use client';
import { useAuth } from '@/lib/auth-context';
import { AppProvider } from '@/lib/context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isImpersonating, stopImpersonating, user } = useAuth();
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
      {isImpersonating && user && (
        <div style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 99,
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          color: 'white',
          fontSize: 13,
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span>Đang đóng vai: <strong style={{ color: '#FCD34D' }}>{user.name}</strong> ({user.position || user.role})</span>
          </div>
          <button 
            onClick={() => {
              stopImpersonating();
              window.location.href = '/admin';
            }} 
            style={{
              background: 'var(--isme-red)',
              color: 'white',
              border: 'none',
              borderRadius: 50,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Quay lại Admin gốc
          </button>
        </div>
      )}
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
