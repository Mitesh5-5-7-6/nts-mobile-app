import AppIcon from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ErrorState, NoDataState, Skeleton } from '@/components/ui/Feedback';
import { BottomSheet } from '@/components/ui/Modal';
import { useCustomerDetail, useCustomerPaymentSummary } from '@/hooks/api/useCustomers';
import { useAppTheme } from '@/theme';
import type { Customer, Payment } from '@/types/api.types';
import { formatCurrency, formatFriendlyDate, getInitials } from '@/utils/format';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CustomerDetailSheetProps {
  visible: boolean;
  customerId: string | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const STATUS_COLOR: Record<Payment['payment_status'], 'success' | 'warning' | 'info' | 'primary'> = {
  completed: 'success',
  pending: 'warning',
  partial: 'info',
  advance: 'primary',
};

export const CustomerDetailSheet = React.memo(
  ({ visible, customerId, onClose, onEdit, onDelete }: CustomerDetailSheetProps) => {
    const { colors, spacing, radius, typography } = useAppTheme();
    const id = customerId ?? '';
    const detail = useCustomerDetail(id);
    const summary = useCustomerPaymentSummary(id);

    const customer = detail.data;
    const plan = customer?.tiffin_defaults;

    return (
      <BottomSheet visible={visible} onClose={onClose} title="Customer" maxHeight="88%">
        {detail.isLoading && !customer ? (
          <View>
            <Skeleton height={56} borderRadius={12} style={{ marginBottom: spacing.md }} />
            <Skeleton height={90} borderRadius={12} style={{ marginBottom: spacing.md }} />
            <Skeleton height={120} borderRadius={12} />
          </View>
        ) : detail.isError || !customer ? (
          <ErrorState message="Couldn't load this customer." onRetry={detail.refetch} />
        ) : (
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.avatar, { backgroundColor: colors.primaryLight, borderRadius: radius.full }]}>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: typography.size.base }}>
                  {getInitials(customer.full_name)}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={{ color: colors.text, fontSize: typography.size.lg, fontWeight: '800', fontFamily: typography.family.rounded }}>
                  {customer.full_name}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: typography.size.sm, marginTop: 2 }}>{customer.phone}</Text>
              </View>
              <View style={[styles.badge, { borderColor: colors.success, borderRadius: radius.full }]}>
                <View style={[styles.dot, { backgroundColor: colors.success }]} />
                <Text style={{ color: colors.success, fontSize: 10, fontWeight: '700' }}>ACTIVE</Text>
              </View>
            </View>

            {customer.address ? <DetailRow icon="info" label="Address" value={customer.address} /> : null}
            {customer.notes ? <DetailRow icon="edit" label="Notes" value={customer.notes} /> : null}

            {/* Plan */}
            <SectionTitle>Default Tiffin Plan</SectionTitle>
            <View style={[styles.planBox, { borderColor: colors.border, borderRadius: radius.md }]}>
              <PlanLine
                label="Morning"
                active={!!plan?.morning}
                detail={plan?.morning ? `${plan.morning_qty} × ${formatCurrency(plan.morning_price)}` : 'Off'}
              />
              <View style={[styles.hr, { backgroundColor: colors.border }]} />
              <PlanLine
                label="Evening"
                active={!!plan?.evening}
                detail={plan?.evening ? `${plan.evening_qty} × ${formatCurrency(plan.evening_price)}` : 'Off'}
              />
            </View>

            {/* Billing */}
            <SectionTitle>Billing Summary</SectionTitle>
            {summary.isLoading ? (
              <Skeleton height={90} borderRadius={12} />
            ) : summary.isError || !summary.data ? (
              <NoDataState message="No billing records yet." />
            ) : (
              <View>
                <View style={styles.statGrid}>
                  <Stat label="Total Bill" value={formatCurrency(summary.data.total_bill)} />
                  <Stat label="Paid" value={formatCurrency(summary.data.total_paid)} tone={colors.success} />
                  <Stat label="Outstanding" value={formatCurrency(summary.data.outstanding)} tone={colors.error} />
                  <Stat label="Advance" value={formatCurrency(summary.data.advance_balance)} tone={colors.primary} />
                </View>

                {summary.data.payments?.length ? (
                  <View style={{ marginTop: spacing.sm }}>
                    {summary.data.payments.slice(0, 5).map((p) => (
                      <View key={p._id} style={styles.paymentRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.text, fontSize: typography.size.sm, fontWeight: '600' }}>
                            {formatCurrency(p.paid_amount)}
                          </Text>
                          <Text style={{ color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 }}>
                            {formatFriendlyDate(p.payment_date)} · {p.payment_method}
                          </Text>
                        </View>
                        <Text style={{ color: colors[STATUS_COLOR[p.payment_status]], fontSize: 10, fontWeight: '700' }}>
                          {p.payment_status.toUpperCase()}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            )}

            {/* Actions */}
            <View style={[styles.actions, { gap: spacing.md, marginTop: spacing.lg }]}>
              <Button title="Edit" iconLeft="edit" variant="outline" onPress={() => onEdit(customer)} style={{ flex: 1 }} />
              <Button title="Delete" iconLeft="trash" variant="danger" onPress={() => onDelete(customer)} style={{ flex: 1 }} />
            </View>
          </View>
        )}
      </BottomSheet>
    );
  },
);

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { colors, spacing, typography } = useAppTheme();
  return (
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
      {children}
    </Text>
  );
}

function DetailRow({ icon, label, value }: { icon: 'info' | 'edit'; label: string; value: string }) {
  const { colors, spacing, typography } = useAppTheme();
  return (
    <View style={[styles.detailRow, { marginTop: spacing.md }]}>
      <AppIcon name={icon} size={16} color={colors.textMuted} />
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <Text style={{ color: colors.textMuted, fontSize: typography.size.xs }}>{label}</Text>
        <Text style={{ color: colors.text, fontSize: typography.size.sm, marginTop: 1 }}>{value}</Text>
      </View>
    </View>
  );
}

function PlanLine({ label, active, detail }: { label: string; active: boolean; detail: string }) {
  const { colors, spacing, typography } = useAppTheme();
  return (
    <View style={[styles.planLine, { padding: spacing.md }]}>
      <Text style={{ color: active ? colors.text : colors.textMuted, fontSize: typography.size.sm, fontWeight: '600' }}>
        {label}
      </Text>
      <Text style={{ color: active ? colors.text : colors.textMuted, fontSize: typography.size.sm }}>{detail}</Text>
    </View>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  const { colors, spacing, typography } = useAppTheme();
  return (
    <View style={[styles.statCell, { paddingVertical: spacing.sm }]}>
      <Text style={{ color: colors.textMuted, fontSize: typography.size.xs }}>{label}</Text>
      <Text style={{ color: tone ?? colors.text, fontSize: typography.size.base, fontWeight: '800', marginTop: 2, fontFamily: typography.family.rounded }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  planBox: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  planLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hr: {
    height: StyleSheet.hairlineWidth,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCell: {
    width: '50%',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actions: {
    flexDirection: 'row',
  },
});

CustomerDetailSheet.displayName = 'CustomerDetailSheet';
export default CustomerDetailSheet;
