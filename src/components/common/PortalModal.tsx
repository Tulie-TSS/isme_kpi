'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number | string;
}

export default function PortalModal({ isOpen, onClose, children, maxWidth = 540 }: PortalModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="portal-overlay" onClick={onClose}>
      <div 
        className="portal-dialog" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
