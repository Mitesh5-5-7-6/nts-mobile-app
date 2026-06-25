import { CardContainer } from '@/components/ui/Card';
import AppIcon, { IconNameType } from '@/components/ui/AppIcon';
import { useAppTheme } from '@/theme';
import { formatPercent, isPositiveTrend } from '@/utils/format';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface DashboardStatTileProps {
  label: string;
  value: string;
  subtitle?: string;
  /** Period-over-period delta as a percentage; omit to hide the trend chip. */
  delta?: number;
  icon: IconNameType;
  /** Accent color for the icon glyph. */
  color: string;
  /** Background for the icon badge (usually the light variant of `color`). */
  bgColor: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const DashboardStatTile = React.memo(
  ({ label, value, subtitle, delta, icon, color, bgColor, onPress, style }: DashboardStatTileProps) => {
    const { colors, spacing, typography } = useAppTheme();
    const positive = isPositiveTrend(delta);

    return (
      <CardContainer onPress={onPress} style={[styles.tile, style]}>
        <View style={styles.headerRow}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              color: colors.textSecondary,
              fontSize: typography.size.sm,
              fontWeight: '600',
              fontFamily: typography.family.sans,
            }}
          >
            {label}
          </Text>
          <View style={[styles.iconBadge, { backgroundColor: bgColor }]}>
            <AppIcon name={icon} size={16} color={color} />
          </View>
        </View>

        <Text
          numberOfLines={1}
          style={{
            color: colors.text,
            fontSize: typography.size.xxl,
            fontWeight: '800',
            fontFamily: typography.family.rounded,
            marginTop: spacing.xs,
          }}
        >
          {value}
        </Text>

        {subtitle ? (
          <Text
            numberOfLines={1}
            style={{ color: colors.textMuted, fontSize: typography.size.xs, marginTop: spacing.xxs }}
          >
            {subtitle}
          </Text>
        ) : null}

        {delta !== undefined ? (
          <View style={[styles.deltaRow, { marginTop: spacing.sm }]}>
            <AppIcon
              name={positive ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={positive ? colors.success : colors.error}
            />
            <Text
              style={{
                color: positive ? colors.success : colors.error,
                fontSize: typography.size.xs,
                fontWeight: '700',
                marginLeft: spacing.xxs,
              }}
            >
              {formatPercent(delta)} <Text style={{ color: colors.textMuted, fontWeight: '500' }}>vs prev</Text>
            </Text>
          </View>
        ) : null}
      </CardContainer>
    );
  },
);

const styles = StyleSheet.create({
  tile: {
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

DashboardStatTile.displayName = 'DashboardStatTile';
export default DashboardStatTile;
