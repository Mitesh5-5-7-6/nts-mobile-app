import { PaymentCard } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/Input';
import {
  ContentWrapper,
  PageContainer,
  PageHeader,
  SafeAreaContainer,
} from '@/components/ui/Layout';
import { useAppTheme } from '@/theme';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface TransactionItem {
  id: string;
  customerName: string;
  amount: number;
  date: string;
  method: 'UPI' | 'Cash' | 'Bank Transfer';
  status: 'completed' | 'pending' | 'failed';
}

const MOCK_TRANSACTIONS: TransactionItem[] = [
  { id: '1', customerName: 'Aarav Sharma', amount: 1200, date: 'Today, 10:30 AM', method: 'UPI', status: 'completed' },
  { id: '2', customerName: 'Priya Patel', amount: 1500, date: 'Yesterday, 04:15 PM', method: 'Cash', status: 'completed' },
  { id: '3', customerName: 'Rohan Verma', amount: 1800, date: '14 Jun 2026, 09:00 AM', method: 'UPI', status: 'completed' },
  { id: '4', customerName: 'Neha Sen', amount: 1200, date: '12 Jun 2026, 11:45 AM', method: 'Bank Transfer', status: 'completed' },
  { id: '5', customerName: 'Sneha Reddy', amount: 2400, date: '10 Jun 2026, 02:30 PM', method: 'UPI', status: 'pending' },
  { id: '6', customerName: 'Ananya Iyer', amount: 1000, date: '08 Jun 2026, 08:20 AM', method: 'Cash', status: 'completed' },
  { id: '7', customerName: 'Kabir Kapoor', amount: 1200, date: '06 Jun 2026, 06:10 PM', method: 'UPI', status: 'failed' },
];

export default function PaymentsScreen() {
  const { spacing } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Filtered transactions
  const filteredTransactions = MOCK_TRANSACTIONS.filter((tx) =>
    tx.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Memoized list rendering helpers for FlashList
  const renderItem = useCallback(({ item }: { item: TransactionItem }) => {
    return (
      <PaymentCard
        customerName={item.customerName}
        amount={item.amount}
        date={item.date}
        method={item.method}
        status={item.status}
        onPress={() => console.log('Tapped transaction ID:', item.id)}
        style={styles.cardMargin}
      />
    );
  }, []);

  const keyExtractor = useCallback((item: TransactionItem) => item.id, []);

  return (
    <PageContainer>
      <SafeAreaContainer>
        <ContentWrapper style={styles.flex}>
          {/* Header */}
          <PageHeader title="Payments" subtitle="Track revenue collection history and methods" />

          {/* Search bar */}
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search payments by customer name..."
            style={styles.searchBar}
          />

          {/* Transaction List */}
          <View style={styles.listContainer}>
            <FlashList
              data={filteredTransactions}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: spacing.giant * 2 }}
            />
          </View>
        </ContentWrapper>
      </SafeAreaContainer>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  searchBar: {
    marginBottom: 8,
  },
  listContainer: {
    flex: 1,
    width: '100%',
  },
  cardMargin: {
    marginBottom: 10,
  },
});
