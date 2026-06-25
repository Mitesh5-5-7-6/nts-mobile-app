import AppIcon from '@/components/ui/AppIcon';
import { useAppTheme } from '@/theme';
import { isToday as dfIsToday, format } from 'date-fns';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface DateNavigatorProps {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const DateNavigator = React.memo(({ date, onPrev, onNext, onToday }: DateNavigatorProps) => {
  const { colors, spacing, radius, typography } = useAppTheme();
  const today = dfIsToday(date);

  const NavButton = ({ icon, onPress }: { icon: 'chevron-left' | 'chevron-right'; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.navBtn,
        { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, borderRadius: radius.md },
        pressed && { opacity: 0.7 },
      ]}
    >
      <AppIcon name={icon} size={20} color={colors.text} />
    </Pressable>
  );

  return (
    <View style={[styles.row, { paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
      <NavButton icon="chevron-left" onPress={onPrev} />

      <View style={styles.center}>
        <View style={styles.dateRow}>
          <AppIcon name="calendar" size={16} color={colors.primary} />
          <Text style={{ color: colors.text, fontSize: typography.size.md, fontWeight: '700', fontFamily: typography.family.rounded, marginLeft: 6 }}>
            {format(date, 'EEE, dd MMM yyyy')}
          </Text>
        </View>
        {!today ? (
          <Pressable onPress={onToday} hitSlop={6}>
            <Text style={{ color: colors.primary, fontSize: typography.size.xs, fontWeight: '600', marginTop: 2 }}>Jump to today</Text>
          </Pressable>
        ) : (
          <Text style={{ color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 }}>Today</Text>
        )}
      </View>

      <NavButton icon="chevron-right" onPress={onNext} />
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

DateNavigator.displayName = 'DateNavigator';
export default DateNavigator;
