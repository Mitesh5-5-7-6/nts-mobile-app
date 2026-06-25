import { Skeleton } from '@/components/ui/Feedback';
import { useAppTheme } from '@/theme';
import type { GroupedPaymentsSummary } from '@/types/api.types';
import { formatCurrency } from '@/utils/format';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PaymentSummaryBarProps {
  summary?: GroupedPaymentsSummary;
  loading?: boolean;
}

export const PaymentSummaryBar = React.memo(({ summary, loading }: PaymentSummaryBarProps) => {
  const { colors, spacing, radius } = useAppTheme();

  if (loading && !summary) {
    return (
      <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
        <Skeleton height={74} borderRadius={radius.lg} />
      </View>
    );
  }

  const collected = summary?.totalPaid ?? 0;
  const pending = summary?.totalPending ?? 0;
  const total = summary?.totalAmount ?? 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.lg,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.sm,
          padding: spacing.md,
        },
      ]}
    >
      <Cell label="Collected" value={formatCurrency(collected)} tone={colors.success} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Cell label="Pending" value={formatCurrency(pending)} tone={colors.warning} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Cell label="Total" value={formatCurrency(total)} tone={colors.text} />
    </View>
  );
});

function Cell({ label, value, tone }: { label: string; value: string; tone: string }) {
  const { colors, typography } = useAppTheme();
  return (
    <View style={styles.cell}>
      <Text style={{ color: colors.textMuted, fontSize: typography.size.xs }}>{label}</Text>
      <Text
        numberOfLines={1}
        style={{ color: tone, fontSize: typography.size.base, fontWeight: '800', marginTop: 2 }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
  },
});

PaymentSummaryBar.displayName = 'PaymentSummaryBar';
export default PaymentSummaryBar;
