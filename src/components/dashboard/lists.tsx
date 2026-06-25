import AppIcon from '@/components/ui/AppIcon';
import { useAppTheme } from '@/theme';
import type {
  PendingPaymentItem,
  RecentExpenseItem,
  RecentTiffinItem,
  TopCustomerItem,
} from '@/types/api.types';
import { formatCurrency, formatFriendlyDate, getInitials } from '@/utils/format';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Avatar = ({ label, color, bg }: { label: string; color: string; bg: string }) => {
  const { typography } = useAppTheme();
  return (
    <View style={[styles.avatar, { backgroundColor: bg }]}>
      <Text style={{ color, fontSize: typography.size.xs, fontWeight: '700' }}>{label}</Text>
    </View>
  );
};

const Divider = () => {
  const { colors } = useAppTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
};

export const RecentTiffinRow = React.memo(
  ({ item, showDivider }: { item: RecentTiffinItem; showDivider?: boolean }) => {
    const { colors, spacing, typography } = useAppTheme();
    return (
      <View>
        <View style={styles.row}>
          <Avatar label={getInitials(item.customer)} color={colors.primary} bg={colors.primaryLight} />
          <View style={[styles.middle, { marginLeft: spacing.md }]}>
            <Text numberOfLines={1} style={[styles.name, { color: colors.text, fontSize: typography.size.sm }]}>
              {item.customer}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 }}>
              {formatFriendlyDate(item.date)} · M{item.morning} · E{item.evening}
            </Text>
          </View>
          <View style={styles.rightCol}>
            <Text style={[styles.amount, { color: colors.text, fontSize: typography.size.sm }]}>
              {formatCurrency(item.amount)}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: typography.size.xs }}>{item.total} tiffins</Text>
          </View>
        </View>
        {showDivider ? <Divider /> : null}
      </View>
    );
  },
);

export const RecentExpenseRow = React.memo(
  ({ item, showDivider }: { item: RecentExpenseItem; showDivider?: boolean }) => {
    const { colors, spacing, typography } = useAppTheme();
    return (
      <View>
        <View style={styles.row}>
          <View style={[styles.iconBadge, { backgroundColor: colors.errorLight }]}>
            <AppIcon name="expense" size={16} color={colors.error} />
          </View>
          <View style={[styles.middle, { marginLeft: spacing.md }]}>
            <Text numberOfLines={1} style={[styles.name, { color: colors.text, fontSize: typography.size.sm }]}>
              {item.category}
            </Text>
            {item.description ? (
              <Text numberOfLines={1} style={{ color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 }}>
                {item.description}
              </Text>
            ) : (
              <Text style={{ color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 }}>
                {formatFriendlyDate(item.date)}
              </Text>
            )}
          </View>
          <Text style={[styles.amount, { color: colors.error, fontSize: typography.size.sm }]}>
            -{formatCurrency(item.amount)}
          </Text>
        </View>
        {showDivider ? <Divider /> : null}
      </View>
    );
  },
);

export const TopCustomerRow = React.memo(
  ({ item, showDivider }: { item: TopCustomerItem; showDivider?: boolean }) => {
    const { colors, spacing, typography } = useAppTheme();
    return (
      <View>
        <View style={styles.row}>
          <Text style={[styles.rank, { color: colors.textMuted, fontSize: typography.size.sm }]}>
            #{item.rank}
          </Text>
          <Avatar label={item.avatar || getInitials(item.name)} color={colors.secondary} bg={colors.secondaryLight} />
          <View style={[styles.middle, { marginLeft: spacing.md }]}>
            <Text numberOfLines={1} style={[styles.name, { color: colors.text, fontSize: typography.size.sm }]}>
              {item.name}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 }}>
              {item.totalTiffins} tiffins
            </Text>
          </View>
          <Text style={[styles.amount, { color: colors.text, fontSize: typography.size.sm }]}>
            {formatCurrency(item.totalAmount)}
          </Text>
        </View>
        {showDivider ? <Divider /> : null}
      </View>
    );
  },
);

export const PendingPaymentRow = React.memo(
  ({ item, showDivider }: { item: PendingPaymentItem; showDivider?: boolean }) => {
    const { colors, spacing, typography } = useAppTheme();
    const overdue = item.daysOverdue > 0;
    return (
      <View>
        <View style={styles.row}>
          <Avatar label={item.avatar || getInitials(item.customer)} color={colors.warning} bg={colors.warningLight} />
          <View style={[styles.middle, { marginLeft: spacing.md }]}>
            <Text numberOfLines={1} style={[styles.name, { color: colors.text, fontSize: typography.size.sm }]}>
              {item.customer}
            </Text>
            <Text style={{ color: overdue ? colors.error : colors.textMuted, fontSize: typography.size.xs, marginTop: 2 }}>
              {overdue ? `${item.daysOverdue} days overdue` : 'Due'}
              {item.lastPayment ? ` · last ${formatFriendlyDate(item.lastPayment)}` : ''}
            </Text>
          </View>
          <Text style={[styles.amount, { color: colors.error, fontSize: typography.size.sm }]}>
            {formatCurrency(item.pendingAmount)}
          </Text>
        </View>
        {showDivider ? <Divider /> : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
  },
  name: {
    fontWeight: '700',
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '800',
  },
  rank: {
    fontWeight: '700',
    width: 26,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50,
  },
});

RecentTiffinRow.displayName = 'RecentTiffinRow';
RecentExpenseRow.displayName = 'RecentExpenseRow';
TopCustomerRow.displayName = 'TopCustomerRow';
PendingPaymentRow.displayName = 'PendingPaymentRow';
