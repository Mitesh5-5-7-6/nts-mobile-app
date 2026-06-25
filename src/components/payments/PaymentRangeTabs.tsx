import { useAppTheme } from '@/theme';
import { toApiDate } from '@/utils/format';
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

export type PaymentRangeKey = 'this_month' | 'last_month' | 'last_7' | 'this_year';

export interface ResolvedRange {
  startDate: string;
  endDate: string;
}

const RANGES: { key: PaymentRangeKey; label: string }[] = [
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'last_7', label: 'Last 7 Days' },
  { key: 'this_year', label: 'This Year' },
];

/**
 * Resolve a range preset to API date strings.
 * Default ("this_month") spans month start -> today, matching the spec.
 */
export const resolvePaymentRange = (key: PaymentRangeKey, now: Date = new Date()): ResolvedRange => {
  switch (key) {
    case 'last_month': {
      const prev = subMonths(now, 1);
      return { startDate: toApiDate(startOfMonth(prev)), endDate: toApiDate(endOfMonth(prev)) };
    }
    case 'last_7':
      return { startDate: toApiDate(subDays(now, 6)), endDate: toApiDate(now) };
    case 'this_year':
      return { startDate: toApiDate(startOfYear(now)), endDate: toApiDate(endOfYear(now)) };
    case 'this_month':
    default:
      return { startDate: toApiDate(startOfMonth(now)), endDate: toApiDate(now) };
  }
};

interface PaymentRangeTabsProps {
  value: PaymentRangeKey;
  onChange: (key: PaymentRangeKey) => void;
}

export const PaymentRangeTabs = React.memo(({ value, onChange }: PaymentRangeTabsProps) => {
  const { colors, spacing, radius, typography } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, { paddingHorizontal: spacing.lg, gap: spacing.sm }]}
    >
      {RANGES.map(({ key, label }) => {
        const active = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primary : colors.backgroundSecondary,
                borderColor: active ? colors.primary : colors.border,
                borderRadius: radius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              },
            ]}
          >
            <Text
              style={{
                color: active ? '#FFFFFF' : colors.textSecondary,
                fontSize: typography.size.xs,
                fontWeight: active ? '700' : '600',
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  chip: {
    borderWidth: 1,
  },
});

PaymentRangeTabs.displayName = 'PaymentRangeTabs';
export default PaymentRangeTabs;
