import { PaymentEntryRow, type EntrySession } from '@/components/payments/PaymentEntryRow';
import AppIcon from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { CardContainer } from '@/components/ui/Card';
import { GROUPED_STATUS_COLOR, GROUPED_STATUS_LABEL } from '@/constants/finance';
import { useAppTheme } from '@/theme';
import type { GroupedPaymentCustomer } from '@/types/api.types';
import { formatCurrency, getInitials } from '@/utils/format';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface PaymentCustomerCardProps {
  customer: GroupedPaymentCustomer;
  expanded: boolean;
  onToggleExpand: (customerId: string) => void;
  onToggleSession: (entryId: string, session: EntrySession, nextStatus: 'PAID' | 'PENDING') => void;
  onViewLedger: (customerId: string) => void;
  onRecordCollection: (customer: GroupedPaymentCustomer) => void;
  busy?: boolean;
}

export const PaymentCustomerCard = React.memo(
  ({
    customer,
    expanded,
    onToggleExpand,
    onToggleSession,
    onViewLedger,
    onRecordCollection,
    busy,
  }: PaymentCustomerCardProps) => {
    const { colors, spacing, radius, typography } = useAppTheme();
    const toneKey = GROUPED_STATUS_COLOR[customer.status];
    const tone = colors[toneKey];
    const toneBg = colors[`${toneKey}Light`];

    return (
      <CardContainer style={{ marginBottom: 10 }}>
        {/* Header (tap to expand) */}
        <Pressable
          onPress={() => onToggleExpand(customer.customerId)}
          style={({ pressed }) => [styles.header, pressed && { opacity: 0.8 }]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight, borderRadius: radius.full }]}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: typography.size.sm }}>
              {getInitials(customer.customerName)}
            </Text>
          </View>

          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text numberOfLines={1} style={{ color: colors.text, fontSize: typography.size.base, fontWeight: '700' }}>
              {customer.customerName}
            </Text>
            <View style={[styles.totalsRow, { marginTop: 2 }]}>
              <Text style={{ color: colors.textMuted, fontSize: typography.size.xs }}>
                Total {formatCurrency(customer.totalAmount)}
              </Text>
              <Text style={{ color: colors.success, fontSize: typography.size.xs, fontWeight: '600' }}>
                Paid {formatCurrency(customer.totalPaid)}
              </Text>
              <Text style={{ color: colors.warning, fontSize: typography.size.xs, fontWeight: '600' }}>
                Due {formatCurrency(customer.totalPending)}
              </Text>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end', marginLeft: spacing.sm }}>
            <View style={[styles.badge, { backgroundColor: toneBg, borderRadius: radius.xs }]}>
              <Text style={{ color: tone, fontSize: 10, fontWeight: '700' }}>
                {GROUPED_STATUS_LABEL[customer.status].toUpperCase()}
              </Text>
            </View>
            <AppIcon
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textMuted}
              style={{ marginTop: spacing.xs }}
            />
          </View>
        </Pressable>

        {/* Expanded entries */}
        {expanded && (
          <View style={{ marginTop: spacing.sm }}>
            <View style={[styles.hr, { backgroundColor: colors.border }]} />
            {customer.entries.length === 0 ? (
              <Text style={{ color: colors.textMuted, fontSize: typography.size.sm, paddingVertical: spacing.md }}>
                No entries in this period.
              </Text>
            ) : (
              customer.entries.map((entry, idx) => (
                <View key={entry.entryId}>
                  {idx > 0 && <View style={[styles.hr, { backgroundColor: colors.border }]} />}
                  <PaymentEntryRow entry={entry} onToggleSession={onToggleSession} disabled={busy} />
                </View>
              ))
            )}

            <View style={[styles.actions, { gap: spacing.sm, marginTop: spacing.sm }]}>
              <Button
                title="Ledger"
                iconLeft="info"
                variant="outline"
                size="sm"
                onPress={() => onViewLedger(customer.customerId)}
                style={{ flex: 1 }}
              />
              <Button
                title="Collect"
                iconLeft="dollar"
                size="sm"
                onPress={() => onRecordCollection(customer)}
                style={{ flex: 1 }}
                disabled={customer.totalPending <= 0}
              />
            </View>
          </View>
        )}
      </CardContainer>
    );
  },
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hr: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },
  actions: {
    flexDirection: 'row',
  },
});

PaymentCustomerCard.displayName = 'PaymentCustomerCard';
export default PaymentCustomerCard;
