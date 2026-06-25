import { CardContainer } from '@/components/ui/Card';
import AppIcon from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { NoDataState, Skeleton } from '@/components/ui/Feedback';
import { useAppTheme } from '@/theme';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface SectionCardProps {
  title: string;
  subtitle?: string;
  actionTitle?: string;
  onActionPress?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
  /** Height of the skeleton block shown while loading. */
  loadingHeight?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * A dashboard panel that owns its own loading / error / empty presentation so
 * each screen section degrades gracefully and independently. Never blocks the
 * whole screen with a spinner.
 */
export const SectionCard = React.memo(
  ({
    title,
    subtitle,
    actionTitle,
    onActionPress,
    isLoading,
    isError,
    isEmpty,
    emptyText = 'No data for this period.',
    onRetry,
    loadingHeight = 140,
    children,
    style,
  }: SectionCardProps) => {
    const { colors, spacing, typography } = useAppTheme();

    return (
      <CardContainer style={style}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: typography.size.base,
                fontWeight: '700',
                fontFamily: typography.family.rounded,
              }}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs, marginTop: spacing.xxs }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {actionTitle && onActionPress ? (
            <Pressable onPress={onActionPress} style={({ pressed }) => pressed && styles.pressed}>
              <Text style={{ color: colors.primary, fontSize: typography.size.sm, fontWeight: '600' }}>
                {actionTitle}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={{ marginTop: spacing.md }}>
          {isLoading ? (
            <View>
              <Skeleton height={loadingHeight} borderRadius={8} />
            </View>
          ) : isError ? (
            <View style={[styles.center, { paddingVertical: spacing.lg }]}>
              <AppIcon name="alert" size={28} color={colors.error} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.size.sm,
                  textAlign: 'center',
                  marginTop: spacing.sm,
                  marginBottom: onRetry ? spacing.md : 0,
                }}
              >
                Couldn&apos;t load this section.
              </Text>
              {onRetry ? <Button title="Retry" onPress={onRetry} size="sm" variant="outline" /> : null}
            </View>
          ) : isEmpty ? (
            <NoDataState message={emptyText} />
          ) : (
            children
          )}
        </View>
      </CardContainer>
    );
  },
);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});

SectionCard.displayName = 'SectionCard';
export default SectionCard;
