'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, description?: string, duration?: number) => void;
  toast: {
    success: (message: string, description?: string) => void;
    error: (message: string, description?: string) => void;
    warning: (message: string, description?: string) => void;
    info: (message: string, description?: string) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, description?: string, duration = 4000) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const newToast: ToastItem = { id, type, message, description, duration };
    
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: useCallback((message: string, description?: string) => showToast('success', message, description), [showToast]),
    error: useCallback((message: string, description?: string) => showToast('error', message, description), [showToast]),
    warning: useCallback((message: string, description?: string) => showToast('warning', message, description), [showToast]),
    info: useCallback((message: string, description?: string) => showToast('info', message, description), [showToast]),
  };

  return (
    <ToastContext.Provider value={{ showToast, toast, removeToast }}>
      {children}
      {/* Toast Floating Container */}
      <div 
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
          maxWidth: 'min(90vw, 420px)',
          width: '100%',
        }}
      >
        {toasts.map(t => {
          const config = {
            success: {
              bg: '#FFFFFF',
              border: '#A7F3D0',
              iconColor: '#059669',
              barColor: '#10B981',
              titleColor: '#064E3B',
              icon: CheckCircle2,
            },
            error: {
              bg: '#FFFFFF',
              border: '#FECACA',
              iconColor: '#DC2626',
              barColor: '#EF4444',
              titleColor: '#7F1D1D',
              icon: AlertCircle,
            },
            warning: {
              bg: '#FFFFFF',
              border: '#FDE68A',
              iconColor: '#D97706',
              barColor: '#F59E0B',
              titleColor: '#78350F',
              icon: AlertTriangle,
            },
            info: {
              bg: '#FFFFFF',
              border: '#BFDBFE',
              iconColor: '#2563EB',
              barColor: '#3B82F6',
              titleColor: '#1E3A8A',
              icon: Info,
            },
          }[t.type];

          const IconComponent = config.icon;

          return (
            <div
              key={t.id}
              className="animate-slide-in"
              style={{
                pointerEvents: 'auto',
                background: config.bg,
                border: `1px solid ${config.border}`,
                borderRadius: 12,
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.04)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Left Accent Indicator */}
              <div 
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: config.barColor,
                }} 
              />

              <div style={{ marginTop: 2, flexShrink: 0 }}>
                <IconComponent size={20} color={config.iconColor} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: config.titleColor, lineHeight: 1.4 }}>
                  {t.message}
                </div>
                {t.description && (
                  <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 2, lineHeight: 1.35 }}>
                    {t.description}
                  </div>
                )}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 4,
                  cursor: 'pointer',
                  color: 'var(--gray-400)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  marginTop: -2,
                  marginRight: -4,
                }}
                title="Đóng thông báo"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
