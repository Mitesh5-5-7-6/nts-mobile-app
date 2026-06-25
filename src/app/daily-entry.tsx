import { DateNavigator } from '@/components/daily-entry/DateNavigator';
import { EntryCard, type EntryRowStatus } from '@/components/daily-entry/EntryCard';
import { EntryFilters, type EntryFilter } from '@/components/daily-entry/EntryFilters';
import { EntrySummaryBar } from '@/components/daily-entry/EntrySummaryBar';
import { Button } from '@/components/ui/Button';
import { CardContainer } from '@/components/ui/Card';
import { EmptyState, ErrorState, OfflineState, Skeleton } from '@/components/ui/Feedback';
import { PageContainer, SafeAreaContainer, ScreenHeader } from '@/components/ui/Layout';
import { ConfirmationModal } from '@/components/ui/Modal';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useBulkSaveTiffinEntries, useTiffinPreview } from '@/hooks/api/useTiffinEntries';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSyncQueue } from '@/hooks/useSyncQueue';
import { analyticsService } from '@/services/analytics/analytics';
import { AnalyticsEventNames, ScreenNames } from '@/services/analytics/events';
import { DailyEntryService } from '@/services/api/daily-entry.service';
import { useAppTheme } from '@/theme';
import type { BulkEntryItem, BulkEntryPayload, TiffinEntryPreview } from '@/types/api.types';
import { toApiDate } from '@/utils/format';
import { useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { addDays, subDays } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RowEdit {
  morning_qty?: number;
  evening_qty?: number;
  morning_price?: number;
  evening_price?: number;
  paid?: boolean;
}

const effectiveOf = (row: TiffinEntryPreview, edit?: RowEdit) => ({
  morning_qty: edit?.morning_qty ?? row.morning_qty,
  evening_qty: edit?.evening_qty ?? row.evening_qty,
  morning_price: edit?.morning_price ?? row.morning_price,
  evening_price: edit?.evening_price ?? row.evening_price,
  paid: edit?.paid ?? (row.morning_paid && row.evening_paid),
});

export default function DailyEntryScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(() => new Date());
  const [edits, setEdits] = useState<Record<string, RowEdit>>({});
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [queuedIds, setQueuedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<EntryFilter>('all');
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const [copyConfirm, setCopyConfirm] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);

  const dateStr = useMemo(() => toApiDate(date), [date]);
  const preview = useTiffinPreview(dateStr);
  const bulkSave = useBulkSaveTiffinEntries();

  const network = useNetworkStatus();
  const sync = useSyncQueue();

  const rows = useMemo(() => preview.data ?? [], [preview.data]);

  const previewMap = useMemo(() => {
    const map: Record<string, TiffinEntryPreview> = {};
    for (const r of rows) map[r.customer_id] = r;
    return map;
  }, [rows]);

  useEffect(() => {
    analyticsService.trackScreen(ScreenNames.DAILY_ENTRY);
  }, []);

  const dirtyCount = Object.keys(edits).length;

  const getStatus = useCallback(
    (row: TiffinEntryPreview): EntryRowStatus => {
      const id = row.customer_id;
      if (savingIds.includes(id)) return 'syncing';
      if (queuedIds.includes(id)) return 'queued';
      if (edits[id]) return 'unsaved';
      if (row.has_existing_entry) return 'saved';
      return 'new';
    },
    [savingIds, queuedIds, edits],
  );

  const displayRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (q && !row.name.toLowerCase().includes(q)) return false;
      const eff = effectiveOf(row, edits[row.customer_id]);
      const qty = eff.morning_qty + eff.evening_qty;
      if (filter === 'pending') return qty > 0 && !eff.paid;
      if (filter === 'paid') return qty > 0 && eff.paid;
      if (filter === 'holiday') return qty === 0;
      return true;
    });
  }, [rows, search, filter, edits]);

  const summary = useMemo(() => {
    let tiffins = 0;
    let revenue = 0;
    let collected = 0;
    for (const row of rows) {
      const eff = effectiveOf(row, edits[row.customer_id]);
      const amount = eff.morning_qty * eff.morning_price + eff.evening_qty * eff.evening_price;
      tiffins += eff.morning_qty + eff.evening_qty;
      revenue += amount;
      if (eff.paid) collected += amount;
    }
    return { tiffins, revenue, pending: revenue - collected };
  }, [rows, edits]);

  // ── Edit handlers (stable identities) ──────────────────────────────────────
  const onChangeQty = useCallback((id: string, session: 'morning' | 'evening', value: number) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [`${session}_qty`]: value } }));
    setQueuedIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const onTogglePaid = useCallback(
    (id: string) => {
      const row = previewMap[id];
      if (!row) return;
      setEdits((prev) => {
        const current = prev[id]?.paid ?? (row.morning_paid && row.evening_paid);
        return { ...prev, [id]: { ...prev[id], paid: !current } };
      });
      setQueuedIds((prev) => prev.filter((x) => x !== id));
    },
    [previewMap],
  );

  // ── Date navigation (discard edits, with confirm if dirty) ──────────────────
  const applyDate = useCallback((target: Date) => {
    setDate(target);
    setEdits({});
    setSavingIds([]);
    setQueuedIds([]);
  }, []);

  const navigateDate = useCallback(
    (target: Date) => {
      if (Object.keys(edits).length > 0) setPendingDate(target);
      else applyDate(target);
    },
    [edits, applyDate],
  );

  // ── Save (bulk upsert; offline-enqueued by the mutation hook) ───────────────
  const handleSave = useCallback(() => {
    const ids = Object.keys(edits);
    if (ids.length === 0) return;

    const entries: BulkEntryItem[] = ids.map((id) => {
      const row = previewMap[id];
      const e = edits[id];
      const paid = e.paid ?? (!!row && row.morning_paid && row.evening_paid);
      return {
        customer_id: id,
        morning_qty: e.morning_qty ?? row?.morning_qty ?? 0,
        morning_price: e.morning_price ?? row?.morning_price ?? 0,
        evening_qty: e.evening_qty ?? row?.evening_qty ?? 0,
        evening_price: e.evening_price ?? row?.evening_price ?? 0,
        morning_paid: paid,
        evening_paid: paid,
      };
    });

    const payload: BulkEntryPayload = { entry_date: dateStr, entries };
    setSavingIds(ids);

    bulkSave.mutate(payload, {
      onSuccess: () => {
        setSavingIds([]);
        setQueuedIds((prev) => prev.filter((x) => !ids.includes(x)));
        setEdits((prev) => {
          const next = { ...prev };
          ids.forEach((id) => delete next[id]);
          return next;
        });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyEntries.preview(dateStr) });
        analyticsService.trackEvent(AnalyticsEventNames.DAILY_ENTRY_SAVED, { count: ids.length, date: dateStr });
      },
      onError: () => {
        // The mutation hook has enqueued this batch to the offline sync queue.
        setSavingIds([]);
        setQueuedIds((prev) => Array.from(new Set([...prev, ...ids])));
      },
    });
  }, [edits, dateStr, bulkSave, queryClient, previewMap]);

  // ── Copy Yesterday (preview merge from previous day) ────────────────────────
  const doCopy = useCallback(async () => {
    setCopyConfirm(false);
    setCopyLoading(true);
    const fromStr = toApiDate(subDays(date, 1));
    try {
      const res = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.dailyEntries.preview(dateStr, fromStr),
        queryFn: () => DailyEntryService.getPreview(dateStr, fromStr),
      });
      const copied = res.data ?? [];
      const next: Record<string, RowEdit> = {};
      for (const r of copied) {
        next[r.customer_id] = {
          morning_qty: r.morning_qty,
          evening_qty: r.evening_qty,
          morning_price: r.morning_price,
          evening_price: r.evening_price,
          paid: false, // copying resets paid flags server-side
        };
      }
      setEdits(next);
      setQueuedIds([]);
      analyticsService.trackEvent(AnalyticsEventNames.COPY_PREVIOUS_DAY, { date: dateStr, from: fromStr });
    } finally {
      setCopyLoading(false);
    }
  }, [date, dateStr, queryClient]);

  const requestCopy = useCallback(() => {
    if (Object.keys(edits).length > 0) setCopyConfirm(true);
    else doCopy();
  }, [edits, doCopy]);

  const onRefresh = useCallback(() => {
    preview.refetch();
  }, [preview]);

  const renderEmpty = () => {
    if (preview.isLoading) return <EntrySkeleton />;
    if (preview.isError) return <ErrorState message="Couldn't load entries for this day." onRetry={preview.refetch} />;
    return (
      <EmptyState
        title={search ? 'No matches' : 'No active customers'}
        description={search ? 'No customers match your search.' : 'Add customers first to record daily entries.'}
      />
    );
  };

  return (
    <PageContainer>
      <SafeAreaContainer edges={['top', 'bottom']}>
        <ScreenHeader
          title="Daily Entry"
          onBackPress={() => router.back()}
          rightAction={
            <Button title="Copy" iconLeft="calendar" size="sm" variant="outline" onPress={requestCopy} loading={copyLoading} />
          }
        />

        <DateNavigator
          date={date}
          onPrev={() => navigateDate(subDays(date, 1))}
          onNext={() => navigateDate(addDays(date, 1))}
          onToday={() => navigateDate(new Date())}
        />

        <EntryFilters search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} />

        {network === 'OFFLINE' ? (
          <OfflineState />
        ) : sync.pendingCount > 0 ? (
          <View style={[styles.syncBanner, { backgroundColor: colors.infoLight }]}>
            <Text style={{ color: colors.info, fontSize: typography.size.xs, fontWeight: '600' }}>
              {sync.pendingCount} change{sync.pendingCount > 1 ? 's' : ''} pending sync
            </Text>
            <Button title="Sync now" size="sm" variant="ghost" onPress={() => sync.syncNow()} loading={sync.isSyncing} />
          </View>
        ) : null}

        <View style={styles.listWrap}>
          <FlashList
            data={displayRows}
            keyExtractor={(item) => item.customer_id}
            renderItem={({ item }) => {
              const eff = effectiveOf(item, edits[item.customer_id]);
              return (
                <EntryCard
                  customerId={item.customer_id}
                  name={item.name}
                  address={item.address}
                  morningQty={eff.morning_qty}
                  eveningQty={eff.evening_qty}
                  morningPrice={eff.morning_price}
                  eveningPrice={eff.evening_price}
                  paid={eff.paid}
                  status={getStatus(item)}
                  onChangeQty={onChangeQty}
                  onTogglePaid={onTogglePaid}
                />
              );
            }}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.xl }}
            ListEmptyComponent={renderEmpty()}
            refreshing={preview.isFetching && !preview.isLoading}
            onRefresh={onRefresh}
            keyboardShouldPersistTaps="handled"
          />
        </View>

        <EntrySummaryBar
          totalTiffins={summary.tiffins}
          totalRevenue={summary.revenue}
          pendingRevenue={summary.pending}
          dirtyCount={dirtyCount}
          saving={bulkSave.isPending}
          onSave={handleSave}
        />
      </SafeAreaContainer>

      <ConfirmationModal
        visible={pendingDate !== null}
        onClose={() => setPendingDate(null)}
        onConfirm={() => {
          if (pendingDate) applyDate(pendingDate);
          setPendingDate(null);
        }}
        title="Discard unsaved changes?"
        description="You have unsaved entries for this day. Switching dates will discard them."
        confirmTitle="Discard"
        isDestructive
      />

      <ConfirmationModal
        visible={copyConfirm}
        onClose={() => setCopyConfirm(false)}
        onConfirm={doCopy}
        title="Copy yesterday's entries?"
        description="This replaces your current edits with yesterday's quantities (payment reset to pending). Review and save."
        confirmTitle="Copy"
      />
    </PageContainer>
  );
}

function EntrySkeleton() {
  const { spacing } = useAppTheme();
  return (
    <View style={{ paddingTop: spacing.xs }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <CardContainer key={i} style={{ marginBottom: 10 }}>
          <Skeleton width="50%" height={14} borderRadius={4} style={{ marginBottom: 14 }} />
          <Skeleton width="100%" height={40} borderRadius={8} style={{ marginBottom: 14 }} />
          <Skeleton width="40%" height={20} borderRadius={6} />
        </CardContainer>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    flex: 1,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 8,
  },
});
