import AppIcon from '@/components/ui/AppIcon';
import { useAppTheme } from '@/theme';
import { formatFriendlyDate } from '@/utils/format';
import { addDays, isSameDay, subDays } from 'date-fns';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface DateFieldProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  /** Latest selectable date; defaults to today (no future expenses). */
  maxDate?: Date;
  error?: string;
}

/**
 * A lightweight date selector using day steppers + a "Today" reset.
 * Used in place of a native date picker (none is bundled in this project).
 */
export const DateField = React.memo(({ label, value, onChange, maxDate, error }: DateFieldProps) => {
  const { colors, spacing, radius, typography } = useAppTheme();
  const cap = maxDate ?? new Date();
  const atMax = isSameDay(value, cap) || value > cap;

  return (
    <View style={{ marginBottom: spacing.lg }}>
      {label && (
        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, fontWeight: '600', marginBottom: spacing.sm }}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.row,
          { borderColor: colors.border, backgroundColor: colors.background, borderRadius: radius.md },
        ]}
      >
        <Stepper icon="chevron-left" onPress={() => onChange(subDays(value, 1))} colors={colors} />

        <Pressable
          onPress={() => onChange(cap)}
          style={styles.center}
          accessibilityLabel="Reset to today"
        >
          <Text style={{ color: colors.text, fontSize: typography.size.base, fontWeight: '700' }}>
            {formatFriendlyDate(value)}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 1 }}>Tap for today</Text>
        </Pressable>

        <Stepper
          icon="chevron-right"
          onPress={() => !atMax && onChange(addDays(value, 1))}
          disabled={atMax}
          colors={colors}
        />
      </View>
      {error ? (
        <Text style={{ color: colors.error, fontSize: typography.size.xs, marginTop: spacing.xs }}>{error}</Text>
      ) : null}
    </View>
  );
});

function Stepper({
  icon,
  onPress,
  disabled,
  colors,
}: {
  icon: 'chevron-left' | 'chevron-right';
  onPress: () => void;
  disabled?: boolean;
  colors: ReturnType<typeof useAppTheme>['colors'];
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.stepper, { opacity: disabled ? 0.35 : pressed ? 0.6 : 1 }]}
    >
      <AppIcon name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: 48,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  stepper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

DateField.displayName = 'DateField';
export default DateField;
