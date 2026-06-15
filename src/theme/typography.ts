export const typography = {
  family: {
    display: 'System', // Matches Spline Sans, Inter etc. on platforms
    sans: 'System',    // Alias for display
    mono: 'System',
    rounded: 'System',
    serif: 'System',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 15,   // Midpoint between sm and base for subtitle/nav use
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    giant: 36,
  },
  weight: {
    thin: '100' as const,
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    base: 1.5,
    relaxed: 1.75,
  },
} as const;

export type TypographyType = typeof typography;
export default typography;
