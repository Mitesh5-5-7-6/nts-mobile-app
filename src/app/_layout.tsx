import '../global.css';
import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider, Stack, useRouter, useSegments } from 'expo-router';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemeProvider as AppThemeProvider, useAppTheme } from '@/theme';

import { QueryProvider } from '../lib/query/query-config';
import { useAuthStore } from '../store/auth.store';
import { setupInterceptors } from '../services/api/interceptors';
import { NetworkService } from '../services/offline/network';
import { useSessionLock } from '../hooks/useSessionLock';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Monitoring, Analytics, Notifications
import { initializeSentry } from '../services/monitoring/sentry';
import { performanceMonitor } from '../services/monitoring/performance';
import { ErrorBoundary } from '../components/system/ErrorBoundary';
import * as Sentry from '@sentry/react-native';
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
  const { isLocked, retryUnlock } = useSessionLock();

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
