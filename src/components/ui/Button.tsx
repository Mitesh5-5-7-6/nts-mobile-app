import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useAppTheme } from '@/theme';
import AppIcon, { IconNameType } from './AppIcon';

export type ButtonVariantType = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSizeType = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariantType;
  size?: ButtonSizeType;
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: IconNameType;
  iconRight?: IconNameType;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button = React.memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  style,
  textStyle,
}: ButtonProps) => {
  const { colors, spacing, radius, typography } = useAppTheme();

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  // 1. Resolve Background & Border Colors based on Variant & Theme
  const getButtonStyles = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    };

    switch (variant) {
      case 'primary':
        return {
          ...base,
          backgroundColor: disabled ? colors.neutral[200] : colors.primary,
        };
      case 'secondary':
        return {
          ...base,
          backgroundColor: disabled ? colors.neutral[200] : colors.secondary,
        };
      case 'outline':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: disabled ? colors.neutral[300] : colors.primary,
        };
      case 'ghost':
        return {
          ...base,
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          ...base,
          backgroundColor: disabled ? colors.neutral[200] : colors.error,
        };
      default:
        return base;
    }
  };

  // 2. Resolve Text & Icon Colors based on Variant
  const getTextColor = (): string => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return colors.text;
    }
  };

  // 3. Resolve Padding & Height based on Size
  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          height: 36,
          paddingHorizontal: spacing.md,
          borderRadius: radius.sm,
          gap: spacing.xs,
        };
      case 'lg':
        return {
          height: 54,
          paddingHorizontal: spacing.xxl,
          borderRadius: radius.lg,
          gap: spacing.md,
        };
      case 'md':
      default:
        return {
          height: 46,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          gap: spacing.sm,
        };
    }
  };

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case 'sm':
        return {
          fontSize: typography.size.xs,
          fontFamily: typography.family.rounded,
          fontWeight: typography.weight.medium,
        };
      case 'lg':
        return {
          fontSize: typography.size.base,
          fontFamily: typography.family.rounded,
          fontWeight: typography.weight.bold,
        };
      case 'md':
      default:
        return {
          fontSize: typography.size.sm,
          fontFamily: typography.family.rounded,
          fontWeight: typography.weight.semibold,
        };
    }
  };

  const textColor = getTextColor();

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [
        styles.buttonBase,
        getButtonStyles(),
        getSizeStyles(),
        pressed && !disabled && !loading && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {iconLeft && (
            <AppIcon name={iconLeft} size={size === 'sm' ? 16 : 20} color={textColor} />
          )}
          <Text style={[styles.textBase, getTextSizeStyle(), { color: textColor }, textStyle]}>
            {title}
          </Text>
          {iconRight && (
            <AppIcon name={iconRight} size={size === 'sm' ? 16 : 20} color={textColor} />
          )}
        </>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  buttonBase: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
  textBase: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

Button.displayName = 'Button';
export default Button;
