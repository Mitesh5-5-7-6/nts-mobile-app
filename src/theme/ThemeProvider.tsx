import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from '../hooks/use-color-scheme';
import { storage } from '../utils/storage';
import { animations } from './animations';
import { colors } from './colors';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export type ThemeModeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeModeType;
  setThemeMode: (mode: ThemeModeType) => void;
  isDark: boolean;
  colors: typeof colors.light;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows;
  animations: typeof animations;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Read persisted theme mode from MMKV, defaulting to 'system'
  const [themeMode, setThemeModeState] = useState<ThemeModeType>(() => {
    const saved = storage.getString('themeMode');
    return (saved as ThemeModeType) || 'system';
  });

  const systemColorScheme = useColorScheme();

  // Determine if dark mode is active
  const isDark =
    themeMode === 'system'
      ? systemColorScheme === 'dark'
      : themeMode === 'dark';

  const setThemeMode = (mode: ThemeModeType) => {
    setThemeModeState(mode);
    storage.set('themeMode', mode);
  };

  const activeColors = isDark ? colors.dark : colors.light;

  const contextValue: ThemeContextType = {
    themeMode,
    setThemeMode,
    isDark,
    colors: activeColors,
    spacing,
    radius,
    typography,
    shadows,
    animations,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}
