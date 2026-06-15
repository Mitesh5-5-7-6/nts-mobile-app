export const colors = {
  light: {
    primary: '#208AEF',
    primaryLight: '#E6F4FE',
    primaryDark: '#1166B4',
    secondary: '#7C3AED', // Premium Violet
    secondaryLight: '#F3E8FF',
    secondaryDark: '#5B21B6',
    
    // Status
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEF2F2',
    info: '#3B82F6',
    infoLight: '#EFF6FF',

    // Neutrals
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
      950: '#030712',
    },

    // Layout
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    icon: '#4B5563',
  },
  dark: {
    primary: '#3B9EFF',
    primaryLight: '#0B2545',
    primaryDark: '#1A5F9E',
    secondary: '#A78BFA', // Violet
    secondaryLight: '#2E1065',
    secondaryDark: '#7C3AED',

    // Status
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#78350F',
    error: '#F87171',
    errorLight: '#7F1D1D',
    info: '#60A5FA',
    infoLight: '#1E3A8A',

    // Neutrals
    neutral: {
      50: '#030712',
      100: '#111827',
      200: '#1F2937',
      300: '#374151',
      400: '#4B5563',
      500: '#6B7280',
      600: '#9CA3AF',
      700: '#D1D5DB',
      800: '#E5E7EB',
      900: '#F3F4F6',
      950: '#F9FAFB',
    },

    // Layout
    background: '#0B0F19',
    backgroundSecondary: '#111827',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    card: '#151C2C',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    border: '#1F2937',
    icon: '#9CA3AF',
  },
};
export type ColorsType = typeof colors.light;
export type ColorSchemeType = 'light' | 'dark';
export const palette = colors;
export default colors;
