import { CustomerLedgerSheet } from '@/components/payments/CustomerLedgerSheet';
import { PaymentCustomerCard } from '@/components/payments/PaymentCustomerCard';
import {
  PaymentRangeTabs,
  resolvePaymentRange,
  type PaymentRangeKey,
} from '@/components/payments/PaymentRangeTabs';
import { PaymentSummaryBar } from '@/components/payments/PaymentSummaryBar';
import { RecordPaymentSheet } from '@/components/payments/RecordPaymentSheet';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback';
import { SearchInput } from '@/components/ui/Input';
import { ContentWrapper, PageContainer, PageHeader, SafeAreaContainer } from '@/components/ui/Layout';
import type { EntrySession } from '@/components/payments/PaymentEntryRow';
import { useGroupedPayments, useUpdateEntryStatus } from '@/hooks/api/usePayments';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { analyticsService } from '@/services/analytics/analytics';
import { ScreenNames } from '@/services/analytics/events';
import { useAppTheme } from '@/theme';
import type { GroupedEntryStatus, GroupedPaymentCustomer } from '@/types/api.types';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';

type StatusFilter = 'ALL' | GroupedEntryStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'PAID', label: 'Paid' },
];

type RecordTarget = { customerId: string; customerName: string } | null;

export default function PaymentsScreen() {
  const { colors, spacing } = useAppTheme();

  const [rangeKey, setRangeKey] = useState<PaymentRangeKey>('this_month');
  const range = useMemo(() => resolvePaymentRange(rangeKey), [rangeKey]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim(), 350);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ledgerId, setLedgerId] = useState<string | null>(null);
  const [recordTarget, setRecordTarget] = useState<RecordTarget>(null);
  const [refreshing, setRefreshing] = useState(false);

  const list = useGroupedPayments({
    startDate: range.startDate,
    endDate: range.endDate,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: search || undefined,
  });
  const updateStatus = useUpdateEntryStatus();

  const customers = useMemo(
    () => list.data?.pages.flatMap((page) => page.data?.customers ?? []) ?? [],
    [list.data],
  );
  const summary = list.data?.pages[0]?.data?.summary;

  useEffect(() => {
    analyticsService.trackScreen(ScreenNames.PAYMENTS);
  }, []);

  const onToggleExpand = useCallback(
    (customerId: string) => setExpandedId((prev) => (prev === customerId ? null : customerId)),
    [],
  );

  const onToggleSession = useCallback(
    (entryId: string, session: EntrySession, nextStatus: 'PAID' | 'PENDING') => {
      updateStatus.mutate({
        entryId,
        data: session === 'morning' ? { morningStatus: nextStatus } : { eveningStatus: nextStatus },
      });
    },
    [updateStatus],
  );

  const onRecordCollection = useCallback((customer: GroupedPaymentCustomer) => {
    setRecordTarget({ customerId: customer.customerId, customerName: customer.customerName });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await list.refetch();
    setRefreshing(false);
  }, [list]);

  const onEndReached = useCallback(() => {
    if (list.hasNextPage && !list.isFetchingNextPage) list.fetchNextPage();
  }, [list]);

  const renderEmpty = () => {
    if (list.isLoading) return <PaymentsSkeleton />;
    if (list.isError) return <ErrorState message="Couldn't load payments." onRetry={list.refetch} />;
    return (
      <EmptyState
        title={search ? 'No matches' : 'Nothing to collect'}
        description={
          search
            ? 'No customers match your search.'
            : 'No tiffin entries in this period. Add daily entries to start tracking payments.'
        }
      />
    );
  };

  return (
    <PageContainer>
      <SafeAreaContainer edges={['top']}>
        <ContentWrapper>
          <PageHeader title="Payments" subtitle="Track collections and outstanding dues" />
          <SearchInput
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder="Search by name or phone"
          />
        </ContentWrapper>

        <PaymentRangeTabs value={rangeKey} onChange={setRangeKey} />

        <View style={{ marginTop: spacing.sm }}>
          <ContentWrapper>
            <ChipGroup<StatusFilter>
              options={STATUS_OPTIONS}
              selected={statusFilter}
              onChange={setStatusFilter}
            />
          </ContentWrapper>
        </View>

        <PaymentSummaryBar summary={summary} loading={list.isLoading} />

        <View style={styles.listWrap}>
          <FlashList
            data={customers}
            keyExtractor={(item) => item.customerId}
            renderItem={({ item }) => (
              <PaymentCustomerCard
                customer={item}
                expanded={expandedId === item.customerId}
                onToggleExpand={onToggleExpand}
                onToggleSession={onToggleSession}
                onViewLedger={setLedgerId}
                onRecordCollection={onRecordCollection}
                busy={updateStatus.isPending}
              />
            )}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.giant * 2.5 }}
            ListEmptyComponent={renderEmpty()}
            ListFooterComponent={
              list.isFetchingNextPage ? (
                <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.lg }} />
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          />
        </View>
      </SafeAreaContainer>

      {/* Customer ledger */}
      <CustomerLedgerSheet
        visible={ledgerId !== null}
        customerId={ledgerId}
        onClose={() => setLedgerId(null)}
        onRecordCollection={(customerId, customerName) => {
          setLedgerId(null);
          setRecordTarget({ customerId, customerName });
        }}
      />

      {/* Record collection. Keyed so it remounts (and regenerates the bill) per open. */}
      {recordTarget && (
        <RecordPaymentSheet
          key={`${recordTarget.customerId}-${range.startDate}-${range.endDate}`}
          visible
          onClose={() => setRecordTarget(null)}
          customerId={recordTarget.customerId}
          customerName={recordTarget.customerName}
          range={range}
        />
      )}
    </PageContainer>
  );
}

function PaymentsSkeleton() {
  const { spacing, radius } = useAppTheme();
  return (
    <View style={{ paddingTop: spacing.sm }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height={76} borderRadius={radius.lg} style={{ marginBottom: 10 }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    flex: 1,
  },
});
