import { useAppTheme } from '@/theme';
import React from 'react';
import {
  DimensionValue,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideInLeft,
  SlideOutDown,
  SlideOutLeft,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import AppIcon from './AppIcon';
import { Button } from './Button';

// 1. GENERAL BOTTOM SHEET
export interface BottomSheetProps {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: DimensionValue;
}

export const BottomSheet = React.memo(({
  visible,
  onClose,
  title,
  children,
  maxHeight = '70%',
}: BottomSheetProps) => {
  const { colors, spacing, radius, typography } = useAppTheme();

  if (!visible) return null;

  return (
    <View style={styles.overlayContainer}>
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>

      {/* Sheet Container */}
      <Animated.View
        entering={SlideInDown.springify().damping(20).stiffness(120)}
        exiting={SlideOutDown.duration(150)}
        style={[
          styles.bottomSheet,
          {
            backgroundColor: colors.background,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            maxHeight,
          },
        ]}
      >
        {/* Handle bar */}
        <View style={styles.dragHandleContainer}>
          <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
        </View>

        {/* Header */}
        {(title || onClose) && (
          <View style={[styles.header, { borderBottomColor: colors.border, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }]}>
            {title && (
              <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.size.md, fontFamily: typography.family.rounded }]}>
                {title}
              </Text>
            )}
            <Pressable onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.backgroundSecondary }]}>
              <AppIcon name="close" size={16} color={colors.text} />
            </Pressable>
          </View>
        )}

        {/* Content */}
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.giant }}>
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
});

// 2. CONFIRMATION MODAL (Destructive or normal actions)
export interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmTitle?: string;
  cancelTitle?: string;
  isDestructive?: boolean;
}

export const ConfirmationModal = React.memo(({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  confirmTitle = 'Confirm',
  cancelTitle = 'Cancel',
  isDestructive = false,
}: ConfirmationModalProps) => {
  const { colors, spacing, radius, typography } = useAppTheme();

  if (!visible) return null;

  return (
    <View style={styles.overlayContainer}>
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>

      {/* Dialog box */}
      <Animated.View
        entering={ZoomIn.duration(200)}
        exiting={ZoomOut.duration(150)}
        style={[
          styles.dialog,
          {
            backgroundColor: colors.background,
            borderRadius: radius.lg,
            padding: spacing.xl,
          },
        ]}
      >
        <Text style={[styles.dialogTitle, { color: colors.text, fontSize: typography.size.lg, marginBottom: spacing.sm }]}>
          {title}
        </Text>
        <Text style={[styles.dialogDesc, { color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xl }]}>
          {description}
        </Text>
        <View style={styles.buttonRow}>
          <Button
            title={cancelTitle}
            onPress={onClose}
            variant="ghost"
            style={{ flex: 1 }}
          />
          <Button
            title={confirmTitle}
            onPress={() => {
              onConfirm();
              onClose();
            }}
            variant={isDestructive ? 'danger' : 'primary'}
            style={{ flex: 1.2 }}
          />
        </View>
      </Animated.View>
    </View>
  );
});

// 3. ALERT MODAL (Informative message)
export interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonTitle?: string;
}

export const AlertModal = React.memo(({
  visible,
  onClose,
  title,
  description,
  buttonTitle = 'OK',
}: AlertModalProps) => {
  const { colors, spacing, radius, typography } = useAppTheme();

  if (!visible) return null;

  return (
    <View style={styles.overlayContainer}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>

      <Animated.View
        entering={ZoomIn.duration(200)}
        exiting={ZoomOut.duration(150)}
        style={[
          styles.dialog,
          {
            backgroundColor: colors.background,
            borderRadius: radius.lg,
            padding: spacing.xl,
          },
        ]}
      >
        <Text style={[styles.dialogTitle, { color: colors.text, fontSize: typography.size.lg, marginBottom: spacing.sm }]}>
          {title}
        </Text>
        <Text style={[styles.dialogDesc, { color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xl }]}>
          {description}
        </Text>
        <Button title={buttonTitle} onPress={onClose} variant="primary" style={{ alignSelf: 'stretch' }} />
      </Animated.View>
    </View>
  );
});

// 4. DRAWER MODAL (Slides in from the left)
export interface DrawerModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const DrawerModal = React.memo(({
  visible,
  onClose,
  children,
}: DrawerModalProps) => {
  const { colors, spacing } = useAppTheme();

  if (!visible) return null;

  return (
    <View style={styles.overlayContainer}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>

      <Animated.View
        entering={SlideInLeft.springify().damping(20).stiffness(120)}
        exiting={SlideOutLeft.duration(150)}
        style={[
          styles.drawer,
          {
            backgroundColor: colors.background,
            padding: spacing.lg,
          },
        ]}
      >
        <View style={styles.drawerHeader}>
          <Pressable onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.backgroundSecondary }]}>
            <AppIcon name="close" size={16} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView style={{ flex: 1 }}>{children}</ScrollView>
      </Animated.View>
    </View>
  );
});

// 5. ACTION SHEET (iOS style sliding option sheet)
export interface ActionSheetItem {
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
}

export interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  items: ActionSheetItem[];
}

export const ActionSheet = React.memo(({
  visible,
  onClose,
  title,
  items,
}: ActionSheetProps) => {
  const { colors, spacing, radius, typography } = useAppTheme();

  if (!visible) return null;

  return (
    <View style={styles.overlayContainer}>
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>

      {/* Action sheet content */}
      <Animated.View
        entering={SlideInDown.springify().damping(20).stiffness(120)}
        exiting={SlideOutDown.duration(150)}
        style={[
          styles.actionSheetContainer,
          {
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.giant,
          },
        ]}
      >
        {/* Main Items Block */}
        <View style={[styles.actionSheetBody, { backgroundColor: colors.backgroundSecondary, borderRadius: radius.lg }]}>
          {title && (
            <View style={[styles.actionSheetHeader, { borderBottomColor: colors.border }]}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs, textAlign: 'center' }}>
                {title}
              </Text>
            </View>
          )}

          {items.map((item, idx) => (
            <Pressable
              key={idx}
              onPress={() => {
                item.onPress();
                onClose();
              }}
              style={({ pressed }) => [
                styles.actionSheetItem,
                { borderBottomColor: colors.border },
                idx === items.length - 1 && { borderBottomWidth: 0 },
                pressed && { backgroundColor: colors.backgroundSelected },
              ]}
            >
              <Text
                style={{
                  color: item.isDestructive ? colors.error : colors.text,
                  fontSize: typography.size.base,
                  fontWeight: typography.weight.medium,
                  textAlign: 'center',
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Cancel Button Block */}
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.actionSheetCancel,
            { backgroundColor: colors.background, borderRadius: radius.lg, marginTop: spacing.md },
            pressed && { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <Text style={{ color: colors.primary, fontSize: typography.size.base, fontWeight: typography.weight.bold, textAlign: 'center' }}>
            Cancel
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  backdropPressable: {
    flex: 1,
  },
  bottomSheet: {
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 36,
    height: 4.5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontWeight: '700',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    width: '85%',
    alignSelf: 'center',
    marginBottom: 'auto',
    marginTop: 'auto',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  dialogTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  dialogDesc: {
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  drawer: {
    width: '75%',
    height: '100%',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  actionSheetContainer: {
    width: '100%',
  },
  actionSheetBody: {
    overflow: 'hidden',
  },
  actionSheetHeader: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSheetItem: {
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSheetCancel: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});

BottomSheet.displayName = 'BottomSheet';
ConfirmationModal.displayName = 'ConfirmationModal';
AlertModal.displayName = 'AlertModal';
DrawerModal.displayName = 'DrawerModal';
ActionSheet.displayName = 'ActionSheet';

export default BottomSheet;
