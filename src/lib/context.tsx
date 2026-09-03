'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role, UserRole } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

interface AppContextType {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  // Multi-role helpers
  userRoles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (...roles: UserRole[]) => boolean;
  selectedProgramId: string | 'all';
  setSelectedProgramId: (id: string | 'all') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState<Role>('staff');
  const [currentUserId, setCurrentUserId] = useState('u9');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | 'all'>('all');
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  // Sync role and userId from authenticated user
  useEffect(() => {
    if (user) {
      setCurrentRole(user.role);
      setCurrentUserId(user.id);
      setUserRoles(user.roles || []);
    }
  }, [user]);

  // Automatic web keep-alive ping: keeps database active whenever web is opened
  useEffect(() => {
    try {
      const lastPing = localStorage.getItem('isme_last_keepalive_ping');
      const now = Date.now();
      // Ping once per 12 hours when anyone uses the app
      if (!lastPing || now - parseInt(lastPing, 10) > 12 * 60 * 60 * 1000) {
        fetch('/api/health').catch(() => {});
        localStorage.setItem('isme_last_keepalive_ping', String(now));
      }
    } catch (_) {}
  }, []);

  const hasRole = (role: UserRole): boolean => userRoles.includes(role);
  const hasAnyRole = (...roles: UserRole[]): boolean => roles.some(r => userRoles.includes(r));

  return (
    <AppContext.Provider value={{ 
      currentRole, setCurrentRole, currentUserId, setCurrentUserId, sidebarOpen, setSidebarOpen, 
      userRoles, hasRole, hasAnyRole, selectedProgramId, setSelectedProgramId 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
