import { useAppTheme } from '@/theme';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  DimensionValue,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import AppIcon from './AppIcon';
import { Button } from './Button';

// 1. FULL-SCREEN APP LOADER
export interface AppLoaderProps {
  message?: string;
  overlay?: boolean;
}

export const AppLoader = React.memo(({ message = 'Loading...', overlay = true }: AppLoaderProps) => {
  const { colors, spacing, radius, typography } = useAppTheme();

  return (
    <View style={[overlay ? styles.loaderOverlay : styles.loaderInline, { backgroundColor: overlay ? 'rgba(0,0,0,0.4)' : 'transparent' }]}>
      <View style={[styles.loaderContent, { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.xl }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loaderText, { color: colors.text, fontSize: typography.size.sm, marginTop: spacing.md, fontFamily: typography.family.rounded }]}>
          {message}
        </Text>
      </View>
    </View>
  );
});

// 2. ANIMATED SKELETON (Pulsating Shimmer using Reanimated)
export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton = React.memo(({
  width = '100%',
  height = 20,
  borderRadius = 6,
  style,
}: SkeletonProps) => {
  const { colors } = useAppTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, {
        duration: 800,
        easing: Easing.bezier(0.4, 0.0, 0.6, 1),
      }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.backgroundSelected,
        },
        animatedStyle,
        style,
      ]}
    />
  );
});

// 3. EMPTY STATE (With action button and subtitle)
export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState = React.memo(({
  title = 'No Items Found',
  description = 'There is no data to display right now.',
  icon = 'info', // Fits "info" icon
  actionTitle,
  onActionPress,
  style,
}: EmptyStateProps) => {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <View style={[styles.centerContainer, spacing.xxl && { padding: spacing.xxl }, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <AppIcon name="info" size={40} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text, fontSize: typography.size.lg, marginBottom: spacing.sm }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xl }]}>
        {description}
      </Text>
      {actionTitle && onActionPress && (
        <Button title={actionTitle} onPress={onActionPress} size="md" variant="outline" style={{ minWidth: 150 }} />
      )}
    </View>
  );
});

// 4. ERROR STATE (With Retry Button)
export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ErrorState = React.memo(({
  message = 'An unexpected error occurred.',
  onRetry,
  style,
}: ErrorStateProps) => {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <View style={[styles.centerContainer, { padding: spacing.xxl }, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.errorLight }]}>
        <AppIcon name="alert" size={40} color={colors.error} />
      </View>
      <Text style={[styles.title, { color: colors.text, fontSize: typography.size.lg, marginBottom: spacing.sm }]}>
        Oops! Something went wrong
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xl }]}>
        {message}
      </Text>
      {onRetry && (
        <Button title="Retry" onPress={onRetry} size="md" variant="primary" style={{ minWidth: 120 }} />
      )}
    </View>
  );
});

// 5. SUCCESS STATE (Checkmark with details)
export interface SuccessStateProps {
  title?: string;
  description?: string;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const SuccessState = React.memo(({
  title = 'Success!',
  description = 'Your operation completed successfully.',
  actionTitle,
  onActionPress,
  style,
}: SuccessStateProps) => {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <View style={[styles.centerContainer, { padding: spacing.xxl }, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.successLight }]}>
        <AppIcon name="check" size={40} color={colors.success} />
      </View>
      <Text style={[styles.title, { color: colors.text, fontSize: typography.size.lg, marginBottom: spacing.sm }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xl }]}>
        {description}
      </Text>
      {actionTitle && onActionPress && (
        <Button title={actionTitle} onPress={onActionPress} size="md" variant="primary" style={{ minWidth: 150 }} />
      )}
    </View>
  );
});

// 6. NO DATA STATE (Simpler placeholder for lists)
export const NoDataState = React.memo(({ message = 'No entries' }: { message?: string }) => {
  const { colors, spacing, typography } = useAppTheme();
  return (
    <View style={[styles.inlineNoData, { padding: spacing.lg }]}>
      <AppIcon name="info" size={18} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
      <Text style={{ color: colors.textMuted, fontSize: typography.size.sm, fontFamily: typography.family.sans }}>
        {message}
      </Text>
    </View>
  );
});

// 7. OFFLINE STATE (Network status banner)
export const OfflineState = React.memo(() => {
  const { colors, spacing, typography } = useAppTheme();
  return (
    <View style={[styles.offlineBanner, { backgroundColor: colors.error }]}>
      <AppIcon name="wifi-off" size={14} color="#FFFFFF" style={{ marginRight: spacing.xs }} />
      <Text style={[styles.offlineText, { fontSize: typography.size.xs, fontFamily: typography.family.sans }]}>
        No internet connection. Displaying cached offline data.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loaderInline: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  loaderText: {
    fontWeight: '600',
  },
  skeleton: {
    overflow: 'hidden',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    flex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inlineNoData: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'stretch',
  },
  offlineText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

AppLoader.displayName = 'AppLoader';
Skeleton.displayName = 'Skeleton';
EmptyState.displayName = 'EmptyState';
ErrorState.displayName = 'ErrorState';
SuccessState.displayName = 'SuccessState';
NoDataState.displayName = 'NoDataState';
OfflineState.displayName = 'OfflineState';

export default EmptyState;
