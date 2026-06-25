import AppIcon from '@/components/ui/AppIcon';
import { CardContainer } from '@/components/ui/Card';
import { useAppTheme } from '@/theme';
import type { Customer } from '@/types/api.types';
import { formatCurrency, getInitials } from '@/utils/format';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/** Human-readable summary of a customer's default tiffin plan. */
const planSummary = (customer: Customer, currency: (n: number) => string): string => {
  const d = customer.tiffin_defaults;
  const parts: string[] = [];
  if (d?.morning) parts.push(`M ${d.morning_qty}×${currency(d.morning_price)}`);
  if (d?.evening) parts.push(`E ${d.evening_qty}×${currency(d.evening_price)}`);
  return parts.length ? parts.join('   ·   ') : 'No active plan';
};

interface CustomerListItemProps {
  customer: Customer;
  onPress: (customer: Customer) => void;
}

export const CustomerListItem = React.memo(({ customer, onPress }: CustomerListItemProps) => {
  const { colors, spacing, radius, typography } = useAppTheme();

  return (
    <CardContainer onPress={() => onPress(customer)} style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight, borderRadius: radius.full }]}>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: typography.size.sm }}>
            {getInitials(customer.full_name)}
          </Text>
        </View>

        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text
            numberOfLines={1}
            style={{ color: colors.text, fontWeight: '700', fontSize: typography.size.base, fontFamily: typography.family.rounded }}
          >
            {customer.full_name}
          </Text>
          <Text numberOfLines={1} style={{ color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 }}>
            {customer.phone}
            {customer.address ? `   ·   ${customer.address}` : ''}
          </Text>
          <Text numberOfLines={1} style={{ color: colors.textSecondary, fontSize: typography.size.xs, marginTop: 4 }}>
            {planSummary(customer, formatCurrency)}
          </Text>
        </View>

        <AppIcon name="chevron-right" size={20} color={colors.textMuted} />
      </View>
    </CardContainer>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

CustomerListItem.displayName = 'CustomerListItem';
export default CustomerListItem;
