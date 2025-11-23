import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextData {
  theme: Theme;
  setTheme: (t: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
  colors: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

const STORAGE_KEY = '@app_theme';

const lightColors: Record<string, string> = {
  background: '#ffffff',
  surface: '#f5f5f5',
  primary: '#2fd24a',
  text: '#333333',
  muted: '#666666',
};

const darkColors: Record<string, string> = {
  background: '#0f1720',
  surface: '#111827',
  primary: '#34d399',
  text: '#e6eef3',
  muted: '#9ca3af',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // start with dark so "ativar modo escuro" is immediate when user asks
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw === 'dark' || raw === 'light') {
          setThemeState(raw);
        } else {
          // if nothing stored, keep dark as requested
          setThemeState('dark');
          await AsyncStorage.setItem(STORAGE_KEY, 'dark');
        }
      } catch (e) {
        console.error('Failed to load theme', e);
      }
    };
    load();
  }, []);

  const persist = async (next: Theme) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      console.error('Failed to persist theme', e);
    }
  };

  const setTheme = async (t: Theme) => {
    setThemeState(t);
    await persist(t);
  };

  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    await setTheme(next);
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export default ThemeContext;
