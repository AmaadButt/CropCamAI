import React, { createContext, useContext, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { themes, type Theme } from './colors';

export type ThemeContextValue = {
  theme: Theme;
  scheme: ColorSchemeName;
  toggleScheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = Appearance.getColorScheme();
  const [scheme, setScheme] = useState<ColorSchemeName>(systemScheme ?? 'dark');

  const value = useMemo<ThemeContextValue>(() => {
    const theme = scheme === 'dark' ? themes.dark : themes.light;
    return {
      theme,
      scheme,
      toggleScheme: () => setScheme(prev => (prev === 'dark' ? 'light' : 'dark'))
    };
  }, [scheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
