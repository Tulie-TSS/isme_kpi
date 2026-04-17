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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState<Role>('staff');
  const [currentUserId, setCurrentUserId] = useState('u9');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  // Sync role and userId from authenticated user
  useEffect(() => {
    if (user) {
      setCurrentRole(user.role);
      setCurrentUserId(user.id);
      setUserRoles(user.roles || []);
    }
  }, [user]);

  const hasRole = (role: UserRole): boolean => userRoles.includes(role);
  const hasAnyRole = (...roles: UserRole[]): boolean => roles.some(r => userRoles.includes(r));

  return (
    <AppContext.Provider value={{ currentRole, setCurrentRole, currentUserId, setCurrentUserId, sidebarOpen, setSidebarOpen, userRoles, hasRole, hasAnyRole }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
