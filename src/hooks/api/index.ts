import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../constants/queryKeys';
import {
  authService,
  customerService,
  dailyEntryService,
  paymentService,
  expenseService,
  dashboardService,
  reportService,
  closingService,
  settingsService,
} from '../../sdk';
import type {
  GetCustomersParams,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  GetTiffinEntriesParams,
  BulkUpsertTiffinRequest,
  TiffinEntryPreviewParams,
  GetPaymentsParams,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  GenerateBillRequest,
  GetGroupedPaymentsParams,
  ToggleEntryStatusRequest,
  RecordNtsPaymentRequest,
  GetExpensesParams,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseStatsParams,
  GetVendorsParams,
  CreateVendorRequest,
  UpdateVendorRequest,
  DashboardV2Params,
  MonthlyReportParams,
  RestoreRequest,
} from '../../types/api';

// Stale times aligned to caching strategy (in ms)
const STALE = {
  dashboard: 5 * 60 * 1000,   // 5 min
  customers: 5 * 60 * 1000,   // 5 min
  dailyEntries: 2 * 60 * 1000, // 2 min
  payments: 2 * 60 * 1000,     // 2 min
  expenses: 2 * 60 * 1000,     // 2 min
  reports: 10 * 60 * 1000,     // 10 min
  settings: 30 * 60 * 1000,    // 30 min
} as const;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useSession() {
  return useQuery({
    queryKey: QUERY_KEYS.session,
    queryFn: () => authService.getSession(),
    staleTime: STALE.settings,
  });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.stats(),
    queryFn: () => dashboardService.getStats(),
    staleTime: STALE.dashboard,
  });
}

export function useDashboardV2Stats(params?: DashboardV2Params) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.v2Stats(params),
    queryFn: () => dashboardService.getV2Stats(params),
    staleTime: STALE.dashboard,
  });
}

export function useTiffinTrend() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.tiffinTrend(),
    queryFn: () => dashboardService.getTiffinTrend(),
    staleTime: STALE.dashboard,
  });
}

export function useRevenueExpense() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.revenueExpense(),
    queryFn: () => dashboardService.getRevenueExpense(),
    staleTime: STALE.dashboard,
  });
}

export function useExpenseCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.expenseCategories(),
    queryFn: () => dashboardService.getExpenseCategories(),
    staleTime: STALE.dashboard,
  });
}

export function useRecentTiffins() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.recentTiffins(),
    queryFn: () => dashboardService.getRecentTiffins(),
    staleTime: STALE.dashboard,
  });
}

export function useRecentExpenses() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.recentExpenses(),
    queryFn: () => dashboardService.getRecentExpenses(),
    staleTime: STALE.dashboard,
  });
}

export function usePendingPaymentsList() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.pendingPayments(),
    queryFn: () => dashboardService.getPendingPayments(),
    staleTime: STALE.dashboard,
  });
}

export function useTopCustomers() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.topCustomers(),
    queryFn: () => dashboardService.getTopCustomers(),
    staleTime: STALE.dashboard,
  });
}

export function useMonthSummary() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.monthSummary(),
    queryFn: () => dashboardService.getMonthSummary(),
    staleTime: STALE.dashboard,
  });
}

// ─── Customers ────────────────────────────────────────────────────────────────

export function useCustomers(params?: GetCustomersParams) {
  return useQuery({
    queryKey: QUERY_KEYS.customers.list(params),
    queryFn: () => customerService.getCustomers(params),
    staleTime: STALE.customers,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.customers.detail(id),
    queryFn: () => customerService.getCustomerById(id),
    staleTime: STALE.customers,
    enabled: !!id,
  });
}

export function useCustomerStats() {
  return useQuery({
    queryKey: QUERY_KEYS.customers.stats(),
    queryFn: () => customerService.getCustomerStats(),
    staleTime: STALE.customers,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.all });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      customerService.updateCustomer(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.detail(id) });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.all });
    },
  });
}

// ─── Daily Entries ────────────────────────────────────────────────────────────

export function useDailyEntries(params: GetTiffinEntriesParams) {
  return useQuery({
    queryKey: QUERY_KEYS.dailyEntries.byDate(params.date),
    queryFn: () => dailyEntryService.getDailyEntries(params),
    staleTime: STALE.dailyEntries,
    enabled: !!params.date,
  });
}

export function useDailyEntriesPreview(params: TiffinEntryPreviewParams) {
  return useQuery({
    queryKey: QUERY_KEYS.dailyEntries.preview(params),
    queryFn: () => dailyEntryService.getPreview(params),
    staleTime: STALE.dailyEntries,
    enabled: !!params.date,
  });
}

export function useBulkUpsertEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkUpsertTiffinRequest) => dailyEntryService.bulkUpsertEntries(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.dailyEntries.byDate(variables.entry_date),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
    },
  });
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export function usePayments(params?: GetPaymentsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.payments.list(params),
    queryFn: () => paymentService.getPayments(params),
    staleTime: STALE.payments,
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.payments.detail(id),
    queryFn: () => paymentService.getPaymentById(id),
    staleTime: STALE.payments,
    enabled: !!id,
  });
}

export function usePaymentStats() {
  return useQuery({
    queryKey: QUERY_KEYS.payments.stats(),
    queryFn: () => paymentService.getPaymentStats(),
    staleTime: STALE.payments,
  });
}

export function useCustomerPaymentSummary(customerId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.payments.customerSummary(customerId),
    queryFn: () => paymentService.getCustomerSummary(customerId),
    staleTime: STALE.payments,
    enabled: !!customerId,
  });
}

export function useGroupedPayments(params?: GetGroupedPaymentsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.payments.grouped(params),
    queryFn: () => paymentService.getGroupedPayments(params),
    staleTime: STALE.payments,
  });
}

export function useMonthlyReport(params?: MonthlyReportParams) {
  return useQuery({
    queryKey: QUERY_KEYS.payments.monthlyReport(params),
    queryFn: () => reportService.getMonthlyReport(params),
    staleTime: STALE.reports,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => paymentService.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentRequest }) =>
      paymentService.updatePayment(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.detail(id) });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentService.deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
    },
  });
}

export function useRecordNtsPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecordNtsPaymentRequest) => paymentService.recordNtsPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyEntries.all });
    },
  });
}

export function useToggleEntryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, data }: { entryId: string; data: ToggleEntryStatusRequest }) =>
      paymentService.toggleEntryStatus(entryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyEntries.all });
    },
  });
}

export function useGenerateBill() {
  return useMutation({
    mutationFn: (data: GenerateBillRequest) => paymentService.generateBill(data),
  });
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export function useExpenses(params?: GetExpensesParams) {
  return useQuery({
    queryKey: QUERY_KEYS.expenses.list(params),
    queryFn: () => expenseService.getExpenses(params),
    staleTime: STALE.expenses,
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.expenses.detail(id),
    queryFn: () => expenseService.getExpenseById(id),
    staleTime: STALE.expenses,
    enabled: !!id,
  });
}

export function useExpenseStats(params?: ExpenseStatsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.expenses.stats(params),
    queryFn: () => expenseService.getExpenseStats(params),
    staleTime: STALE.expenses,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => expenseService.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseRequest }) =>
      expenseService.updateExpense(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses.detail(id) });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
    },
  });
}

// ─── Vendors ──────────────────────────────────────────────────────────────────

export function useVendors(params?: GetVendorsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.vendors.list(params),
    queryFn: () => expenseService.getVendors(params),
    staleTime: STALE.settings,
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.vendors.detail(id),
    queryFn: () => expenseService.getVendorById(id),
    staleTime: STALE.settings,
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVendorRequest) => expenseService.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendors.all });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorRequest }) =>
      expenseService.updateVendor(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendors.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendors.detail(id) });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseService.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendors.all });
    },
  });
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function useUserProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.settings.profile(),
    queryFn: () => settingsService.getUserProfile(),
    staleTime: STALE.settings,
  });
}

// ─── Closing / Backup ─────────────────────────────────────────────────────────

export function useClosingMonthSummary() {
  return useQuery({
    queryKey: QUERY_KEYS.closing.monthSummary(),
    queryFn: () => closingService.getMonthSummary(),
    staleTime: STALE.reports,
  });
}

export function useRestoreBackup() {
  return useMutation({
    mutationFn: (data: RestoreRequest) => closingService.restoreBackup(data),
  });
}
