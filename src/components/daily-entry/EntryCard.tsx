import { CardContainer } from '@/components/ui/Card';
import { useAppTheme } from '@/theme';
import { formatCurrency } from '@/utils/format';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type EntryRowStatus = 'saved' | 'unsaved' | 'syncing' | 'queued' | 'new';

type ThemeColorKey = 'success' | 'warning' | 'primary' | 'info' | 'textMuted';

const STATUS_META: Record<EntryRowStatus, { label: string; color: ThemeColorKey }> = {
  saved: { label: 'Saved', color: 'success' },
  unsaved: { label: 'Unsaved', color: 'warning' },
  syncing: { label: 'Syncing…', color: 'primary' },
  queued: { label: 'Queued', color: 'info' },
  new: { label: 'New', color: 'textMuted' },
};

function StepButton({ symbol, enabled, onPress }: { symbol: string; enabled: boolean; onPress: () => void }) {
  const { colors, radius, typography } = useAppTheme();
  return (
    <Pressable
      onPress={enabled ? onPress : undefined}
      disabled={!enabled}
      hitSlop={6}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.stepBtn,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
          borderRadius: radius.sm,
          opacity: enabled ? 1 : 0.4,
        },
        pressed && enabled && { backgroundColor: colors.backgroundSelected },
      ]}
    >
      <Text style={{ color: colors.text, fontSize: typography.size.lg, fontWeight: '700', lineHeight: 22 }}>{symbol}</Text>
    </Pressable>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}) {
  const { colors, spacing, typography } = useAppTheme();
  const canDec = value > min;
  const canInc = value < max;

  return (
    <View style={styles.stepperBlock}>
      <Text style={{ color: colors.textMuted, fontSize: typography.size.xs, marginBottom: spacing.xs }}>{label}</Text>
      <View style={styles.stepperRow}>
        <StepButton symbol="−" enabled={canDec} onPress={() => onChange(value - 1)} />
        <Text style={[styles.stepValue, { color: colors.text, fontSize: typography.size.lg }]}>{value}</Text>
        <StepButton symbol="+" enabled={canInc} onPress={() => onChange(value + 1)} />
      </View>
    </View>
  );
}

export interface EntryCardProps {
  customerId: string;
  name: string;
  address?: string;
  morningQty: number;
  eveningQty: number;
  morningPrice: number;
  eveningPrice: number;
  paid: boolean;
  status: EntryRowStatus;
  onChangeQty: (customerId: string, session: 'morning' | 'evening', value: number) => void;
  onTogglePaid: (customerId: string) => void;
}

export const EntryCard = React.memo(
  ({
    customerId,
    name,
    address,
    morningQty,
    eveningQty,
    morningPrice,
    eveningPrice,
    paid,
    status,
    onChangeQty,
    onTogglePaid,
  }: EntryCardProps) => {
    const { colors, spacing, radius, typography } = useAppTheme();
    const amount = morningQty * morningPrice + eveningQty * eveningPrice;
    const meta = STATUS_META[status];

    return (
      <CardContainer style={styles.card}>
        {/* Header: name + status */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ color: colors.text, fontSize: typography.size.base, fontWeight: '700', fontFamily: typography.family.rounded }}>
              {name}
            </Text>
            {address ? (
              <Text numberOfLines={1} style={{ color: colors.textMuted, fontSize: typography.size.xs, marginTop: 1 }}>
                {address}
              </Text>
            ) : null}
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: colors[meta.color] }]} />
            <Text style={{ color: colors[meta.color], fontSize: 11, fontWeight: '600' }}>{meta.label}</Text>
          </View>
        </View>

        {/* Steppers */}
        <View style={[styles.steppers, { gap: spacing.lg, marginTop: spacing.md }]}>
          <Stepper label="Morning Qty" value={morningQty} onChange={(n) => onChangeQty(customerId, 'morning', n)} />
          <Stepper label="Evening Qty" value={eveningQty} onChange={(n) => onChangeQty(customerId, 'evening', n)} />
        </View>

        {/* Footer: amount + paid toggle */}
        <View style={[styles.footerRow, { marginTop: spacing.md }]}>
          <View>
            <Text style={{ color: colors.textMuted, fontSize: typography.size.xs }}>Amount</Text>
            <Text style={{ color: colors.text, fontSize: typography.size.lg, fontWeight: '800', fontFamily: typography.family.rounded }}>
              {formatCurrency(amount)}
            </Text>
          </View>
          <Pressable
            onPress={() => onTogglePaid(customerId)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.paidPill,
              {
                backgroundColor: paid ? colors.successLight : colors.warningLight,
                borderColor: paid ? colors.success : colors.warning,
                borderRadius: radius.full,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: paid ? colors.success : colors.warning }]} />
            <Text style={{ color: paid ? colors.success : colors.warning, fontSize: typography.size.sm, fontWeight: '700' }}>
              {paid ? 'Paid' : 'Pending'}
            </Text>
          </Pressable>
        </View>
      </CardContainer>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginLeft: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  steppers: {
    flexDirection: 'row',
  },
  stepperBlock: {
    flex: 1,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    fontWeight: '800',
    minWidth: 32,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
});

EntryCard.displayName = 'EntryCard';
export default EntryCard;
