import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { DateField } from '@/components/ui/DateField';
import { NumberInput, TextInput, Textarea } from '@/components/ui/Input';
import { BottomSheet } from '@/components/ui/Modal';
import {
  EXPENSE_CATEGORIES,
  EXPENSE_PAYMENT_METHODS,
  EXPENSE_STATUSES,
} from '@/constants/finance';
import { useCreateExpense, useUpdateExpense } from '@/hooks/api/useExpenses';
import type { ApiErrorResponse } from '@/lib/api-error';
import { useAppTheme } from '@/theme';
import type {
  CreateExpensePayload,
  Expense,
  ExpenseCategory,
  ExpensePaymentMethod,
  ExpenseStatusValue,
} from '@/types/api.types';
import { toApiDate } from '@/utils/format';
import { parseISO } from 'date-fns';
import React, { useState } from 'react';
import { Text } from 'react-native';

interface ExpenseFormSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Pass an expense to edit; omit to create. */
  expense?: Expense;
}

interface FormState {
  title: string;
  amount: number;
  categories: ExpenseCategory[];
  date: Date;
  method: ExpensePaymentMethod;
  status: ExpenseStatusValue;
  vendor_name: string;
  invoice_number: string;
  notes: string;
}

const initialForm = (expense?: Expense): FormState => ({
  title: expense?.title ?? '',
  amount: expense?.amount ?? 0,
  categories: expense?.expense_category ?? [],
  date: expense?.expense_date ? parseISO(expense.expense_date) : new Date(),
  method: expense?.payment_method ?? 'cash',
  status: expense?.expense_status ?? 'PAID',
  vendor_name: expense?.vendor_name ?? '',
  invoice_number: expense?.invoice_number ?? '',
  notes: expense?.notes ?? '',
});

export const ExpenseFormSheet = React.memo(({ visible, onClose, expense }: ExpenseFormSheetProps) => {
  const { colors, spacing, typography } = useAppTheme();
  const isEdit = !!expense;

  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const submitting = createMutation.isPending || updateMutation.isPending;

  const [form, setForm] = useState<FormState>(() => initialForm(expense));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleCategory = (value: ExpenseCategory) =>
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(value)
        ? prev.categories.filter((c) => c !== value)
        : [...prev.categories, value],
    }));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const title = form.title.trim();
    if (title.length < 2 || title.length > 100) next.title = 'Title must be 2–100 characters';
    if (!(form.amount > 0)) next.amount = 'Enter an amount greater than zero';
    if (form.categories.length < 1) next.categories = 'Select at least one category';
    if (form.vendor_name.trim().length > 100) next.vendor_name = 'Vendor name too long';
    if (form.notes.trim().length > 500) next.notes = 'Notes must be 500 characters or fewer';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const applyServerError = (e: unknown) => {
    const err = e as ApiErrorResponse;
    const next: Record<string, string> = {};
    if (err?.details) {
      for (const [key, messages] of Object.entries(err.details)) {
        const field = key.replace('expense_', '').replace('_category', 'categories');
        if (messages?.length) next[field] = messages[0];
      }
    }
    setErrors(next);
    setServerError(err?.message ?? 'Something went wrong. Please try again.');
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setServerError(null);

    const payload: CreateExpensePayload = {
      title: form.title.trim(),
      amount: form.amount,
      expense_category: form.categories,
      expense_date: toApiDate(form.date),
      payment_method: form.method,
      expense_status: form.status,
      vendor_name: form.vendor_name.trim() || undefined,
      invoice_number: form.invoice_number.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    try {
      if (expense) {
        await updateMutation.mutateAsync({ id: expense._id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (e) {
      applyServerError(e);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={isEdit ? 'Edit Expense' : 'Log Expense'} maxHeight="92%">
      <TextInput
        label="Title"
        placeholder="e.g. Weekly vegetables"
        value={form.title}
        onChangeText={(t) => set('title', t)}
        error={errors.title}
        autoCapitalize="sentences"
      />

      <NumberInput
        label="Amount (₹)"
        value={form.amount ? String(form.amount) : ''}
        onChangeNumber={(n) => set('amount', n)}
        min={0}
        error={errors.amount}
      />

      <ChipGroup<ExpenseCategory>
        label="Category"
        options={EXPENSE_CATEGORIES}
        selected={form.categories}
        onChange={toggleCategory}
        error={errors.categories}
      />

      <DateField label="Date" value={form.date} onChange={(d) => set('date', d)} />

      <ChipGroup<ExpensePaymentMethod>
        label="Payment method"
        options={EXPENSE_PAYMENT_METHODS}
        selected={form.method}
        onChange={(m) => set('method', m)}
      />

      <ChipGroup<ExpenseStatusValue>
        label="Status"
        options={EXPENSE_STATUSES}
        selected={form.status}
        onChange={(s) => set('status', s)}
      />

      <TextInput
        label="Vendor (optional)"
        placeholder="Supplier or shop name"
        value={form.vendor_name}
        onChangeText={(t) => set('vendor_name', t)}
        error={errors.vendor_name}
      />

      <TextInput
        label="Invoice number (optional)"
        placeholder="Bill / invoice reference"
        value={form.invoice_number}
        onChangeText={(t) => set('invoice_number', t)}
      />

      <Textarea
        label="Notes (optional)"
        placeholder="Any remarks"
        value={form.notes}
        onChangeText={(t) => set('notes', t)}
        error={errors.notes}
      />

      {serverError ? (
        <Text style={{ color: colors.error, fontSize: typography.size.sm, marginBottom: spacing.md }}>
          {serverError}
        </Text>
      ) : null}

      <Button
        title={isEdit ? 'Save Changes' : 'Add Expense'}
        onPress={handleSubmit}
        loading={submitting}
        size="lg"
        style={{ marginTop: spacing.xs }}
      />
    </BottomSheet>
  );
});

ExpenseFormSheet.displayName = 'ExpenseFormSheet';
export default ExpenseFormSheet;
