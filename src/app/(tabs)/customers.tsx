import { CustomerDetailSheet } from '@/components/customers/CustomerDetailSheet';
import { CustomerFormSheet } from '@/components/customers/CustomerFormSheet';
import { CustomerListItem } from '@/components/customers/CustomerListItem';
import { Button } from '@/components/ui/Button';
import { CardContainer } from '@/components/ui/Card';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback';
import { SearchInput } from '@/components/ui/Input';
import { ContentWrapper, PageContainer, PageHeader, SafeAreaContainer } from '@/components/ui/Layout';
import { ConfirmationModal } from '@/components/ui/Modal';
import {
  useCustomerList,
  useCustomerStats,
  useDeleteCustomer,
} from '@/hooks/api/useCustomers';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { analyticsService } from '@/services/analytics/analytics';
import { AnalyticsEventNames, ScreenNames } from '@/services/analytics/events';
import { useAppTheme } from '@/theme';
import type { Customer } from '@/types/api.types';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';

type FormState = { mode: 'create' } | { mode: 'edit'; customer: Customer } | null;

export default function CustomersScreen() {
  const { colors, spacing } = useAppTheme();

  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim(), 350);

  const list = useCustomerList({ search });
  const stats = useCustomerStats();
  const deleteCustomer = useDeleteCustomer();

  const [detailId, setDetailId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const customers = useMemo(
    () => list.data?.pages.flatMap((page) => page.data ?? []) ?? [],
    [list.data],
  );

  useEffect(() => {
    analyticsService.trackScreen(ScreenNames.CUSTOMERS);
  }, []);

  const openDetail = useCallback((customer: Customer) => {
    setDetailId(customer._id);
    analyticsService.trackEvent(AnalyticsEventNames.CUSTOMER_VIEWED, { customer_id: customer._id });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([list.refetch(), stats.refetch()]);
    setRefreshing(false);
  }, [list, stats]);

  const onEndReached = useCallback(() => {
    if (list.hasNextPage && !list.isFetchingNextPage) {
      list.fetchNextPage();
    }
  }, [list]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    deleteCustomer.mutate(target._id, {
      onSuccess: () =>
        analyticsService.trackEvent(AnalyticsEventNames.CUSTOMER_DELETED, { customer_id: target._id }),
    });
    setDeleteTarget(null);
  }, [deleteTarget, deleteCustomer]);

  const statsSubtitle = stats.data
    ? `${stats.data.active} active · ${stats.data.total} total`
    : 'Manage your customers';

  const renderEmpty = () => {
    if (list.isLoading) return <CustomerListSkeleton />;
    if (list.isError) {
      return <ErrorState message="Couldn't load customers." onRetry={list.refetch} />;
    }
    return (
      <EmptyState
        title={search ? 'No matches' : 'No customers yet'}
        description={search ? 'No customers match your search.' : 'Add your first customer to get started.'}
        actionTitle={search ? undefined : 'Add Customer'}
        onActionPress={search ? undefined : () => setFormState({ mode: 'create' })}
      />
    );
  };

  return (
    <PageContainer>
      <SafeAreaContainer edges={['top']}>
        <ContentWrapper>
          <PageHeader
            title="Customers"
            subtitle={statsSubtitle}
            rightAction={
              <Button title="Add" iconLeft="plus" size="sm" onPress={() => setFormState({ mode: 'create' })} />
            }
          />
          <SearchInput
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder="Search by name or phone"
          />
        </ContentWrapper>

        <View style={styles.listWrap}>
          <FlashList
            data={customers}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <CustomerListItem customer={item} onPress={openDetail} />}
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

      {/* Detail sheet */}
      <CustomerDetailSheet
        visible={detailId !== null}
        customerId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={(customer) => {
          setDetailId(null);
          setFormState({ mode: 'edit', customer });
        }}
        onDelete={(customer) => {
          setDetailId(null);
          setDeleteTarget(customer);
        }}
      />

      {/* Create / edit form. Keyed so it remounts (and re-seeds) on each open. */}
      <CustomerFormSheet
        key={formState ? (formState.mode === 'edit' ? `edit-${formState.customer._id}` : 'create') : 'closed'}
        visible={formState !== null}
        customer={formState?.mode === 'edit' ? formState.customer : undefined}
        onClose={() => setFormState(null)}
      />

      {/* Delete confirmation */}
      <ConfirmationModal
        visible={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete customer?"
        description={`This deactivates ${deleteTarget?.full_name ?? 'this customer'}. Their history is preserved.`}
        confirmTitle="Delete"
        isDestructive
      />
    </PageContainer>
  );
}

function CustomerListSkeleton() {
  const { spacing } = useAppTheme();
  return (
    <View style={{ paddingTop: spacing.sm }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <CardContainer key={i} style={{ marginBottom: 10 }}>
          <View style={styles.skeletonRow}>
            <Skeleton width={44} height={44} borderRadius={22} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Skeleton width="55%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
              <Skeleton width="80%" height={11} borderRadius={4} style={{ marginBottom: 6 }} />
              <Skeleton width="40%" height={11} borderRadius={4} />
            </View>
          </View>
        </CardContainer>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    flex: 1,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
