'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { users } from '@/lib/mock-data';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'isme_auth_user';
const DEFAULT_PASSWORD = 'isme2026';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved auth
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const foundUser = users.find(u => u.id === parsed.id);
        if (foundUser && foundUser.active) {
          setUser(foundUser);
        }
      }
    } catch {
      // Invalid storage, clear it
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      return { success: false, error: 'Vui lòng nhập email' };
    }
    if (!password) {
      return { success: false, error: 'Vui lòng nhập mật khẩu' };
    }

    const foundUser = users.find(u => u.email.toLowerCase() === trimmedEmail);
    
    if (!foundUser) {
      return { success: false, error: 'Email không tồn tại trong hệ thống' };
    }

    if (!foundUser.active) {
      return { success: false, error: 'Tài khoản đã bị vô hiệu hóa' };
    }

    if (password !== DEFAULT_PASSWORD) {
      return { success: false, error: 'Mật khẩu không đúng' };
    }

    setUser(foundUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ id: foundUser.id }));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
