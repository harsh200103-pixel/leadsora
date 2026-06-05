"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to light mode
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // v2: Always reset to light mode (first time upgrade from old dark-only version)
    // Only use saved preference if user has explicitly toggled it after the v2 upgrade
    const saved = localStorage.getItem('leadsora_theme_v2') as Theme | null;
    const initial = saved || 'light';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
    // Also update the blocking script key in layout
    document.documentElement.setAttribute('data-theme', initial);
  }, []);



  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('leadsora_theme_v2', next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
