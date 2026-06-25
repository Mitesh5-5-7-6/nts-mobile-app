import {
  DashboardRangeTabs,
  rangeToParams,
  type DashboardRangeKey,
} from '@/components/dashboard/DashboardRangeTabs';
import { DashboardStatTile } from '@/components/dashboard/DashboardStatTile';
import { SectionCard } from '@/components/dashboard/SectionCard';
import {
  ExpenseCategoryChart,
  RevenueExpenseChart,
  TiffinTrendChart,
} from '@/components/dashboard/charts';
import {
  PendingPaymentRow,
  RecentExpenseRow,
  RecentTiffinRow,
  TopCustomerRow,
} from '@/components/dashboard/lists';
import AppIcon from '@/components/ui/AppIcon';
import { ContentWrapper, PageContainer, PageHeader, SafeAreaContainer } from '@/components/ui/Layout';
import { CardContainer } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Feedback';
import { QUERY_KEYS } from '@/constants/queryKeys';
import {
  useDashboardStats,
  useExpenseCategories,
  useMonthSummary,
  usePendingPayments,
  useRecentExpenses,
  useRecentTiffins,
  useRevenueExpense,
  useTiffinTrend,
  useTopCustomers,
} from '@/hooks/api/useDashboard';
import { analyticsService } from '@/services/analytics/analytics';
import { AnalyticsEventNames, ScreenNames } from '@/services/analytics/events';
import { useAppTheme } from '@/theme';
import { formatCurrency, formatNumber, formatPercent, isPositiveTrend } from '@/utils/format';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

export default function DashboardScreen() {
  const { colors, spacing, radius } = useAppTheme();
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();

  const [range, setRange] = useState<DashboardRangeKey>('today');
  const params = useMemo(() => rangeToParams(range), [range]);

  // Content width inside ContentWrapper (lg gutters) and a Card (md padding).
  const chartWidth = Math.max(0, width - spacing.lg * 2 - spacing.md * 2);

  const stats = useDashboardStats(params);
  const month = useMonthSummary();
  const tiffinTrend = useTiffinTrend(params);
  const revenueExpense = useRevenueExpense(params);
  const expenseCategories = useExpenseCategories(params);
  const recentTiffins = useRecentTiffins({ ...params, limit: 5 });
  const recentExpenses = useRecentExpenses({ ...params, limit: 5 });
  const topCustomers = useTopCustomers(params);
  const pendingPayments = usePendingPayments();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    analyticsService.trackScreen(ScreenNames.DASHBOARD);
    analyticsService.trackEvent(AnalyticsEventNames.DASHBOARD_OPENED);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    analyticsService.trackEvent(AnalyticsEventNames.DASHBOARD_REFRESHED);
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
    setRefreshing(false);
  }, [queryClient]);

  const s = stats.data;
  const m = month.data;

  return (
    <PageContainer>
      <SafeAreaContainer edges={['top']}>
        <ContentWrapper>
          <PageHeader
            title="Dashboard"
            subtitle={format(new Date(), 'EEEE, dd MMM yyyy')}
            rightAction={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                style={({ pressed }) => [
                  styles.headerIcon,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, borderRadius: radius.full },
                  pressed && styles.pressed,
                ]}
              >
                <AppIcon name="bell" size={20} color={colors.text} />
              </Pressable>
            }
          />
        </ContentWrapper>

        <DashboardRangeTabs value={range} onChange={setRange} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.giant * 2.5 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <ContentWrapper>
            {/* ── Overview stat tiles ───────────────────────────────── */}
            {stats.isLoading && !s ? (
              <OverviewSkeleton spacing={spacing} />
            ) : stats.isError && !s ? (
              <SectionCard title="Today's Overview" isError onRetry={stats.refetch} />
            ) : (
              <View style={{ marginBottom: spacing.xs }}>
                <DashboardStatTile
                  label="Tiffins"
                  value={formatNumber(s?.todayTiffin.total ?? 0)}
                  subtitle={`Morning ${s?.todayTiffin.morning ?? 0} · Evening ${s?.todayTiffin.evening ?? 0}`}
                  delta={s?.todayTiffin.vsYesterday}
                  icon="calendar"
                  color={colors.primary}
                  bgColor={colors.primaryLight}
                  style={{ marginBottom: spacing.md }}
                />
                <View style={[styles.gridRow, { gap: spacing.md, marginBottom: spacing.md }]}>
                  <DashboardStatTile
                    label="Revenue"
                    value={formatCurrency(s?.todayRevenue.amount ?? 0)}
                    delta={s?.todayRevenue.vsYesterday}
                    icon="dollar"
                    color={colors.success}
                    bgColor={colors.successLight}
                    style={styles.flex1}
                  />
                  <DashboardStatTile
                    label="Expense"
                    value={formatCurrency(s?.todayExpense.amount ?? 0)}
                    delta={s?.todayExpense.vsYesterday}
                    icon="expense"
                    color={colors.error}
                    bgColor={colors.errorLight}
                    style={styles.flex1}
                  />
                </View>
                <View style={[styles.gridRow, { gap: spacing.md }]}>
                  <DashboardStatTile
                    label="Profit"
                    value={formatCurrency(s?.todayProfit.amount ?? 0)}
                    delta={s?.todayProfit.vsYesterday}
                    icon="dashboard"
                    color={colors.secondary}
                    bgColor={colors.secondaryLight}
                    style={styles.flex1}
                  />
                  <DashboardStatTile
                    label="Pending"
                    value={formatCurrency(s?.pendingPayments.amount ?? 0)}
                    subtitle={`From ${s?.pendingPayments.customerCount ?? 0} customers`}
                    icon="payments"
                    color={colors.warning}
                    bgColor={colors.warningLight}
                    style={styles.flex1}
                  />
                </View>
              </View>
            )}

            {/* ── This month at a glance ────────────────────────────── */}
            <SectionCard
              title="This Month at a Glance"
              subtitle="Current month vs last month"
              isLoading={month.isLoading && !m}
              isError={month.isError && !m}
              onRetry={month.refetch}
              loadingHeight={90}
            >
              <View style={styles.glanceGrid}>
                <GlanceMetric label="Total Tiffins" value={formatNumber(m?.tiffins.total ?? 0)} delta={m?.tiffins.vsLastMonth} />
                <GlanceMetric label="Avg / Day" value={formatNumber(Math.round(m?.tiffins.avgPerDay ?? 0))} />
                <GlanceMetric label="Revenue" value={formatCurrency(m?.revenue.amount ?? 0)} delta={m?.revenue.vsLastMonth} />
                <GlanceMetric label="Expenses" value={formatCurrency(m?.expense.amount ?? 0)} delta={m?.expense.vsLastMonth} invertDelta />
                <GlanceMetric label="Net Profit" value={formatCurrency(m?.profit.amount ?? 0)} delta={m?.profit.vsLastMonth} />
                <GlanceMetric label="Active Customers" value={formatNumber(m?.activeCustomers ?? 0)} />
              </View>
            </SectionCard>

            {/* ── Charts ────────────────────────────────────────────── */}
            <SectionCard
              title="Tiffin Count"
              subtitle="Morning vs Evening"
              isLoading={tiffinTrend.isLoading && !tiffinTrend.data}
              isError={tiffinTrend.isError && !tiffinTrend.data}
              isEmpty={!tiffinTrend.data?.length}
              onRetry={tiffinTrend.refetch}
            >
              {tiffinTrend.data ? <TiffinTrendChart data={tiffinTrend.data} width={chartWidth} /> : null}
            </SectionCard>

            <SectionCard
              title="Revenue vs Expense"
              subtitle="Daily trend"
              isLoading={revenueExpense.isLoading && !revenueExpense.data}
              isError={revenueExpense.isError && !revenueExpense.data}
              isEmpty={!revenueExpense.data?.length}
              onRetry={revenueExpense.refetch}
            >
              {revenueExpense.data ? <RevenueExpenseChart data={revenueExpense.data} width={chartWidth} /> : null}
            </SectionCard>

            <SectionCard
              title="Expense by Category"
              subtitle="Breakdown for this period"
              isLoading={expenseCategories.isLoading && !expenseCategories.data}
              isError={expenseCategories.isError && !expenseCategories.data}
              isEmpty={!expenseCategories.data?.length}
              onRetry={expenseCategories.refetch}
            >
              {expenseCategories.data ? <ExpenseCategoryChart data={expenseCategories.data} /> : null}
            </SectionCard>

            {/* ── Recent + top lists ────────────────────────────────── */}
            <SectionCard
              title="Recent Tiffin Entries"
              isLoading={recentTiffins.isLoading && !recentTiffins.data}
              isError={recentTiffins.isError && !recentTiffins.data}
              isEmpty={!recentTiffins.data?.length}
              emptyText="No recent tiffin entries."
              onRetry={recentTiffins.refetch}
              loadingHeight={180}
            >
              {recentTiffins.data?.map((item, i) => (
                <RecentTiffinRow key={item.id} item={item} showDivider={i < recentTiffins.data!.length - 1} />
              ))}
            </SectionCard>

            <SectionCard
              title="Recent Expenses"
              isLoading={recentExpenses.isLoading && !recentExpenses.data}
              isError={recentExpenses.isError && !recentExpenses.data}
              isEmpty={!recentExpenses.data?.length}
              emptyText="No recent expenses."
              onRetry={recentExpenses.refetch}
              loadingHeight={180}
            >
              {recentExpenses.data?.map((item, i) => (
                <RecentExpenseRow key={item.id} item={item} showDivider={i < recentExpenses.data!.length - 1} />
              ))}
            </SectionCard>

            <SectionCard
              title="Top Customers"
              subtitle="By tiffin amount this period"
              isLoading={topCustomers.isLoading && !topCustomers.data}
              isError={topCustomers.isError && !topCustomers.data}
              isEmpty={!topCustomers.data?.length}
              emptyText="No customer activity yet."
              onRetry={topCustomers.refetch}
              loadingHeight={180}
            >
              {topCustomers.data?.map((item, i) => (
                <TopCustomerRow key={`${item.rank}-${item.name}`} item={item} showDivider={i < topCustomers.data!.length - 1} />
              ))}
            </SectionCard>

            <SectionCard
              title="Pending Payments"
              subtitle="Customers with outstanding balance"
              isLoading={pendingPayments.isLoading && !pendingPayments.data}
              isError={pendingPayments.isError && !pendingPayments.data}
              isEmpty={!pendingPayments.data?.length}
              emptyText="All caught up — no pending payments."
              onRetry={pendingPayments.refetch}
              loadingHeight={180}
            >
              {pendingPayments.data?.map((item, i) => (
                <PendingPaymentRow key={item.id} item={item} showDivider={i < pendingPayments.data!.length - 1} />
              ))}
            </SectionCard>
          </ContentWrapper>
        </ScrollView>
      </SafeAreaContainer>
    </PageContainer>
  );
}

/** A single metric cell inside the "Month at a Glance" grid. */
function GlanceMetric({
  label,
  value,
  delta,
  invertDelta,
}: {
  label: string;
  value: string;
  delta?: number;
  invertDelta?: boolean;
}) {
  const { colors, spacing, typography } = useAppTheme();
  // For expenses a lower number is "good", so the up/down semantics invert.
  const positive = invertDelta ? !isPositiveTrend(delta) : isPositiveTrend(delta);
  return (
    <View style={styles.glanceCell}>
      <Text style={{ color: colors.textMuted, fontSize: typography.size.xs }}>{label}</Text>
      <Text
        numberOfLines={1}
        style={{ color: colors.text, fontSize: typography.size.lg, fontWeight: '800', marginTop: spacing.xxs, fontFamily: typography.family.rounded }}
      >
        {value}
      </Text>
      {delta !== undefined ? (
        <Text style={{ color: positive ? colors.success : colors.error, fontSize: 11, fontWeight: '600', marginTop: 2 }}>
          {formatPercent(delta)} vs last
        </Text>
      ) : null}
    </View>
  );
}

function OverviewSkeleton({ spacing }: { spacing: ReturnType<typeof useAppTheme>['spacing'] }) {
  return (
    <View style={{ marginBottom: spacing.xs }}>
      <CardContainer style={{ marginBottom: spacing.md }}>
        <Skeleton height={64} borderRadius={8} />
      </CardContainer>
      <View style={[styles.gridRow, { gap: spacing.md }]}>
        <View style={styles.flex1}>
          <CardContainer>
            <Skeleton height={64} borderRadius={8} />
          </CardContainer>
        </View>
        <View style={styles.flex1}>
          <CardContainer>
            <Skeleton height={64} borderRadius={8} />
          </CardContainer>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    width: 40,
    height: 40,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  flex1: {
    flex: 1,
  },
  glanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  glanceCell: {
    width: '33.33%',
    paddingVertical: 8,
    paddingRight: 8,
  },
});
