import { useAppTheme } from '@/theme';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppIcon, { IconNameType } from './AppIcon';

// Common Props for all Inputs
interface BaseInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: IconNameType;
  iconRight?: IconNameType;
  onIconRightPress?: () => void;
}

export type TextInputProps = RNTextInputProps & BaseInputProps;

// 1. STANDARD TEXT INPUT
export const TextInput = React.memo(({
  label,
  error,
  helperText,
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  onIconRightPress,
  style,
  onFocus,
  onBlur,
  ...rest
}: TextInputProps) => {
  const { colors, spacing, radius, typography } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.backgroundSecondary;
    return colors.background;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.size.sm, fontFamily: typography.family.rounded }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        {iconLeft && !loading && (
          <AppIcon name={iconLeft} size={20} color={colors.textMuted} style={styles.iconLeft} />
        )}
        {loading && (
          <ActivityIndicator size="small" color={colors.primary} style={styles.iconLeft} />
        )}
        <RNTextInput
          style={[
            styles.textInput,
            {
              color: disabled ? colors.textMuted : colors.text,
              fontSize: typography.size.base,
              fontFamily: typography.family.sans,
            },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          editable={!disabled}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {iconRight && (
          <Pressable onPress={onIconRightPress} disabled={disabled || !onIconRightPress}>
            <AppIcon name={iconRight} size={20} color={colors.textMuted} style={styles.iconRight} />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text style={[styles.errorText, { color: colors.error, fontSize: typography.size.xs }]}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.helperText, { color: colors.textMuted, fontSize: typography.size.xs }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});

// 2. NUMBER INPUT (Numeric keypad with increment/decrement buttons)
export interface NumberInputProps extends Omit<TextInputProps, 'onChangeText'> {
  value?: string;
  onChangeNumber?: (val: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

export const NumberInput = React.memo(({
  value = '',
  onChangeNumber,
  step = 1,
  min,
  max,
  ...rest
}: NumberInputProps) => {
  const { spacing } = useAppTheme();

  const handleIncrement = () => {
    const current = parseFloat(value) || 0;
    const next = current + step;
    if (max !== undefined && next > max) return;
    onChangeNumber?.(next);
  };

  // const handleDecrement = () => {
  //   const current = parseFloat(value) || 0;
  //   const next = current - step;
  //   if (min !== undefined && next < min) return;
  //   onChangeNumber?.(next);
  // };

  return (
    <TextInput
      value={value}
      keyboardType="numeric"
      onChangeText={(text) => {
        const cleaned = text.replace(/[^0-9.-]/g, '');
        const num = parseFloat(cleaned);
        onChangeNumber?.(isNaN(num) ? 0 : num);
      }}
      iconRight="plus"
      onIconRightPress={handleIncrement}
      style={{ paddingRight: spacing.giant }}
      {...rest}
    />
  );
});

// 3. SEARCH INPUT (Magnifying glass, with a quick-clear button when filled)
export const SearchInput = React.memo(({
  value = '',
  onChangeText,
  ...rest
}: TextInputProps) => {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      iconLeft="search"
      iconRight={value.length > 0 ? 'close' : undefined}
      onIconRightPress={value.length > 0 ? () => onChangeText?.('') : undefined}
      placeholder="Search..."
      {...rest}
    />
  );
});

// 4. PASSWORD INPUT (Toggles secure entry)
export const PasswordInput = React.memo((props: TextInputProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <TextInput
      secureTextEntry={!visible}
      iconLeft="lock"
      iconRight={visible ? 'eye-off' : 'eye'}
      onIconRightPress={() => setVisible(!visible)}
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
    />
  );
});

// 5. CURRENCY INPUT (Prepends currency symbol)
export interface CurrencyInputProps extends TextInputProps {
  currencySymbol?: string;
}

export const CurrencyInput = React.memo(({
  currencySymbol = '₹',
  ...rest
}: CurrencyInputProps) => {
  const { spacing } = useAppTheme();
  return (
    <TextInput
      keyboardType="decimal-pad"
      iconLeft="dollar" // Placeholder representing money
      style={{ paddingLeft: spacing.xs }}
      {...rest}
    />
  );
});

// 6. DATE INPUT (Tap to trigger a date selector)
export interface DateInputProps extends Omit<TextInputProps, 'value'> {
  value?: Date;
  onPress: () => void;
}

export const DateInput = React.memo(({
  value,
  onPress,
  placeholder = 'Select date',
  ...rest
}: DateInputProps) => {
  const dateString = value ? value.toLocaleDateString() : '';
  return (
    <Pressable onPress={onPress}>
      <View pointerEvents="none">
        <TextInput
          value={dateString}
          placeholder={placeholder}
          iconRight="calendar"
          editable={false}
          {...rest}
        />
      </View>
    </Pressable>
  );
});

// 7. SELECT INPUT (Tap to open a drop-down or bottom sheet picker)
export interface SelectInputProps extends Omit<TextInputProps, 'value'> {
  value?: string;
  placeholder?: string;
  onPress: () => void;
}

export const SelectInput = React.memo(({
  value = '',
  placeholder = 'Select option',
  onPress,
  ...rest
}: SelectInputProps) => {
  return (
    <Pressable onPress={onPress}>
      <View pointerEvents="none">
        <TextInput
          value={value}
          placeholder={placeholder}
          iconRight="chevron-down"
          editable={false}
          {...rest}
        />
      </View>
    </Pressable>
  );
});

// 8. TEXTAREA (Multi-line scrolling content)
export const Textarea = React.memo((props: TextInputProps) => {
  const { spacing } = useAppTheme();
  return (
    <TextInput
      multiline
      numberOfLines={4}
      style={[
        styles.textarea,
        {
          paddingVertical: spacing.md,
          minHeight: 100,
        },
      ]}
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: 48,
    ...Platform.select({
      web: {
        outlineStyle: 'solid',
      },
    }),
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  textarea: {
    textAlignVertical: 'top',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  errorText: {
    marginTop: 4,
    fontWeight: '500',
  },
  helperText: {
    marginTop: 4,
  },
});

TextInput.displayName = 'TextInput';
NumberInput.displayName = 'NumberInput';
SearchInput.displayName = 'SearchInput';
PasswordInput.displayName = 'PasswordInput';
CurrencyInput.displayName = 'CurrencyInput';
DateInput.displayName = 'DateInput';
SelectInput.displayName = 'SelectInput';
Textarea.displayName = 'Textarea';

export default TextInput;
