import { ExpenseCard } from '@/components/ui/Card';
import { categoryLabel } from '@/constants/finance';
import type { Expense } from '@/types/api.types';
import { formatFriendlyDate } from '@/utils/format';
import React, { useCallback } from 'react';

interface ExpenseListItemProps {
  expense: Expense;
  onPress: (expense: Expense) => void;
}

export const ExpenseListItem = React.memo(({ expense, onPress }: ExpenseListItemProps) => {
  const handlePress = useCallback(() => onPress(expense), [expense, onPress]);

  const primaryCategory = expense.expense_category?.[0]
    ? categoryLabel(expense.expense_category[0])
    : 'Expense';
  const description = expense.vendor_name
    ? `${primaryCategory} · ${expense.vendor_name}`
    : primaryCategory;

  return (
    <ExpenseCard
      category={expense.title}
      description={description}
      amount={expense.amount}
      date={formatFriendlyDate(expense.expense_date)}
      onPress={handlePress}
      style={{ marginBottom: 10 }}
    />
  );
});

ExpenseListItem.displayName = 'ExpenseListItem';
export default ExpenseListItem;
