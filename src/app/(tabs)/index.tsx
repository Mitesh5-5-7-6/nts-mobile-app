import AppIcon from '@/components/ui/AppIcon';
import {
  CustomerCard,
  InfoCard,
  PaymentCard,
  StatCard,
  SummaryCard,
} from '@/components/ui/Card';
import {
  ContentWrapper,
  PageContainer,
  PageHeader,
  SafeAreaContainer,
  SectionHeader,
} from '@/components/ui/Layout';
import { useAppTheme } from '@/theme';
import { Pressable, StyleSheet, View } from 'react-native';

export default function DashboardScreen() {
  const { colors } = useAppTheme();

  const handleNotificationPress = () => {
    console.log('Notification pressed');
  };

  const handleSeeAllPayments = () => {
    console.log('See all payments');
  };

  return (
    <PageContainer scrollable>
      <SafeAreaContainer>
        <ContentWrapper>
          {/* Header */}
          <PageHeader
            title="TiffinTrack"
            subtitle="Manage your tiffin service business"
            rightAction={
              <Pressable
                onPress={handleNotificationPress}
                style={({ pressed }) => [
                  styles.headerIconButton,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                  pressed && styles.pressed,
                ]}
              >
                <AppIcon name="bell" size={20} color={colors.text} />
              </Pressable>
            }
          />

          {/* Info Banner */}
          <InfoCard
            title="Setup Completed!"
            message="Your application shell, design system, and core UI systems have been successfully initialized."
            onClose={() => { }}
          />

          {/* Top Business Summary Card */}
          <SummaryCard
            title="June Overview"
            primaryAmount="₹34,500"
            secondaryLabel="Total earnings this month (+18% vs last month)"
            metrics={[
              { label: 'Active Plans', value: '42', icon: 'customers' },
              { label: 'Pending Dues', value: '₹4,200', icon: 'payments' },
              { label: 'Delivered', value: '280', icon: 'expense' },
            ]}
            style={styles.sectionMargin}
          />

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Active Customers"
              value="42"
              icon="customers"
              trend={{ value: '+4 new', isPositive: true }}
              style={styles.gridCard}
            />
            <StatCard
              title="Revenue Today"
              value="₹1,250"
              icon="dollar"
              trend={{ value: 'Plan auto-renew', isPositive: true }}
              style={styles.gridCard}
            />
          </View>

          {/* Recent Payments Section */}
          <SectionHeader
            title="Recent Payments"
            actionTitle="View All"
            onActionPress={handleSeeAllPayments}
          />
          <View style={styles.cardList}>
            <PaymentCard
              customerName="Aarav Sharma"
              amount={1200}
              date="Today, 10:30 AM"
              method="UPI"
              status="completed"
            />
            <PaymentCard
              customerName="Priya Patel"
              amount={1500}
              date="Yesterday, 04:15 PM"
              method="Cash"
              status="completed"
            />
          </View>

          {/* Customers with Outstanding Dues */}
          <SectionHeader title="Outstanding Dues" />
          <View style={styles.cardList}>
            <CustomerCard
              name="Rohan Verma"
              phone="+91 98765 43210"
              tiffinStatus="active"
              balance={1800}
            />
            <CustomerCard
              name="Sneha Reddy"
              phone="+91 87654 32109"
              tiffinStatus="suspended"
              balance={2400}
            />
          </View>
        </ContentWrapper>
      </SafeAreaContainer>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  sectionMargin: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  gridCard: {
    flex: 1,
    marginBottom: 8,
  },
  cardList: {
    alignSelf: 'stretch',
    gap: 2,
  },
});
