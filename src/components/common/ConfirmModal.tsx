'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import PortalModal from '@/components/common/PortalModal';
import { HelpCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success' | 'warning';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setModalState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (modalState) {
      modalState.resolve(true);
      setModalState(null);
    }
  };

  const handleCancel = () => {
    if (modalState) {
      modalState.resolve(false);
      setModalState(null);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalState?.isOpen) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState]);

  const opts = modalState?.options;
  const variant = opts?.confirmVariant || 'primary';

  const variantConfig = {
    primary: {
      btnBg: '#2563EB',
      btnHover: '#1D4ED8',
      icon: HelpCircle,
      iconColor: '#2563EB',
      iconBg: '#EFF6FF',
    },
    success: {
      btnBg: '#059669',
      btnHover: '#047857',
      icon: CheckCircle,
      iconColor: '#059669',
      iconBg: '#ECFDF5',
    },
    danger: {
      btnBg: '#DC2626',
      btnHover: '#B91C1C',
      icon: AlertTriangle,
      iconColor: '#DC2626',
      iconBg: '#FEF2F2',
    },
    warning: {
      btnBg: '#D97706',
      btnHover: '#B45309',
      icon: AlertTriangle,
      iconColor: '#D97706',
      iconBg: '#FFFBEB',
    },
  }[variant];

  const IconComponent = variantConfig.icon;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {modalState?.isOpen && opts && (
        <PortalModal isOpen={true} onClose={handleCancel} maxWidth={440}>
          <div style={{ padding: '24px 24px 20px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div 
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: variantConfig.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconComponent size={24} color={variantConfig.iconColor} />
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                  {opts.title}
                </h3>
                <p style={{ fontSize: 13.5, color: 'var(--gray-600)', margin: 0, lineHeight: 1.5 }}>
                  {opts.message}
                </p>
              </div>

              <button
                onClick={handleCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gray-400)',
                  cursor: 'pointer',
                  padding: 4,
                  margin: '-4px -4px 0 0',
                  borderRadius: 6,
                  display: 'flex',
                }}
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 24,
                paddingTop: 16,
                borderTop: '1px solid var(--gray-100)',
              }}
            >
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: '1px solid var(--gray-300)',
                  background: '#FFFFFF',
                  color: 'var(--gray-700)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                {opts.cancelText || 'Hủy'}
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: variantConfig.btnBg,
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  transition: 'background 0.15s ease',
                }}
              >
                {opts.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </PortalModal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context.confirm;
}
