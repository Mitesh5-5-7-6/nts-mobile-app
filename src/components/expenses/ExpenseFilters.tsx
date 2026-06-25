import { SearchInput } from '@/components/ui/Input';
import { ContentWrapper } from '@/components/ui/Layout';
import { EXPENSE_CATEGORIES } from '@/constants/finance';
import { useAppTheme } from '@/theme';
import type { ExpenseCategory } from '@/types/api.types';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

interface ExpenseFiltersProps {
  search: string;
  onSearch: (value: string) => void;
  category: ExpenseCategory | null;
  onCategory: (value: ExpenseCategory | null) => void;
}

const ALL_CHIP = { value: null as ExpenseCategory | null, label: 'All' };

export const ExpenseFilters = React.memo(
  ({ search, onSearch, category, onCategory }: ExpenseFiltersProps) => {
    const { colors, spacing, radius, typography } = useAppTheme();

    const chips = [ALL_CHIP, ...EXPENSE_CATEGORIES];

    return (
      <>
        <ContentWrapper>
          <SearchInput value={search} onChangeText={onSearch} placeholder="Search title, vendor, notes" />
        </ContentWrapper>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.row, { paddingHorizontal: spacing.lg, gap: spacing.sm }]}
        >
          {chips.map((chip) => {
            const active = category === chip.value;
            return (
              <Pressable
                key={chip.label}
                onPress={() => onCategory(chip.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.backgroundSecondary,
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: radius.full,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
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
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </>
    );
  },
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  chip: {
    borderWidth: 1,
  },
});

ExpenseFilters.displayName = 'ExpenseFilters';
export default ExpenseFilters;
