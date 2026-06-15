export type PaymentMethod = "cash" | "upi" | "bank_transfer";
export type PaymentFor = "MORNING" | "EVENING" | "FULL_DAY";
export type PaymentStatus = "pending" | "partial" | "completed" | "advance";
export type PaymentParams = "PAID" | "PARTIAL" | "PENDING" | "ADVANCE";

export type RecurringType = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type ExpenseStatus = "PENDING" | "PAID" | "PARTIAL" | "CANCELLED";
