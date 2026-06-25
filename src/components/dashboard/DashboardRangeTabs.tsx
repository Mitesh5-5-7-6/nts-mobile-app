import { useAppTheme } from '@/theme';
import type { DashboardQueryParams } from '@/types/api.types';
import { toApiDate } from '@/utils/format';
import { subDays } from 'date-fns';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

export type DashboardRangeKey = 'today' | 'yesterday' | 'week' | 'month';

export const DASHBOARD_RANGES: { key: DashboardRangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

/** Map a UI range chip to the documented dashboard query params. */
export const rangeToParams = (key: DashboardRangeKey): DashboardQueryParams => {
  switch (key) {
    case 'yesterday': {
      const y = toApiDate(subDays(new Date(), 1));
      return { fromDate: y, toDate: y };
    }
    case 'week':
      return { range: 'WEEK' };
    case 'month':
      return { range: 'MONTH' };
    case 'today':
    default:
      return { range: 'DAY' };
  }
};

interface DashboardRangeTabsProps {
  value: DashboardRangeKey;
  onChange: (key: DashboardRangeKey) => void;
}

export const DashboardRangeTabs = React.memo(
  ({ value, onChange }: DashboardRangeTabsProps) => {
    const { colors, spacing, radius, typography } = useAppTheme();

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.container, { paddingHorizontal: spacing.lg, gap: spacing.sm }]}
      >
        {DASHBOARD_RANGES.map((range) => {
          const isActive = range.key === value;
          return (
            <Pressable
              key={range.key}
              onPress={() => onChange(range.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: isActive ? colors.primary : colors.backgroundSecondary,
                  borderColor: isActive ? colors.primary : colors.border,
                  borderRadius: radius.full,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={{
                  color: isActive ? '#FFFFFF' : colors.textSecondary,
                  fontSize: typography.size.sm,
                  fontWeight: isActive ? '700' : '500',
                  fontFamily: typography.family.sans,
                }}
              >
                {range.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  chip: {
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});

DashboardRangeTabs.displayName = 'DashboardRangeTabs';
export default DashboardRangeTabs;
