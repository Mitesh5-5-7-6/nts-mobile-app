import { SearchInput } from '@/components/ui/Input';
import { useAppTheme } from '@/theme';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export type EntryFilter = 'all' | 'pending' | 'paid' | 'holiday';

const FILTERS: { key: EntryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'holiday', label: 'Holiday' },
];

interface EntryFiltersProps {
  search: string;
  onSearch: (text: string) => void;
  filter: EntryFilter;
  onFilter: (filter: EntryFilter) => void;
}

export const EntryFilters = React.memo(({ search, onSearch, filter, onFilter }: EntryFiltersProps) => {
  const { colors, spacing, radius, typography } = useAppTheme();

  return (
    <View style={{ paddingHorizontal: spacing.lg }}>
      <SearchInput value={search} onChangeText={onSearch} placeholder="Search customer" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.sm }}
      >
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Pressable
              key={f.key}
              onPress={() => onFilter(f.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.backgroundSecondary,
                  borderColor: active ? colors.primary : colors.border,
                  borderRadius: radius.full,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text
                style={{
                  color: active ? '#FFFFFF' : colors.textSecondary,
                  fontSize: typography.size.sm,
                  fontWeight: active ? '700' : '500',
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
});

EntryFilters.displayName = 'EntryFilters';
export default EntryFilters;
