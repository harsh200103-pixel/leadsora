"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  email: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('dealfinder_user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) {}
    }
    setIsLoading(false);
  }, []);

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Store user credentials locally (demo mode)
    const users = JSON.parse(localStorage.getItem('dealfinder_users') || '[]');
    const exists = users.find((u: any) => u.email === email);
    if (exists) return false;

    users.push({ name, email, password });
    localStorage.setItem('dealfinder_users', JSON.stringify(users));

    const newUser = { name, email };
    localStorage.setItem('dealfinder_user', JSON.stringify(newUser));
    setUser(newUser);
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('dealfinder_users') || '[]');
    const found = users.find((u: any) => u.email === email && u.password === password);
    if (!found) return false;

    const loggedInUser = { name: found.name, email: found.email };
    localStorage.setItem('dealfinder_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('dealfinder_user');
    setUser(null);
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    // Simulate Google Login delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const googleUser = { name: 'Google User', email: 'user@gmail.com' };
    localStorage.setItem('dealfinder_user', JSON.stringify(googleUser));
    setUser(googleUser);
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
