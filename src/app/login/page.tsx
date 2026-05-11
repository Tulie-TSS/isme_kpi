'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Small delay for UX feel
    await new Promise(resolve => setTimeout(resolve, 600));

    const result = login(email, password);
    if (result.success) {
      router.replace('/');
    } else {
      setError(result.error || 'Đăng nhập thất bại');
      setIsSubmitting(false);
    }
  };

  if (isLoading || !mounted) {
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

  if (isAuthenticated) return null;

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-orb login-bg-orb-1" />
        <div className="login-bg-orb login-bg-orb-2" />
        <div className="login-bg-orb login-bg-orb-3" />
        <div className="login-bg-grid" />
      </div>

      <div className="login-container">
        {/* Left - Branding */}
        <div className="login-branding">
          <div className="login-branding-content">
            <div className="login-logo">
              <div className="login-logo-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.15" />
                  <path d="M16 14h16v4H20v6h10v4H20v6h12v4H16V14z" fill="white" />
                </svg>
              </div>
              <div>
                <h1 className="login-brand-name">ISME Ops OS</h1>
                <p className="login-brand-sub">Operations & KPI Management</p>
              </div>
            </div>

            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-icon">📊</div>
                <div>
                  <h3>Quản lý KPI thông minh</h3>
                  <p>Theo dõi hiệu suất real-time cho từng nhân viên và chương trình</p>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">📋</div>
                <div>
                  <h3>Task Management</h3>
                  <p>Kanban board, Gantt chart, và Calendar view tích hợp</p>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">⭐</div>
                <div>
                  <h3>Đánh giá & Review</h3>
                  <p>Quy trình review minh bạch cho từng kỳ đánh giá</p>
                </div>
              </div>
            </div>

            <div className="login-footer-text">
              © 2026 Viện Đào tạo Quốc tế ISME
            </div>
          </div>
        </div>

        {/* Right - Login Form */}
        <div className="login-form-section">
          <div className="login-form-wrapper">
            <div className="login-form-header">
              <h2>Đăng nhập</h2>
              <p>Nhập email và mật khẩu để tiếp tục</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="login-error animate-fade-in">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="login-field">
                <label htmlFor="email">Email</label>
                <div className="login-input-wrap">
                  <Mail size={18} className="login-input-icon" />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@isneu.org"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    autoComplete="email"
                    autoFocus
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password">Mật khẩu</label>
                <div className="login-input-wrap">
                  <Lock size={18} className="login-input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="login-spinner-sm" />
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
