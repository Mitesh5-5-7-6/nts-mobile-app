import { ExpenseFilters } from '@/components/expenses/ExpenseFilters';
import { ExpenseFormSheet } from '@/components/expenses/ExpenseFormSheet';
import { ExpenseListItem } from '@/components/expenses/ExpenseListItem';
import { ExpenseStatsHeader } from '@/components/expenses/ExpenseStatsHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback';
import { PageContainer, SafeAreaContainer, ScreenHeader } from '@/components/ui/Layout';
import { ActionSheet, ConfirmationModal } from '@/components/ui/Modal';
import { useDeleteExpense, useExpenseList, useExpenseStats } from '@/hooks/api/useExpenses';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { analyticsService } from '@/services/analytics/analytics';
import { ScreenNames } from '@/services/analytics/events';
import { useAppTheme } from '@/theme';
import type { Expense, ExpenseCategory } from '@/types/api.types';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';

type FormState = { mode: 'create' } | { mode: 'edit'; expense: Expense } | null;

export default function ExpensesScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();

  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim(), 350);
  const [category, setCategory] = useState<ExpenseCategory | null>(null);

  const [formState, setFormState] = useState<FormState>(null);
  const [actionTarget, setActionTarget] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const list = useExpenseList({ search: search || undefined, category: category ?? undefined });
  const stats = useExpenseStats();
  const deleteExpense = useDeleteExpense();

  const expenses = useMemo(
    () => list.data?.pages.flatMap((page) => page.data ?? []) ?? [],
    [list.data],
  );

  useEffect(() => {
    analyticsService.trackScreen(ScreenNames.EXPENSES);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([list.refetch(), stats.refetch()]);
    setRefreshing(false);
  }, [list, stats]);

  const onEndReached = useCallback(() => {
    if (list.hasNextPage && !list.isFetchingNextPage) list.fetchNextPage();
  }, [list]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteExpense.mutate(deleteTarget._id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteExpense]);

  const renderEmpty = () => {
    if (list.isLoading) return <ExpenseListSkeleton />;
    if (list.isError) return <ErrorState message="Couldn't load expenses." onRetry={list.refetch} />;
    return (
      <EmptyState
        title={search || category ? 'No matches' : 'No expenses yet'}
        description={
          search || category
            ? 'No expenses match your filters.'
            : 'Log your first expense to start tracking profit.'
        }
        actionTitle={search || category ? undefined : 'Log Expense'}
        onActionPress={search || category ? undefined : () => setFormState({ mode: 'create' })}
      />
    );
  };

  return (
    <PageContainer>
      <SafeAreaContainer edges={['top', 'bottom']}>
        <ScreenHeader
          title="Expenses"
          onBackPress={() => router.back()}
          rightAction={
            <Button title="Add" iconLeft="plus" size="sm" onPress={() => setFormState({ mode: 'create' })} />
          }
        />

        <ExpenseFilters
          search={searchInput}
          onSearch={setSearchInput}
          category={category}
          onCategory={setCategory}
        />

        <View style={styles.listWrap}>
          <FlashList
            data={expenses}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <ExpenseListItem expense={item} onPress={setActionTarget} />}
            ListHeaderComponent={
              <View style={{ paddingTop: spacing.sm, paddingBottom: spacing.md }}>
                <ExpenseStatsHeader stats={stats.data} loading={stats.isLoading} isError={stats.isError} />
              </View>
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.giant * 2 }}
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

      {/* Tap an expense -> edit or delete */}
      <ActionSheet
        visible={actionTarget !== null}
        onClose={() => setActionTarget(null)}
        title={actionTarget?.title}
        items={[
          {
            label: 'Edit Expense',
            onPress: () => {
              if (actionTarget) setFormState({ mode: 'edit', expense: actionTarget });
            },
          },
          {
            label: 'Delete Expense',
            isDestructive: true,
            onPress: () => setDeleteTarget(actionTarget),
          },
        ]}
      />

      {/* Create / edit form. Keyed so it remounts (re-seeds) on each open. */}
      <ExpenseFormSheet
        key={formState ? (formState.mode === 'edit' ? `edit-${formState.expense._id}` : 'create') : 'closed'}
        visible={formState !== null}
        expense={formState?.mode === 'edit' ? formState.expense : undefined}
        onClose={() => setFormState(null)}
      />

      {/* Delete confirmation */}
      <ConfirmationModal
        visible={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete expense?"
        description={`This removes "${deleteTarget?.title ?? 'this expense'}" from your records.`}
        confirmTitle="Delete"
        isDestructive
      />
    </PageContainer>
  );
}

function ExpenseListSkeleton() {
  const { spacing, radius } = useAppTheme();
  return (
    <View style={{ paddingTop: spacing.sm }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height={72} borderRadius={radius.lg} style={{ marginBottom: 10 }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    flex: 1,
  },
});
