import { Button } from '@/components/ui/Button';
import { useAppTheme } from '@/theme';
import { formatCompactCurrency, formatNumber } from '@/utils/format';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EntrySummaryBarProps {
  totalTiffins: number;
  totalRevenue: number;
  pendingRevenue: number;
  dirtyCount: number;
  saving: boolean;
  onSave: () => void;
}

export const EntrySummaryBar = React.memo(
  ({ totalTiffins, totalRevenue, pendingRevenue, dirtyCount, saving, onSave }: EntrySummaryBarProps) => {
    const { colors, spacing, typography } = useAppTheme();

    const Metric = ({ label, value, tone }: { label: string; value: string; tone?: string }) => (
      <View style={styles.metric}>
        <Text style={{ color: colors.textMuted, fontSize: typography.size.xs }}>{label}</Text>
        <Text style={{ color: tone ?? colors.text, fontSize: typography.size.base, fontWeight: '800', fontFamily: typography.family.rounded }}>
          {value}
        </Text>
      </View>
    );

    return (
      <View style={[styles.bar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
        <View style={styles.metrics}>
          <Metric label="Tiffins" value={formatNumber(totalTiffins)} />
          <Metric label="Revenue" value={formatCompactCurrency(totalRevenue)} />
          <Metric label="Pending" value={formatCompactCurrency(pendingRevenue)} tone={pendingRevenue > 0 ? colors.error : colors.success} />
        </View>
        <Button
          title={dirtyCount > 0 ? `Save (${dirtyCount})` : 'Saved'}
          onPress={onSave}
          loading={saving}
          disabled={dirtyCount === 0}
          size="lg"
          style={{ marginTop: spacing.sm }}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
  },
});

EntrySummaryBar.displayName = 'EntrySummaryBar';
export default EntrySummaryBar;
