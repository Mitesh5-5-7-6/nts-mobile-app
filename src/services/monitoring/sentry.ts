import * as Sentry from '@sentry/react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const initializeSentry = () => {
  if (__DEV__) {
    // Optionally don't initialize Sentry in development to avoid noise
    // return;
  }

  Sentry.init({
    // REPLACE THIS WITH YOUR ACTUAL SENTRY DSN
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production.
    tracesSampleRate: 1.0,
    
    // Add additional configuration as needed
  });

  // Set global tags and context
  Sentry.setTags({
    environment: __DEV__ ? 'development' : 'production',
    platform: Platform.OS,
    buildVersion: Application.nativeBuildVersion || 'unknown',
    appVersion: Application.nativeApplicationVersion || 'unknown',
    deviceName: Device.deviceName || 'unknown',
  });
};

export const setSentryUser = (userId: string, additionalData?: Record<string, any>) => {
  Sentry.setUser({
    id: userId,
    ...additionalData,
  });
};

export const clearSentryUser = () => {
  Sentry.setUser(null);
};
