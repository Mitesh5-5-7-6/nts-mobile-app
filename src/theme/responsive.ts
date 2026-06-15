import { useWindowDimensions } from 'react-native';

export const breakpoints = {
  sm: 375,  // Small phones
  md: 768,  // Tablets / Foldables (portrait)
  lg: 1024, // Tablets / iPads (landscape)
  xl: 1280, // Large screens / Web layouts
} as const;

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isSmallDevice = width < breakpoints.sm;
  const isMediumDevice = width >= breakpoints.sm && width < breakpoints.md;
  const isLargeDevice = width >= breakpoints.md && width < breakpoints.lg;
  const isTablet = width >= breakpoints.md;
  const isDesktop = width >= breakpoints.lg;

  /**
   * Select a value based on the current screen size.
   * Matches the narrowest breakpoint that applies to the current screen width.
   */
  const select = <T>(map: { sm?: T; md?: T; lg?: T; xl?: T; default: T }): T => {
    if (width >= breakpoints.xl && map.xl !== undefined) return map.xl;
    if (width >= breakpoints.lg && map.lg !== undefined) return map.lg;
    if (width >= breakpoints.md && map.md !== undefined) return map.md;
    if (width < breakpoints.sm && map.sm !== undefined) return map.sm;
    return map.default;
  };

  return {
    width,
    height,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    isTablet,
    isDesktop,
    breakpoints,
    select,
  };
}

export const responsive = {
  breakpoints,
  useResponsive,
} as const;

export type ResponsiveType = typeof responsive;
export default responsive;
