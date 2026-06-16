import {
  ContentWrapper,
  PageContainer,
  PageHeader,
  SafeAreaContainer,
} from '@/components/ui/Layout';
import { useAppTheme } from '@/theme';
import { StyleSheet, Text, View } from 'react-native';

export default function AddScreen() {
  const { colors, spacing, typography, radius } = useAppTheme();

  return (
    <PageContainer>
      <SafeAreaContainer>
        <ContentWrapper style={styles.center}>
          <PageHeader title="Quick Add" />
          <View style={[styles.infoCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, borderRadius: radius.md, padding: spacing.lg }]}>
            <Text style={[styles.desc, { color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.md }]}>
              The Quick Add actions can be triggered at any time from the bottom navigation bar by tapping the center + button.
            </Text>
            <Text style={[styles.hint, { color: colors.textMuted, fontSize: typography.size.xs }]}>
              Tap the elevated blue button in the center of the tab bar below to open the sheet.
            </Text>
          </View>
        </ContentWrapper>
      </SafeAreaContainer>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  infoCard: {
    borderWidth: 1.5,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  desc: {
    textAlign: 'center',
    fontWeight: '500',
  },
  hint: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
