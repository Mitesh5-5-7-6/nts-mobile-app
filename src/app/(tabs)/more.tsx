import AppIcon from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import {
  ContentWrapper,
  PageContainer,
  PageHeader,
  SafeAreaContainer,
  SectionHeader,
} from '@/components/ui/Layout';
import {
  ActionSheet,
  AlertModal,
  ConfirmationModal,
} from '@/components/ui/Modal';
import { ThemeModeType, useAppTheme } from '@/theme';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function MoreScreen() {
  const { colors, themeMode, setThemeMode, spacing, typography, radius } = useAppTheme();

  // Modal visibility states for system verification
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const handleThemeChange = (mode: ThemeModeType) => {
    setThemeMode(mode);
  };

  const verifyActionSheetItems = [
    { label: 'Export Business Data', onPress: () => console.log('Exporting data') },
    { label: 'Import Customers CSV', onPress: () => console.log('Importing data') },
    { label: 'Delete Cached Metadata', onPress: () => console.log('Clearing cache'), isDestructive: true },
  ];

  return (
    <PageContainer scrollable>
      <SafeAreaContainer>
        <ContentWrapper>
          {/* Header */}
          <PageHeader title="More Settings" subtitle="Configure system settings and review components" />

          {/* Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary, borderRadius: radius.full }]}>
              <AppIcon name="user" size={24} color="#FFFFFF" />
            </View>
            <View style={{ marginLeft: spacing.md }}>
              <Text style={{ color: colors.text, fontSize: typography.size.md, fontWeight: '700' }}>
                Tiffin Service Admin
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs }}>
                admin@tiffintrack.app
              </Text>
            </View>
          </View>

          {/* Theme Settings Section */}
          <SectionHeader title="Theme Mode" />
          <View style={[styles.themeToggleRow, { borderColor: colors.border, borderRadius: radius.md }]}>
            {(['light', 'dark', 'system'] as ThemeModeType[]).map((mode) => {
              const isActive = themeMode === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => handleThemeChange(mode)}
                  style={[
                    styles.themeToggleButton,
                    isActive && { backgroundColor: colors.primary },
                    { paddingVertical: spacing.md },
                  ]}
                >
                  <Text
                    style={{
                      color: isActive ? '#FFFFFF' : colors.textSecondary,
                      fontSize: typography.size.sm,
                      fontWeight: isActive ? '700' : '500',
                      textTransform: 'capitalize',
                      textAlign: 'center',
                    }}
                  >
                    {mode}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Modal Verification Tests Section */}
          <SectionHeader title="Interactive Components Test" />
          <Text style={{ color: colors.textMuted, fontSize: typography.size.xs, marginBottom: spacing.md }}>
            Launch the custom Reanimated overlays to verify the animations, backdrop fading, and transitions:
          </Text>

          <View style={styles.buttonStack}>
            <Button
              title="Open Alert Modal"
              iconLeft="info"
              onPress={() => setIsAlertOpen(true)}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="Open Confirmation Modal"
              iconLeft="trash"
              onPress={() => setIsConfirmOpen(true)}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="Open Options Action Sheet"
              iconLeft="more"
              onPress={() => setIsActionSheetOpen(true)}
              variant="outline"
              style={styles.actionButton}
            />
          </View>

          {/* App Info Box */}
          <View style={[styles.infoBox, { borderColor: colors.border, marginTop: spacing.xxl, padding: spacing.md, borderRadius: radius.sm }]}>
            <Text style={{ color: colors.textMuted, fontSize: 10, textAlign: 'center' }}>
              TiffinTrack Foundation • Version 1.0.0
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 10, textAlign: 'center', marginTop: spacing.xxs }}>
              Powered by Expo 56 & Reanimated 4
            </Text>
          </View>
        </ContentWrapper>
      </SafeAreaContainer>

      {/* Verification Overlay Modals */}
      <AlertModal
        visible={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title="Verification Alert"
        description="The AlertModal was launched from our unified Reanimated Modal system successfully!"
      />

      <ConfirmationModal
        visible={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => console.log('Confirmed!')}
        title="Confirm Operation"
        description="Are you sure you want to run this simulation? This verifies standard destructiveness highlighting."
        isDestructive
      />

      <ActionSheet
        visible={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        title="Database Settings"
        items={verifyActionSheetItems}
      />
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggleRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  themeToggleButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonStack: {
    gap: 12,
  },
  actionButton: {
    justifyContent: 'flex-start',
    paddingLeft: 16,
  },
  infoBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
});
