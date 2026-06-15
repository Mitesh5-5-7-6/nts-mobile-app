import { colors } from './colors';
import { spacing } from './spacing';
import { radius } from './radius';
import { typography } from './typography';
import { shadows } from './shadows';
import { animations } from './animations';
import { responsive } from './responsive';

export { colors, palette } from './colors';
export { spacing } from './spacing';
export { radius } from './radius';
export { typography } from './typography';
export { shadows } from './shadows';
export { animations } from './animations';
export { responsive, useResponsive } from './responsive';
export { ThemeProvider, useAppTheme, type ThemeModeType } from './ThemeProvider';

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  animations,
  responsive,
} as const;

export type ThemeType = typeof theme;
export default theme;

