import { useAppTheme } from '@/theme';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import AppIcon, { IconNameType } from '../ui/AppIcon';
import { Button } from '../ui/Button';
import { BottomSheet } from '../ui/Modal';

// Mapping route names to display labels and semantic icons
const TAB_CONFIG: Record<string, { label: string; icon: IconNameType }> = {
  index: { label: 'Dashboard', icon: 'dashboard' },
  customers: { label: 'Customers', icon: 'customers' },
  add: { label: 'Quick Add', icon: 'add' },
  payments: { label: 'Payments', icon: 'payments' },
  more: { label: 'More', icon: 'more' },
};

type CustomTabBarProps = Parameters<
  NonNullable<React.ComponentProps['tabBar']>>

export const CustomTabBar = React.memo((props: CustomTabBarProps) => {
  const { state, descriptors, navigation } = props;

  const { colors, spacing, radius, shadows, typography } = useAppTheme();
  const { width } = useWindowDimensions();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Responsive padding/margins
  const isTablet = width >= 768;
  const barWidth = isTablet ? 500 : '100%';
  const alignSelf = isTablet ? 'center' : 'stretch';
  const bottomInset = Platform.OS === 'ios' ? 24 : 12;

  return (
    <View
      style={[
        styles.outerContainer,
        {
          paddingBottom: bottomInset,
          alignSelf,
          width: barWidth,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.tabBarContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: isTablet ? radius.full : radius.xl,
            ...shadows.lg,
          },
        ]}
      >
        {state.routes.map((route: { key: string; name: string; params?: any }, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] || { label: route.name, icon: 'info' };

          // Render a special styled center Add button
          const isAddTab = route.name === 'add';

          const onPress = () => {
            if (isAddTab) {
              // Intercept Quick Add to open bottom sheet
              setIsQuickAddOpen(true);
              return;
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={`tab-${route.name}`}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.tabButton,
                pressed && styles.pressed,
                isAddTab && styles.addTabButton,
              ]}
            >
              {isAddTab ? (
                <View
                  style={[
                    styles.addButtonCircle,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: radius.full,
                      ...shadows.md,
                    },
                  ]}
                >
                  <AppIcon name="plus" size={24} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.iconLabelContainer}>
                  <AppIcon
                    name={config.icon}
                    size={22}
                    color={isFocused ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isFocused ? colors.primary : colors.textMuted,
                        fontSize: 10,
                        fontWeight: isFocused ? '700' : '500',
                        fontFamily: typography.family.display,
                      },
                    ]}
                  >
                    {config.label}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Embedded Self-Contained Quick Add Bottom Sheet */}
      <BottomSheet
        visible={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title="Quick Actions"
      >
        <View style={styles.sheetActionsContainer}>
          <Text style={[styles.sheetSubtitle, { color: colors.textSecondary, marginBottom: spacing.md, fontSize: typography.size.sm }]}>
            Choose a quick business action to perform:
          </Text>
          <Button
            title="Add New Customer"
            iconLeft="user"
            onPress={() => {
              setIsQuickAddOpen(false);
              navigation.navigate('customers');
            }}
            variant="outline"
            style={styles.sheetButton}
          />
          <Button
            title="Record Customer Payment"
            iconLeft="payments"
            onPress={() => {
              setIsQuickAddOpen(false);
              navigation.navigate('payments');
            }}
            variant="outline"
            style={styles.sheetButton}
          />
          <Button
            title="Log Expense"
            iconLeft="expense"
            onPress={() => {
              setIsQuickAddOpen(false);
              navigation.navigate('more');
            }}
            variant="outline"
            style={styles.sheetButton}
          />
        </View>
      </BottomSheet>
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 800,
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: 60,
    marginHorizontal: 12,
    borderWidth: 1.5,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  addTabButton: {
    top: -16, // Elevate the add button
    height: 64,
  },
  addButtonCircle: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    marginTop: 2,
  },
  pressed: {
    opacity: 0.8,
  },
  sheetActionsContainer: {
    width: '100%',
  },
  sheetSubtitle: {
    textAlign: 'center',
  },
  sheetButton: {
    marginBottom: 12,
    justifyContent: 'flex-start',
    paddingLeft: 16,
  },
});

CustomTabBar.displayName = 'CustomTabBar';
export default CustomTabBar;
