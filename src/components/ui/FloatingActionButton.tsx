import { useAppTheme } from '@/theme';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useDerivedValue,
  withTiming
} from 'react-native-reanimated';
import AppIcon, { IconNameType } from './AppIcon';

export interface FABAction {
  icon: IconNameType;
  label: string;
  onPress: () => void;
}

export interface FloatingActionButtonProps {
  icon?: IconNameType;
  badge?: number | string;
  actions?: FABAction[];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const FloatingActionButton = React.memo(({
  icon = 'plus',
  badge,
  actions,
  onPress,
  style,
}: FloatingActionButtonProps) => {
  const { colors, radius, typography, shadows } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Rotation value for main icon: 0 to 45 deg if actions present
  const isExpandable = actions && actions.length > 0;
  const rotation = useDerivedValue(() => {
    return withTiming(isOpen ? 45 : 0, { duration: 250 });
  });

  const animatedMainIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const handleMainPress = () => {
    if (isExpandable) {
      setIsOpen(!isOpen);
    } else {
      onPress?.();
    }
  };

  const handleSubPress = (actionPress: () => void) => {
    actionPress();
    setIsOpen(false);
  };

  return (
    <View style={styles.fabContainer} pointerEvents="box-none">
      {/* Backdrop for expanded states */}
      {isOpen && isExpandable && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
        >
          <Pressable style={styles.backdropPressable} onPress={() => setIsOpen(false)} />
        </Animated.View>
      )}

      {/* Sub-actions Speed Dial List */}
      {isOpen && isExpandable && (
        <View style={styles.actionsList} pointerEvents="box-none">
          {actions.map((act, idx) => (
            <Animated.View
              key={idx}
              entering={FadeIn.delay(idx * 40).duration(200)}
              exiting={FadeOut.duration(150)}
              style={styles.actionRow}
            >
              {/* Label */}
              <View style={[styles.actionLabel, { backgroundColor: colors.card, borderRadius: radius.sm, ...shadows.sm }]}>
                <Text style={{ color: colors.text, fontSize: typography.size.xs, fontWeight: '600' }}>
                  {act.label}
                </Text>
              </View>

              {/* Icon Button */}
              <Pressable
                onPress={() => handleSubPress(act.onPress)}
                style={({ pressed }) => [
                  styles.subFab,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: radius.full,
                    ...shadows.sm,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <AppIcon name={act.icon} size={18} color={colors.primary} />
              </Pressable>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Main Trigger Button */}
      <Pressable
        onPress={handleMainPress}
        style={({ pressed }) => [
          styles.mainFab,
          {
            backgroundColor: colors.primary,
            borderRadius: radius.full,
            ...shadows.md,
          },
          pressed && styles.pressedMain,
          style,
        ]}
      >
        <Animated.View style={animatedMainIconStyle}>
          <AppIcon name={isOpen && isExpandable ? 'plus' : icon} size={24} color="#FFFFFF" />
        </Animated.View>

        {/* Optional Badge */}
        {badge !== undefined && (
          <View style={[styles.badge, { backgroundColor: colors.error, borderColor: colors.background }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  fabContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 900,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 850,
  },
  backdropPressable: {
    flex: 1,
  },
  mainFab: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    marginBottom: Platform.select({ ios: 90, android: 110, web: 80 }), // Position above Bottom Tab Bar
    zIndex: 890,
  },
  subFab: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pressedMain: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  pressed: {
    opacity: 0.8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  actionsList: {
    marginRight: 27,
    marginBottom: Platform.select({ ios: 160, android: 180, web: 150 }), // Stack directly above primary FAB
    alignItems: 'flex-end',
    gap: 12,
    zIndex: 890,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionLabel: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 10,
  },
});

FloatingActionButton.displayName = 'FloatingActionButton';
export default FloatingActionButton;
