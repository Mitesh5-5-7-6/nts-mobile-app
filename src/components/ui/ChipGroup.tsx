import { useAppTheme } from '@/theme';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipGroupProps<T extends string> {
  label?: string;
  options: ChipOption<T>[];
  /** Selected value(s). A string for single-select, array for multi-select. */
  selected: T | T[] | null;
  onChange: (next: T) => void;
  error?: string;
}

/**
 * A wrapping row of selectable pills. Pass a string `selected` for single-select
 * behaviour or an array for multi-select. Selection toggling is delegated to the
 * caller via `onChange`.
 */
export function ChipGroup<T extends string>({
  label,
  options,
  selected,
  onChange,
  error,
}: ChipGroupProps<T>) {
  const { colors, spacing, radius, typography } = useAppTheme();
  const isSelected = (value: T) =>
    Array.isArray(selected) ? selected.includes(value) : selected === value;

  return (
    <View style={{ marginBottom: spacing.lg }}>
      {label && (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.size.sm,
            fontWeight: '600',
            marginBottom: spacing.sm,
          }}
        >
          {label}
        </Text>
      )}
      <View style={[styles.row, { gap: spacing.sm }]}>
        {options.map((opt) => {
          const active = isSelected(opt.value);
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.backgroundSecondary,
                  borderColor: active ? colors.primary : colors.border,
                  borderRadius: radius.full,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? '#FFFFFF' : colors.textSecondary,
                  fontSize: typography.size.xs,
                  fontWeight: active ? '700' : '600',
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text style={{ color: colors.error, fontSize: typography.size.xs, marginTop: spacing.xs }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  chip: {
    borderWidth: 1,
  },
});

export default ChipGroup;
