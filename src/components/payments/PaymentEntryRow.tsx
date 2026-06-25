import AppIcon from '@/components/ui/AppIcon';
import { useAppTheme } from '@/theme';
import type { GroupedPaymentEntry } from '@/types/api.types';
import { formatCurrency, formatShortDate } from '@/utils/format';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type EntrySession = 'morning' | 'evening';

interface PaymentEntryRowProps {
  entry: GroupedPaymentEntry;
  /** Toggle a session's paid flag. nextStatus is the target value. */
  onToggleSession: (entryId: string, session: EntrySession, nextStatus: 'PAID' | 'PENDING') => void;
  disabled?: boolean;
}

export const PaymentEntryRow = React.memo(({ entry, onToggleSession, disabled }: PaymentEntryRowProps) => {
  const { colors, spacing, radius, typography } = useAppTheme();

  const sessions: { key: EntrySession; label: string; qty: number; paid: boolean }[] = [];
  if (entry.morningQty > 0) {
    sessions.push({ key: 'morning', label: 'M', qty: entry.morningQty, paid: entry.morningPaid });
  }
  if (entry.eveningQty > 0) {
    sessions.push({ key: 'evening', label: 'E', qty: entry.eveningQty, paid: entry.eveningPaid });
  }

  return (
    <View style={[styles.row, { paddingVertical: spacing.sm }]}>
      <View style={styles.left}>
        <Text style={{ color: colors.text, fontSize: typography.size.sm, fontWeight: '700' }}>
          {formatShortDate(entry.date)}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: typography.size.xs, marginTop: 1 }}>
          {entry.morningQty > 0 ? `M${entry.morningQty}` : ''}
          {entry.morningQty > 0 && entry.eveningQty > 0 ? ' + ' : ''}
          {entry.eveningQty > 0 ? `E${entry.eveningQty}` : ''}
          {`  ·  ${formatCurrency(entry.totalAmount)}`}
        </Text>
      </View>

      <View style={[styles.pills, { gap: spacing.xs }]}>
        {sessions.map((s) => {
          const tone = s.paid ? colors.success : colors.warning;
          const bg = s.paid ? colors.successLight : colors.warningLight;
          return (
            <Pressable
              key={s.key}
              disabled={disabled}
              onPress={() => onToggleSession(entry.entryId, s.key, s.paid ? 'PENDING' : 'PAID')}
              style={({ pressed }) => [
                styles.pill,
                {
                  backgroundColor: bg,
                  borderColor: tone,
                  borderRadius: radius.full,
                  opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 4,
                },
              ]}
            >
              <AppIcon name={s.paid ? 'check' : 'close'} size={11} color={tone} />
              <Text style={{ color: tone, fontSize: 11, fontWeight: '700', marginLeft: 3 }}>
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
  },
  pills: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
});

PaymentEntryRow.displayName = 'PaymentEntryRow';
export default PaymentEntryRow;
