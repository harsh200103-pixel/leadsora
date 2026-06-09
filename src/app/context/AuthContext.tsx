"use client";
import React, { createContext, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface User {
  name: string;
  email: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loginWithGoogle: () => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  const user: User | null = session?.user
    ? {
        name: session.user.name || 'User',
        email: session.user.email || '',
        image: session.user.image || undefined,
      }
    : null;

  // Email/password login — stores users in localStorage for now
  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('dealfinder_users') || '[]');
    const found = users.find((u: any) => u.email === email && u.password === password);
    if (!found) return false;
    // Sign in with credentials via NextAuth
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    return !result?.error;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('dealfinder_users') || '[]');
    const exists = users.find((u: any) => u.email === email);
    if (exists) return false;
    users.push({ name, email, password });
    localStorage.setItem('dealfinder_users', JSON.stringify(users));
    // Auto login after signup
    await signIn('credentials', { redirect: false, email, password });
    return true;
  };

  const logout = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Real Google OAuth
  const loginWithGoogle = async (): Promise<boolean> => {
    // Dummy implementation as requested by user
    const dummyUser = { name: 'Google User', email: 'demo@leadsora.com', password: 'google_dummy_password' };
    
    const users = JSON.parse(localStorage.getItem('dealfinder_users') || '[]');
    const exists = users.find((u: any) => u.email === dummyUser.email);
    if (!exists) {
      users.push(dummyUser);
      localStorage.setItem('dealfinder_users', JSON.stringify(users));
    }
    
    // Attempt standard credentials login to set the NextAuth cookie
    await signIn('credentials', { redirect: false, email: dummyUser.email, password: dummyUser.password });
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loginWithGoogle, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
