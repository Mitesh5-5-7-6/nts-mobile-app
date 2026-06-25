import { Button } from '@/components/ui/Button';
import { ErrorState, NoDataState, Skeleton } from '@/components/ui/Feedback';
import { BottomSheet } from '@/components/ui/Modal';
import { paymentMethodLabel } from '@/constants/finance';
import { useCustomerPaymentSummary } from '@/hooks/api/useCustomers';
import { useAppTheme } from '@/theme';
import type { Payment, PaymentStatus } from '@/types/api.types';
import { formatCurrency, formatFriendlyDate } from '@/utils/format';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const STATUS_COLOR: Record<PaymentStatus, 'success' | 'warning' | 'info' | 'primary'> = {
  completed: 'success',
  pending: 'warning',
  partial: 'info',
  advance: 'primary',
};

interface CustomerLedgerSheetProps {
  visible: boolean;
  customerId: string | null;
  onClose: () => void;
  onRecordCollection: (customerId: string, customerName: string) => void;
}

export const CustomerLedgerSheet = React.memo(
  ({ visible, customerId, onClose, onRecordCollection }: CustomerLedgerSheetProps) => {
    const { colors, spacing, typography } = useAppTheme();
    const summary = useCustomerPaymentSummary(customerId ?? '');
    const data = summary.data;

    return (
      <BottomSheet visible={visible} onClose={onClose} title="Customer Ledger" maxHeight="88%">
        {summary.isLoading && !data ? (
          <View>
            <Skeleton height={90} borderRadius={12} style={{ marginBottom: spacing.md }} />
            <Skeleton height={120} borderRadius={12} />
          </View>
        ) : summary.isError || !data ? (
          <ErrorState message="Couldn't load this ledger." onRetry={summary.refetch} />
        ) : (
          <View>
            <Text style={{ color: colors.text, fontSize: typography.size.lg, fontWeight: '800' }}>
              {data.full_name}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: typography.size.sm, marginTop: 2 }}>
              {data.phone}
            </Text>

            {/* Financial summary */}
            <View style={styles.statGrid}>
              <Stat label="Total Bill" value={formatCurrency(data.total_bill)} />
              <Stat label="Paid" value={formatCurrency(data.total_paid)} tone={colors.success} />
              <Stat label="Outstanding" value={formatCurrency(data.outstanding)} tone={colors.error} />
              <Stat label="Advance" value={formatCurrency(data.advance_balance)} tone={colors.primary} />
            </View>

            <Button
              title="Record Collection"
              iconLeft="dollar"
              onPress={() => onRecordCollection(data.customer_id, data.full_name)}
              style={{ marginTop: spacing.md }}
            />

            {/* Payment history */}
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.size.xs,
                fontWeight: '700',
                textTransform: 'uppercase',
                marginTop: spacing.lg,
                marginBottom: spacing.sm,
              }}
            >
              Payment History
            </Text>
            {data.payments?.length ? (
              data.payments.map((p: Payment) => (
                <View key={p._id} style={[styles.paymentRow, { borderBottomColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: typography.size.sm, fontWeight: '700' }}>
                      {formatCurrency(p.paid_amount)}
                      {p.remaining_amount > 0 ? (
                        <Text style={{ color: colors.warning, fontWeight: '500' }}>
                          {`  (${formatCurrency(p.remaining_amount)} due)`}
                        </Text>
                      ) : null}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 }}>
                      {formatFriendlyDate(p.payment_date)} · {paymentMethodLabel(p.payment_method)}
                    </Text>
                  </View>
                  <Text style={{ color: colors[STATUS_COLOR[p.payment_status]], fontSize: 10, fontWeight: '700' }}>
                    {p.payment_status.toUpperCase()}
                  </Text>
                </View>
              ))
            ) : (
              <NoDataState message="No payments recorded yet." />
            )}
          </View>
        )}
      </BottomSheet>
    );
  },
);

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  const { colors, spacing, typography } = useAppTheme();
  return (
    <View style={[styles.statCell, { paddingVertical: spacing.sm }]}>
      <Text style={{ color: colors.textMuted, fontSize: typography.size.xs }}>{label}</Text>
      <Text style={{ color: tone ?? colors.text, fontSize: typography.size.base, fontWeight: '800', marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  statCell: {
    width: '50%',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

CustomerLedgerSheet.displayName = 'CustomerLedgerSheet';
export default CustomerLedgerSheet;
