import { useAppTheme } from '@/theme';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from './AppIcon';

// 1. PAGE CONTAINER (Standard background & wrapper, manages scrollability)
export interface PageContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const PageContainer = React.memo(({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
}: PageContainerProps) => {
  const { colors, spacing } = useAppTheme();

  const containerStyle = [
    styles.pageContainer,
    { backgroundColor: colors.background },
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView
        style={containerStyle}
        contentContainerStyle={[
          { paddingBottom: spacing.giant * 2 },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{children}</View>;
});

// 2. SAFE AREA CONTAINER (Notch/status bar inset management)
export interface SafeAreaContainerProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: StyleProp<ViewStyle>;
}

export const SafeAreaContainer = React.memo(({
  children,
  edges = ['top', 'left', 'right'],
  style,
}: SafeAreaContainerProps) => {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safeArea, { backgroundColor: colors.background }, style]}
    >
      {children}
    </SafeAreaView>
  );
});

// 3. CONTENT WRAPPER (Consistent side gutters alignment)
export const ContentWrapper = React.memo(({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => {
  const { spacing } = useAppTheme();
  return (
    <View style={[styles.contentWrapper, { paddingHorizontal: spacing.lg }, style]}>
      {children}
    </View>
  );
});

// 4. SECTION HEADER (Header block for sections with action button)
export interface SectionHeaderProps {
  title: string;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const SectionHeader = React.memo(({
  title,
  actionTitle,
  onActionPress,
  style,
}: SectionHeaderProps) => {
  const { colors, spacing, typography } = useAppTheme();
  return (
    <View style={[styles.rowBetween, { marginVertical: spacing.md }, style]}>
      <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.size.base, fontFamily: typography.family.rounded }]}>
        {title}
      </Text>
      {actionTitle && onActionPress && (
        <Pressable onPress={onActionPress} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={[styles.actionText, { color: colors.primary, fontSize: typography.size.sm }]}>
            {actionTitle}
          </Text>
        </Pressable>
      )}
    </View>
  );
});

// 5. PAGE HEADER (Main header for root/tabs level screens)
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const PageHeader = React.memo(({
  title,
  subtitle,
  rightAction,
  style,
}: PageHeaderProps) => {
  const { colors, spacing, typography } = useAppTheme();
  return (
    <View style={[styles.pageHeader, { borderBottomColor: colors.border, paddingVertical: spacing.md, marginBottom: spacing.md }, style]}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.pageTitle, { color: colors.text, fontSize: typography.size.xxl, fontFamily: typography.family.rounded }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.pageSubtitle, { color: colors.textSecondary, fontSize: typography.size.sm, marginTop: spacing.xxs }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
    </View>
  );
});

// 6. SCREEN HEADER (Back button navigation bar)
export interface ScreenHeaderProps {
  title: string;
  onBackPress: () => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const ScreenHeader = React.memo(({
  title,
  onBackPress,
  rightAction,
  style,
}: ScreenHeaderProps) => {
  const { colors, spacing, typography } = useAppTheme();
  return (
    <View style={[styles.screenHeader, { borderBottomColor: colors.border, paddingVertical: spacing.sm }, style]}>
      <Pressable onPress={onBackPress} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <AppIcon name="chevron-left" size={24} color={colors.text} />
      </Pressable>
      <Text numberOfLines={1} style={[styles.screenTitle, { color: colors.text, fontSize: typography.size.md, fontFamily: typography.family.rounded }]}>
        {title}
      </Text>
      {rightAction ? (
        <View style={styles.rightAction}>{rightAction}</View>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
});

// 7. STICKY HEADER (Locks during scroll)
export const StickyHeader = React.memo(({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.stickyHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }, style]}>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    alignSelf: 'stretch',
  },
  safeArea: {
    flex: 1,
  },
  contentWrapper: {
    alignSelf: 'stretch',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  sectionTitle: {
    fontWeight: '700',
  },
  actionText: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  pageHeader: {
    alignSelf: 'stretch',
    borderBottomWidth: 0.5,
  },
  pageTitle: {
    fontWeight: '800',
  },
  pageSubtitle: {
    fontWeight: '400',
  },
  rightAction: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    alignSelf: 'stretch',
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  placeholder: {
    width: 40,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 0.5,
  },
});

PageContainer.displayName = 'PageContainer';
SafeAreaContainer.displayName = 'SafeAreaContainer';
ContentWrapper.displayName = 'ContentWrapper';
SectionHeader.displayName = 'SectionHeader';
PageHeader.displayName = 'PageHeader';
ScreenHeader.displayName = 'ScreenHeader';
StickyHeader.displayName = 'StickyHeader';

export default PageContainer;
