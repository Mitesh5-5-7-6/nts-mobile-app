import { createStorageHelper } from './index';

const settingsStorage = createStorageHelper('settings');

const KEYS = {
  THEME: 'theme',
};

export type ThemeType = 'light' | 'dark' | 'system';

export const getTheme = (): ThemeType => {
  return (settingsStorage.getString(KEYS.THEME) as ThemeType) || 'system';
};

export const setTheme = (theme: ThemeType) => {
  settingsStorage.set(KEYS.THEME, theme);
};
