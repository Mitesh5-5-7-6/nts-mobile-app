import { ExpenseCategoryChart } from '@/components/dashboard/charts';
import AppIcon, { type IconNameType } from '@/components/ui/AppIcon';
import { CardContainer } from '@/components/ui/Card';
import { NoDataState, Skeleton } from '@/components/ui/Feedback';
import { categoryLabel, paymentMethodLabel } from '@/constants/finance';
import { useAppTheme } from '@/theme';
import type { ExpenseStats } from '@/types/api.types';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ExpenseStatsHeaderProps {
  stats?: ExpenseStats;
  loading?: boolean;
  isError?: boolean;
}

export const ExpenseStatsHeader = React.memo(({ stats, loading, isError }: ExpenseStatsHeaderProps) => {
  const { colors, spacing, radius, typography } = useAppTheme();

  const categoryData = useMemo(
    () => (stats?.category_breakdown ?? []).map((c) => ({ category: categoryLabel(c.category), amount: c.amount })),
    [stats?.category_breakdown],
  );

  if (loading && !stats) {
    return (
      <View style={{ gap: spacing.sm }}>
        <Skeleton height={84} borderRadius={radius.lg} />
        <Skeleton height={180} borderRadius={radius.lg} />
      </View>
    );
  }

  if (isError && !stats) {
    return (
      <CardContainer>
        <NoDataState message="Couldn't load expense analytics." />
      </CardContainer>
    );
  }

  const prev = stats?.prev_total_expense ?? 0;
  const total = stats?.total_expense ?? 0;
  const delta = prev > 0 ? ((total - prev) / prev) * 100 : 0;

  return (
    <View>
      {/* KPI tiles */}
      <View style={[styles.tileRow, { gap: spacing.sm }]}>
        <Tile
          icon="dollar"
          label="Total"
          value={formatCurrency(total)}
          footer={prev > 0 ? `${formatPercent(delta)} vs prev` : undefined}
          footerTone={delta > 0 ? colors.error : colors.success}
        />
        <Tile icon="calendar" label="Daily Avg" value={formatCurrency(stats?.daily_average ?? 0)} />
        <Tile icon="expense" label="Entries" value={formatNumber(stats?.total_transactions ?? 0)} />
      </View>

      {/* Category donut */}
      <CardContainer style={{ marginTop: spacing.md }}>
        <Text style={[styles.cardTitle, { color: colors.text, fontSize: typography.size.base }]}>By Category</Text>
        <View style={{ marginTop: spacing.md }}>
          <ExpenseCategoryChart data={categoryData} />
        </View>
      </CardContainer>

      {/* Payment method breakdown */}
      {stats?.payment_method_breakdown?.length ? (
        <CardContainer>
          <Text style={[styles.cardTitle, { color: colors.text, fontSize: typography.size.base, marginBottom: spacing.sm }]}>
            By Payment Method
          </Text>
          {stats.payment_method_breakdown.map((m) => (
            <View key={m.method} style={[styles.methodRow, { marginTop: spacing.sm }]}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, width: 110 }}>
                {paymentMethodLabel(m.method)}
              </Text>
              <View style={[styles.barTrack, { backgroundColor: colors.backgroundSecondary, borderRadius: radius.full }]}>
                <View
                  style={{
                    width: `${Math.min(100, Math.max(2, m.percentage))}%`,
                    height: '100%',
                    backgroundColor: colors.primary,
                    borderRadius: radius.full,
                  }}
                />
              </View>
              <Text style={{ color: colors.text, fontSize: typography.size.xs, fontWeight: '700', width: 70, textAlign: 'right' }}>
                {formatCurrency(m.amount)}
              </Text>
            </View>
          ))}
        </CardContainer>
      ) : null}
    </View>
  );
});

function Tile({
  icon,
  label,
  value,
  footer,
  footerTone,
}: {
  icon: IconNameType;
  label: string;
  value: string;
  footer?: string;
  footerTone?: string;
}) {
  const { colors, spacing, radius, typography } = useAppTheme();
  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.sm },
      ]}
    >
      <View style={[styles.tileIcon, { backgroundColor: colors.errorLight, borderRadius: radius.sm }]}>
        <AppIcon name={icon} size={14} color={colors.error} />
      </View>
      <Text numberOfLines={1} style={{ color: colors.text, fontSize: typography.size.base, fontWeight: '800', marginTop: spacing.xs }}>
        {value}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: typography.size.xs }}>{label}</Text>
      {footer ? (
        <Text style={{ color: footerTone ?? colors.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 }}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tileRow: {
    flexDirection: 'row',
  },
  tile: {
    flex: 1,
    borderWidth: 1.5,
  },
  tileIcon: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontWeight: '700',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barTrack: {
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  methodBar: {
    height: '100%',
  },
});

ExpenseStatsHeader.displayName = 'ExpenseStatsHeader';
export default ExpenseStatsHeader;
