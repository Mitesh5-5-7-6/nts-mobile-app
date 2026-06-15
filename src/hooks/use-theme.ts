import { useAppTheme } from '@/theme';

export function useTheme() {
  const { colors } = useAppTheme();
  return colors;
}

