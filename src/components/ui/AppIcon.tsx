import { useAppTheme } from '@/theme';
import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export type IconNameType =
  | 'dashboard'
  | 'customers'
  | 'payments'
  | 'more'
  | 'add'
  | 'search'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'chevron-up'
  | 'user'
  | 'settings'
  | 'info'
  | 'check'
  | 'alert'
  | 'close'
  | 'trash'
  | 'edit'
  | 'calendar'
  | 'lock'
  | 'eye'
  | 'eye-off'
  | 'plus'
  | 'dollar'
  | 'expense'
  | 'arrow-right'
  | 'arrow-left'
  | 'bell'
  | 'wifi-off';

export interface AppIconProps {
  name: IconNameType;
  size?: number;
  color?: string;
  weight?: SymbolWeight;
  style?: StyleProp<ViewStyle>;
}

type SymbolName = NonNullable<SymbolViewProps['name']>;

const iconMap: Record<IconNameType, SymbolName> = {
  dashboard: {
    ios: 'house.fill',
    android: 'home',
    web: 'home',
  },
  customers: {
    ios: 'person.2.fill',
    android: 'group',
    web: 'group',
  },
  payments: {
    ios: 'creditcard.fill',
    android: 'credit_card',
    web: 'credit_card',
  },
  more: {
    ios: 'ellipsis.circle.fill',
    android: 'more_horiz',
    web: 'more_horiz',
  },
  add: {
    ios: 'plus.circle.fill',
    android: 'add_circle',
    web: 'add_circle',
  },
  search: {
    ios: 'magnifyingglass',
    android: 'search',
    web: 'search',
  },
  'chevron-right': {
    ios: 'chevron.right',
    android: 'chevron_right',
    web: 'chevron_right',
  },
  'chevron-left': {
    ios: 'chevron.left',
    android: 'chevron_left',
    web: 'chevron_left',
  },
  'chevron-down': {
    ios: 'chevron.down',
    android: 'expand_more',
    web: 'expand_more',
  },
  'chevron-up': {
    ios: 'chevron.up',
    android: 'expand_less',
    web: 'expand_less',
  },
  user: {
    ios: 'person.fill',
    android: 'person',
    web: 'person',
  },
  settings: {
    ios: 'gearshape.fill',
    android: 'settings',
    web: 'settings',
  },
  info: {
    ios: 'info.circle.fill',
    android: 'info',
    web: 'info',
  },
  check: {
    ios: 'checkmark.circle.fill',
    android: 'check_circle',
    web: 'check_circle',
  },
  alert: {
    ios: 'exclamationmark.triangle.fill',
    android: 'warning',
    web: 'warning',
  },
  close: {
    ios: 'xmark',
    android: 'close',
    web: 'close',
  },
  trash: {
    ios: 'trash.fill',
    android: 'delete',
    web: 'delete',
  },
  edit: {
    ios: 'pencil',
    android: 'edit',
    web: 'edit',
  },
  calendar: {
    ios: 'calendar',
    android: 'calendar_today',
    web: 'calendar_today',
  },
  lock: {
    ios: 'lock.fill',
    android: 'lock',
    web: 'lock',
  },
  eye: {
    ios: 'eye.fill',
    android: 'visibility',
    web: 'visibility',
  },
  'eye-off': {
    ios: 'eye.slash.fill',
    android: 'visibility_off',
    web: 'visibility_off',
  },
  plus: {
    ios: 'plus',
    android: 'add',
    web: 'add',
  },
  dollar: {
    ios: 'indianrupeesign',
    android: 'currency_rupee',
    web: 'currency_rupee',
  },
  expense: {
    ios: 'cart.fill',
    android: 'shopping_cart',
    web: 'shopping_cart',
  },
  'arrow-right': {
    ios: 'arrow.right',
    android: 'arrow_right_alt',
    web: 'arrow_right_alt',
  },
  'arrow-left': {
    ios: 'arrow.left',
    android: 'arrow_back',
    web: 'arrow_back',
  },
  bell: {
    ios: 'bell.fill',
    android: 'notifications',
    web: 'notifications',
  },
  'wifi-off': {
    ios: 'wifi.slash',
    android: 'wifi_off',
    web: 'wifi_off',
  },
};

const AppIcon = React.memo(
  ({
    name,
    size = 24,
    color,
    weight = 'regular',
    style,
  }: AppIconProps) => {
    const { colors } = useAppTheme();

    return (
      <SymbolView
        name={iconMap[name]}
        size={size}
        weight={weight}
        tintColor={color ?? colors.icon}
        style={style}
      />
    );

  }
);

AppIcon.displayName = 'AppIcon';

export default AppIcon;
