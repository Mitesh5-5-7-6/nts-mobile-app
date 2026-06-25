import { NoDataState } from '@/components/ui/Feedback';
import { useAppTheme } from '@/theme';
import type {
  ExpenseCategoryItem,
  RevenueExpenseItem,
  TiffinTrendItem,
} from '@/types/api.types';
import { formatCompactCurrency, formatCurrency } from '@/utils/format';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Small inline legend used beneath the charts. */
const Legend = ({ items }: { items: { label: string; color: string }[] }) => {
  const { colors, spacing, typography } = useAppTheme();
  return (
    <View style={[styles.legend, { gap: spacing.lg, marginTop: spacing.sm }]}>
      {items.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs }}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

// ─── Tiffin trend (stacked morning/evening bars) ─────────────────────────────
export const TiffinTrendChart = React.memo(
  ({ data, width }: { data: TiffinTrendItem[]; width: number }) => {
    const { colors } = useAppTheme();

    const hasData = data.some((d) => (d.morning ?? 0) + (d.evening ?? 0) > 0);
    if (!hasData) return <NoDataState message="No tiffin entries for this period." />;

    const stackData = data.map((d) => ({
      label: d.date,
      stacks: [
        { value: Math.max(0, d.morning ?? 0), color: colors.primary },
        { value: Math.max(0, d.evening ?? 0), color: colors.secondary },
      ],
    }));

    const n = data.length || 1;
    const barWidth = clamp((width - 40) / n - 6, 8, 26);
    const spacing = clamp((width - 40) / n - barWidth, 6, 22);

    return (
      <View>
        <BarChart
          stackData={stackData}
          width={width - 20}
          height={170}
          barWidth={barWidth}
          spacing={spacing}
          initialSpacing={12}
          endSpacing={0}
          noOfSections={4}
          barBorderTopLeftRadius={3}
          barBorderTopRightRadius={3}
          rulesColor={colors.border}
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 9 }}
          isAnimated
          disableScroll
        />
        <Legend
          items={[
            { label: 'Morning', color: colors.primary },
            { label: 'Evening', color: colors.secondary },
          ]}
        />
      </View>
    );
  },
);

// ─── Revenue vs Expense (two lines) ──────────────────────────────────────────
export const RevenueExpenseChart = React.memo(
  ({ data, width }: { data: RevenueExpenseItem[]; width: number }) => {
    const { colors } = useAppTheme();

    const hasData = data.some((d) => (d.revenue ?? 0) + (d.expense ?? 0) > 0);
    if (!hasData) return <NoDataState message="No revenue or expense data yet." />;

    const revenue = data.map((d) => ({ value: Math.max(0, d.revenue ?? 0), label: d.date }));
    const expense = data.map((d) => ({ value: Math.max(0, d.expense ?? 0), label: d.date }));

    return (
      <View>
        <LineChart
          data={revenue}
          data2={expense}
          color1={colors.success}
          color2={colors.error}
          thickness={2}
          curved
          hideDataPoints={data.length > 10}
          dataPointsColor1={colors.success}
          dataPointsColor2={colors.error}
          width={width - 24}
          height={170}
          adjustToWidth
          initialSpacing={12}
          endSpacing={8}
          noOfSections={4}
          rulesColor={colors.border}
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 9 }}
          yAxisLabelWidth={44}
          formatYLabel={(label: string) => formatCompactCurrency(Number(label))}
          isAnimated
        />
        <Legend
          items={[
            { label: 'Revenue', color: colors.success },
            { label: 'Expense', color: colors.error },
          ]}
        />
      </View>
    );
  },
);

// ─── Expense categories (donut) ──────────────────────────────────────────────
const PIE_PALETTE_KEYS = [
  'primary',
  'secondary',
  'warning',
  'info',
  'success',
  'error',
  'primaryDark',
  'secondaryDark',
] as const;

export const ExpenseCategoryChart = React.memo(
  ({ data }: { data: ExpenseCategoryItem[] }) => {
    const { colors, spacing, typography } = useAppTheme();

    const total = data.reduce((sum, d) => sum + (d.amount ?? 0), 0);
    if (total <= 0) return <NoDataState message="No expenses recorded for this period." />;

    const palette = PIE_PALETTE_KEYS.map((key) => colors[key]);
    const slices = data.map((d, i) => ({ value: Math.max(0, d.amount ?? 0), color: palette[i % palette.length] }));

    return (
      <View style={styles.pieRow}>
        <PieChart
          data={slices}
          donut
          radius={80}
          innerRadius={52}
          innerCircleColor={colors.card}
          centerLabelComponent={() => (
            <View style={styles.pieCenter}>
              <Text style={{ color: colors.text, fontSize: typography.size.sm, fontWeight: '800' }}>
                {formatCompactCurrency(total)}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>Total</Text>
            </View>
          )}
        />
        <View style={[styles.pieLegend, { marginLeft: spacing.lg }]}>
          {data.slice(0, 6).map((d, i) => {
            const pct = total > 0 ? Math.round(((d.amount ?? 0) / total) * 100) : 0;
            return (
              <View key={`${d.category}-${i}`} style={[styles.legendRow, { marginBottom: spacing.xs }]}>
                <View style={[styles.legendDot, { backgroundColor: palette[i % palette.length] }]} />
                <Text
                  numberOfLines={1}
                  style={{ flex: 1, color: colors.textSecondary, fontSize: typography.size.xs }}
                >
                  {d.category}
                </Text>
                <Text style={{ color: colors.text, fontSize: typography.size.xs, fontWeight: '700', marginLeft: 6 }}>
                  {formatCurrency(d.amount)} · {pct}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  pieRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pieCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieLegend: {
    flex: 1,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

TiffinTrendChart.displayName = 'TiffinTrendChart';
RevenueExpenseChart.displayName = 'RevenueExpenseChart';
ExpenseCategoryChart.displayName = 'ExpenseCategoryChart';
