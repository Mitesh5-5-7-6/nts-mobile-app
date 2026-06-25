import { format, isToday, isYesterday, parseISO } from 'date-fns';

/**
 * Formatting helpers shared across screens.
 *
 * NOTE: We deliberately avoid `Number.prototype.toLocaleString('en-IN', …)`.
 * Hermes (the RN engine) ships a minimal Intl that does not reliably honour
 * locale-specific digit grouping, so we group manually for consistent output.
 */

/** Group an integer with the Indian numbering system, e.g. 1234567 -> "12,34,567". */
const groupIndian = (value: number): string => {
  const negative = value < 0;
  const digits = Math.abs(Math.round(value)).toString();
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest
    ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${lastThree}`
    : lastThree;
  return `${negative ? '-' : ''}${grouped}`;
};

const safeNumber = (value: number | null | undefined): number =>
  Number.isFinite(value as number) ? (value as number) : 0;

/** Plain number with Indian grouping, e.g. 1234 -> "1,234". */
export const formatNumber = (value: number | null | undefined): string =>
  groupIndian(safeNumber(value));

/** Indian Rupees, no decimals, e.g. 34500 -> "₹34,500". */
export const formatCurrency = (value: number | null | undefined): string =>
  `₹${groupIndian(safeNumber(value))}`;

/** Compact currency for dense cards/charts, e.g. 40300 -> "₹40.3k", 1500000 -> "₹15.0L". */
export const formatCompactCurrency = (value: number | null | undefined): string => {
  const n = safeNumber(value);
  const abs = Math.abs(n);
  if (abs >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
};

/** Signed percentage, e.g. 6.7 -> "+6.7%", -4.3 -> "-4.3%". */
export const formatPercent = (value: number | null | undefined): string => {
  const n = safeNumber(value);
  return `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
};

/** A positive/zero delta is treated as an "up" (good) trend. */
export const isPositiveTrend = (value: number | null | undefined): boolean =>
  safeNumber(value) >= 0;

const toDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  const date = typeof value === 'string' ? parseISO(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Local calendar date for API params (no timezone shift), e.g. "2026-06-24". */
export const toApiDate = (date: Date): string => format(date, 'yyyy-MM-dd');

/** "Today" / "Yesterday" / "24 Jun 2026" from an ISO string or Date. */
export const formatFriendlyDate = (value: string | Date | null | undefined): string => {
  const date = toDate(value);
  if (!date) return typeof value === 'string' ? value ?? '' : '';
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd MMM yyyy');
};

/** Short date label, e.g. "24 Jun". */
export const formatShortDate = (value: string | Date | null | undefined): string => {
  const date = toDate(value);
  if (!date) return typeof value === 'string' ? value ?? '' : '';
  return format(date, 'dd MMM');
};

/** Two-letter initials from a name, e.g. "Rohan Verma" -> "RV". */
export const getInitials = (name: string | null | undefined): string =>
  (name ?? '')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase();
