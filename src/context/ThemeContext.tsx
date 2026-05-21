'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Theme } from '@/types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'blue',
  setTheme: () => {},
});

export function ThemeProvider({ children, initialTheme = 'blue' }: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    // Read from localStorage on mount
    const saved = localStorage.getItem('buzzbeats-theme') as Theme | null;
    if (saved && ['blue', 'purple', 'grey', 'pink', 'green'].includes(saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', initialTheme);
    }
  }, [initialTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('buzzbeats-theme', newTheme);
    // Persist to Supabase profile if logged in
    // (handled by settings page separately to avoid circular dependency)
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
