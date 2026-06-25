import type {
  ExpenseCategory,
  ExpensePaymentMethod,
  ExpenseStatusValue,
  GroupedEntryStatus,
  PaymentMethod,
} from '@/types/api.types';

// ─── Payment methods ────────────────────────────────────────────────────────

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
];

export const EXPENSE_PAYMENT_METHODS: { value: ExpensePaymentMethod; label: string }[] = [
  ...PAYMENT_METHODS,
  { value: 'credit', label: 'Credit' },
];

export const paymentMethodLabel = (method: string): string =>
  EXPENSE_PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;

// ─── Grouped payment entry status ───────────────────────────────────────────
// Maps a status to a semantic theme colour key.

export const GROUPED_STATUS_COLOR: Record<GroupedEntryStatus, 'success' | 'warning' | 'info'> = {
  PAID: 'success',
  PENDING: 'warning',
  PARTIAL: 'info',
};

export const GROUPED_STATUS_LABEL: Record<GroupedEntryStatus, string> = {
  PAID: 'Paid',
  PENDING: 'Pending',
  PARTIAL: 'Partial',
};

// ─── Expense categories ─────────────────────────────────────────────────────

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'RAW_MATERIAL', label: 'Raw Material' },
  { value: 'VEGETABLES', label: 'Vegetables' },
  { value: 'MILK', label: 'Milk' },
  { value: 'GAS', label: 'Gas' },
  { value: 'SALARY', label: 'Salary' },
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'RENT', label: 'Rent' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'INTERNET', label: 'Internet' },
  { value: 'PACKAGING', label: 'Packaging' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'MISC', label: 'Miscellaneous' },
];

const CATEGORY_LABEL_MAP: Record<string, string> = EXPENSE_CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.value]: c.label }),
  {},
);

/** Human label for a category enum value, e.g. "RAW_MATERIAL" -> "Raw Material". */
export const categoryLabel = (value: string): string =>
  CATEGORY_LABEL_MAP[value] ??
  value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

export const EXPENSE_STATUSES: { value: ExpenseStatusValue; label: string }[] = [
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const EXPENSE_STATUS_COLOR: Record<ExpenseStatusValue, 'success' | 'warning' | 'info' | 'error'> = {
  PAID: 'success',
  PENDING: 'warning',
  PARTIAL: 'info',
  CANCELLED: 'error',
};
