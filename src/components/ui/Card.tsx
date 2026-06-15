import { useAppTheme } from '@/theme';
import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import AppIcon, { IconNameType } from './AppIcon';
import { Button } from './Button';

// Utility component: CARD CONTAINER wrapper
export const CardContainer = React.memo(({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) => {
  const { colors, radius, shadows, spacing } = useAppTheme();

  const containerStyle = [
    styles.card,
    {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.md,
      ...shadows.sm,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          containerStyle,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{children}</View>;
});

// 1. STAT CARD (Key numerical metric with trend indicator)
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconNameType;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const StatCard = React.memo(({
  title,
  value,
  icon,
  trend,
  onPress,
  style,
}: StatCardProps) => {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <CardContainer onPress={onPress} style={style}>
      <View style={styles.rowBetween}>
        <Text style={[styles.statTitle, { color: colors.textSecondary, fontSize: typography.size.sm, fontFamily: typography.family.sans }]}>
          {title}
        </Text>
        <View style={[styles.iconBadge, { backgroundColor: colors.backgroundSecondary }]}>
          <AppIcon name={icon} size={18} color={colors.primary} />
        </View>
      </View>
      <Text style={[styles.statValue, { color: colors.text, fontSize: typography.size.xxl, marginTop: spacing.xs, fontFamily: typography.family.rounded }]}>
        {value}
      </Text>
      {trend && (
        <View style={[styles.row, { marginTop: spacing.sm }]}>
          <AppIcon
            name={trend.isPositive ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={trend.isPositive ? colors.success : colors.error}
          />
          <Text
            style={{
              color: trend.isPositive ? colors.success : colors.error,
              fontSize: typography.size.xs,
              fontWeight: '600',
              marginLeft: spacing.xxs,
            }}
          >
            {trend.value}
          </Text>
        </View>
      )}
    </CardContainer>
  );
});

// 2. CUSTOMER CARD (Displays status & balance)
export interface CustomerCardProps {
  name: string;
  phone: string;
  tiffinStatus: 'active' | 'suspended' | 'cancelled';
  balance: number; // Positive is due, negative is advanced, 0 is settled
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const CustomerCard = React.memo(({
  name,
  phone,
  tiffinStatus,
  balance,
  onPress,
  style,
}: CustomerCardProps) => {
  const { colors, spacing, typography, radius } = useAppTheme();

  const getStatusColor = () => {
    switch (tiffinStatus) {
      case 'active':
        return colors.success;
      case 'suspended':
        return colors.warning;
      case 'cancelled':
      default:
        return colors.error;
    }
  };

  const getBalanceStyle = () => {
    if (balance > 0) return { color: colors.error, text: `Due: ₹${balance}` };
    if (balance < 0) return { color: colors.success, text: `Adv: ₹${Math.abs(balance)}` };
    return { color: colors.textSecondary, text: 'Settled' };
  };

  const balanceInfo = getBalanceStyle();
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <CardContainer onPress={onPress} style={style}>
      <View style={styles.rowBetween}>
        {/* Profile Initials Avatar */}
        <View style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight, borderRadius: radius.full }]}>
            <Text style={[styles.avatarText, { color: colors.primary, fontSize: typography.size.sm }]}>
              {initials}
            </Text>
          </View>
          <View style={{ marginLeft: spacing.md }}>
            <Text style={[styles.customerName, { color: colors.text, fontSize: typography.size.base, fontFamily: typography.family.rounded }]}>
              {name}
            </Text>
            <Text style={[styles.customerPhone, { color: colors.textMuted, fontSize: typography.size.xs }]}>
              {phone}
            </Text>
          </View>
        </View>

        {/* Status / Balance details */}
        <View style={{ alignItems: 'flex-end' }}>
          <View style={[styles.statusBadge, { borderColor: getStatusColor(), borderRadius: radius.full }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(), borderRadius: radius.full }]} />
            <Text style={[styles.statusLabel, { color: getStatusColor(), fontSize: 10 }]}>
              {tiffinStatus.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.balanceText, { color: balanceInfo.color, fontSize: typography.size.sm, marginTop: spacing.sm, fontFamily: typography.family.rounded }]}>
            {balanceInfo.text}
          </Text>
        </View>
      </View>
    </CardContainer>
  );
});

// 3. PAYMENT CARD (Transaction record description)
export interface PaymentCardProps {
  customerName: string;
  amount: number;
  date: string;
  method: 'UPI' | 'Cash' | 'Bank Transfer';
  status: 'completed' | 'pending' | 'failed';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const PaymentCard = React.memo(({
  customerName,
  amount,
  date,
  method,
  status,
  onPress,
  style,
}: PaymentCardProps) => {
  const { colors, spacing, typography, radius } = useAppTheme();

  const getStatusStyle = () => {
    switch (status) {
      case 'completed':
        return { bg: colors.successLight, text: colors.success };
      case 'pending':
        return { bg: colors.warningLight, text: colors.warning };
      case 'failed':
      default:
        return { bg: colors.errorLight, text: colors.error };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <CardContainer onPress={onPress} style={style}>
      <View style={styles.rowBetween}>
        <View style={styles.row}>
          <View style={[styles.iconBadge, { backgroundColor: colors.backgroundSecondary }]}>
            <AppIcon name="payments" size={18} color={colors.primary} />
          </View>
          <View style={{ marginLeft: spacing.md }}>
            <Text style={[styles.customerName, { color: colors.text, fontSize: typography.size.base, fontFamily: typography.family.rounded }]}>
              {customerName}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: typography.size.xs, marginTop: spacing.xxs }}>
              {date} • {method}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.amountText, { color: colors.success, fontSize: typography.size.md, fontFamily: typography.family.rounded }]}>
            +₹{amount}
          </Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg, borderRadius: radius.xs, marginTop: spacing.xs }]}>
            <Text style={{ color: statusStyle.text, fontSize: 10, fontWeight: '700' }}>
              {status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </CardContainer>
  );
});

// 4. EXPENSE CARD (Detailed business outgoings)
export interface ExpenseCardProps {
  category: string;
  amount: number;
  date: string;
  description?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ExpenseCard = React.memo(({
  category,
  amount,
  date,
  description,
  onPress,
  style,
}: ExpenseCardProps) => {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <CardContainer onPress={onPress} style={style}>
      <View style={styles.rowBetween}>
        <View style={styles.row}>
          <View style={[styles.iconBadge, { backgroundColor: colors.errorLight }]}>
            <AppIcon name="expense" size={18} color={colors.error} />
          </View>
          <View style={{ marginLeft: spacing.md, flexShrink: 1 }}>
            <Text style={[styles.customerName, { color: colors.text, fontSize: typography.size.base, fontFamily: typography.family.rounded }]}>
              {category}
            </Text>
            {description && (
              <Text numberOfLines={1} style={{ color: colors.textSecondary, fontSize: typography.size.xs, marginTop: spacing.xxs }}>
                {description}
              </Text>
            )}
            <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: spacing.xxs }}>
              {date}
            </Text>
          </View>
        </View>

        <Text style={[styles.amountText, { color: colors.error, fontSize: typography.size.md, fontFamily: typography.family.rounded }]}>
          -₹{amount}
        </Text>
      </View>
    </CardContainer>
  );
});

// 5. REPORT CARD (Stats block with action button)
export interface ReportCardProps {
  title: string;
  summary: string;
  metrics: { label: string; value: string }[];
  onActionPress: () => void;
  actionTitle?: string;
  style?: StyleProp<ViewStyle>;
}

export const ReportCard = React.memo(({
  title,
  summary,
  metrics,
  onActionPress,
  actionTitle = 'View Detailed Report',
  style,
}: ReportCardProps) => {
  const { colors, spacing, typography, radius } = useAppTheme();

  return (
    <CardContainer style={style}>
      <Text style={[styles.dialogTitle, { color: colors.text, fontSize: typography.size.md, textAlign: 'left', fontFamily: typography.family.rounded }]}>
        {title}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs, marginTop: spacing.xxs, marginBottom: spacing.md }}>
        {summary}
      </Text>

      {/* Grid of metrics */}
      <View style={[styles.metricsGrid, { borderColor: colors.border, borderRadius: radius.md, marginBottom: spacing.md }]}>
        {metrics.map((m, idx) => (
          <View key={idx} style={[styles.metricGridItem, idx > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border }, { padding: spacing.sm }]}>
            <Text style={{ color: colors.textMuted, fontSize: 10, textAlign: 'center' }}>
              {m.label.toUpperCase()}
            </Text>
            <Text style={{ color: colors.text, fontSize: typography.size.sm, fontWeight: '700', textAlign: 'center', marginTop: spacing.xxs }}>
              {m.value}
            </Text>
          </View>
        ))}
      </View>

      <Button title={actionTitle} onPress={onActionPress} variant="outline" size="sm" />
    </CardContainer>
  );
});

// 6. SUMMARY CARD (Overall status view for dashboard panels)
export interface SummaryCardProps {
  title: string;
  primaryAmount: string;
  secondaryLabel: string;
  metrics: { label: string; value: string; icon: IconNameType }[];
  style?: StyleProp<ViewStyle>;
}

export const SummaryCard = React.memo(({
  title,
  primaryAmount,
  secondaryLabel,
  metrics,
  style,
}: SummaryCardProps) => {
  const { colors, spacing, typography, radius } = useAppTheme();

  return (
    <CardContainer style={[style, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs }}>
        {title.toUpperCase()}
      </Text>
      <Text style={{ color: colors.text, fontSize: typography.size.xxxl, fontWeight: '800', fontFamily: typography.family.rounded, marginTop: spacing.xs }}>
        {primaryAmount}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: typography.size.xs, marginBottom: spacing.lg }}>
        {secondaryLabel}
      </Text>

      {/* Metrics Row */}
      <View style={styles.rowBetween}>
        {metrics.map((m, idx) => (
          <View key={idx} style={[styles.row, { flex: 1 }]}>
            <View style={[styles.iconBadge, { backgroundColor: colors.background, borderRadius: radius.sm }]}>
              <AppIcon name={m.icon} size={16} color={colors.primary} />
            </View>
            <View style={{ marginLeft: spacing.sm }}>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>{m.label}</Text>
              <Text style={{ color: colors.text, fontSize: typography.size.sm, fontWeight: '700' }}>{m.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </CardContainer>
  );
});

// 7. INFO CARD (Banner-like alert panel)
export interface InfoCardProps {
  title: string;
  message: string;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const InfoCard = React.memo(({
  title,
  message,
  onClose,
  style,
}: InfoCardProps) => {
  const { colors, spacing, typography, radius } = useAppTheme();

  return (
    <View
      style={[
        styles.infoCard,
        {
          backgroundColor: colors.primaryLight,
          borderColor: colors.primary,
          borderRadius: radius.md,
          padding: spacing.md,
        },
        style,
      ]}
    >
      <View style={styles.rowBetween}>
        <View style={[styles.row, { flex: 1 }]}>
          <AppIcon name="info" size={18} color={colors.primary} style={{ marginRight: spacing.sm, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.primaryDark, fontSize: typography.size.sm, fontWeight: '700' }}>
              {title}
            </Text>
            <Text style={{ color: colors.text, fontSize: typography.size.xs, marginTop: spacing.xxs }}>
              {message}
            </Text>
          </View>
        </View>
        {onClose && (
          <Pressable onPress={onClose} style={styles.infoClose}>
            <AppIcon name="close" size={14} color={colors.primaryDark} />
          </Pressable>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTitle: {
    fontWeight: '600',
  },
  statValue: {
    fontWeight: '800',
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700',
  },
  customerName: {
    fontWeight: '700',
  },
  customerPhone: {
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    marginRight: 4,
  },
  statusLabel: {
    fontWeight: '700',
  },
  balanceText: {
    fontWeight: '700',
  },
  amountText: {
    fontWeight: '700',
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTitle: {
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  metricGridItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    borderWidth: 1,
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  infoClose: {
    marginLeft: 8,
    alignSelf: 'flex-start',
    padding: 2,
  },
});

CardContainer.displayName = 'CardContainer';
StatCard.displayName = 'StatCard';
CustomerCard.displayName = 'CustomerCard';
PaymentCard.displayName = 'PaymentCard';
ExpenseCard.displayName = 'ExpenseCard';
ReportCard.displayName = 'ReportCard';
SummaryCard.displayName = 'SummaryCard';
InfoCard.displayName = 'InfoCard';

export default StatCard;
