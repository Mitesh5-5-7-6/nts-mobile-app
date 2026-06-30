import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemeProvider as AppThemeProvider, useAppTheme } from '@/theme';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import '../global.css';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSessionLock } from '../hooks/useSessionLock';
import { QueryProvider } from '../lib/query/query-config';
import { setupInterceptors } from '../services/api/interceptors';
import { NetworkService } from '../services/offline/network';
import { useAuthStore } from '../store/auth.store';

// Monitoring, Analytics, Notifications
import * as Sentry from '@sentry/react-native';
import { ErrorBoundary } from '../components/system/ErrorBoundary';
import { performanceMonitor } from '../services/monitoring/performance';
import { initializeSentry } from '../services/monitoring/sentry';
import { notificationService } from '../services/notifications/notification.service';
import { versionService } from '../services/version/version.service';

// 1. Initialize Sentry as early as possible
initializeSentry();

function LockOverlay({ onUnlock }: { onUnlock: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', zIndex: 9999 }]}>
      <Text style={{ color: colors.text, fontSize: 24, marginBottom: 20 }}>App Locked</Text>
      <TouchableOpacity onPress={onUnlock} style={{ padding: 16, backgroundColor: colors.primary, borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontSize: 16 }}>Unlock</Text>
      </TouchableOpacity>
    </View>
  );
}

function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AppThemeProvider>
          <LayoutContent />
        </AppThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

// Wrap root layout with Sentry
export default Sentry.wrap(RootLayout);

function LayoutContent() {
  const { isDark } = useAppTheme();
  const segments = useSegments();
  const router = useRouter();

  const { isAuthenticated, isHydrated, hydrate } = useAuthStore();
  const { isLocked, retryUnlock } = useSessionLock(isAuthenticated);

  useEffect(() => {
    performanceMonitor.startMark('AppStartup');

    // 1. Initialize things
    setupInterceptors();
    NetworkService.initialize();

    // Check App Version for Force Updates
    versionService.checkAppVersion();

    // Initialize Push Notifications
    notificationService.initialize();

    // 2. Hydrate Auth Store
    hydrate();

    return () => {
      NetworkService.teardown();
    };
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) return;

    performanceMonitor.endMark('AppStartup');

    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isHydrated, segments, router]);

  if (!isHydrated) {
    return (
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="daily-entry" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="expenses" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(system)/update" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      </Stack>
      {isLocked && <LockOverlay onUnlock={retryUnlock} />}
    </ThemeProvider>
  );
}
