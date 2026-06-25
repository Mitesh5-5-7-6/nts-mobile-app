// Event Constants
export const AnalyticsEventNames = {
  // Auth Events
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  BIOMETRIC_UNLOCK: 'biometric_unlock',
  LOGOUT: 'logout',

  // Dashboard Events
  DASHBOARD_OPENED: 'dashboard_opened',
  DASHBOARD_REFRESHED: 'dashboard_refreshed',

  // Customer Events
  CUSTOMER_CREATED: 'customer_created',
  CUSTOMER_UPDATED: 'customer_updated',
  CUSTOMER_DELETED: 'customer_deleted',
  CUSTOMER_VIEWED: 'customer_viewed',

  // Core Business Events
  DAILY_ENTRY_SAVED: 'daily_entry_saved',
  TIFFIN_ENTRY_UPDATED: 'tiffin_entry_updated',
  COPY_PREVIOUS_DAY: 'copy_previous_day',
  OFFLINE_SYNC_COMPLETED: 'offline_sync_completed',
  PAYMENT_RECORDED: 'payment_recorded',
  EXPENSE_ADDED: 'expense_added',

  // Report & System Events
  REPORT_VIEWED: 'report_viewed',
  MONTH_CLOSED: 'month_closed',
  YEAR_CLOSED: 'year_closed',
  SETTINGS_UPDATED: 'settings_updated',

  // Error & System Events
  APP_ERROR: 'app_error',
  API_ERROR: 'api_error',
} as const;

export type AnalyticsEventName = typeof AnalyticsEventNames[keyof typeof AnalyticsEventNames];

export const ScreenNames = {
  DASHBOARD: 'Dashboard',
  CUSTOMERS: 'Customers',
  DAILY_ENTRY: 'Daily_Entry',
  PAYMENTS: 'Payments',
  EXPENSES: 'Expenses',
  REPORTS: 'Reports',
  NOTIFICATIONS: 'Notifications',
  SETTINGS: 'Settings',
  PROFILE: 'Profile',
} as const;

export type ScreenName = typeof ScreenNames[keyof typeof ScreenNames];
