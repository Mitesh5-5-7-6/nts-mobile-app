import { CustomerCard } from '@/components/ui/Card';
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

interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  tiffinStatus: 'active' | 'suspended' | 'cancelled';
  balance: number;
}

const MOCK_CUSTOMERS: CustomerItem[] = [
  { id: '1', name: 'Rohan Verma', phone: '+91 98765 43210', tiffinStatus: 'active', balance: 1800 },
  { id: '2', name: 'Sneha Reddy', phone: '+91 87654 32109', tiffinStatus: 'suspended', balance: 2400 },
  { id: '3', name: 'Amit Patel', phone: '+91 76543 21098', tiffinStatus: 'active', balance: -500 },
  { id: '4', name: 'Ananya Iyer', phone: '+91 65432 10987', tiffinStatus: 'active', balance: 0 },
  { id: '5', name: 'Kabir Kapoor', phone: '+91 54321 09876', tiffinStatus: 'cancelled', balance: 350 },
  { id: '6', name: 'Meera Sen', phone: '+91 43210 98765', tiffinStatus: 'active', balance: 1200 },
  { id: '7', name: 'Vikram Singh', phone: '+91 32109 87654', tiffinStatus: 'active', balance: -1000 },
];

export default function CustomersScreen() {
  const { spacing } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Filtered data
  const filteredCustomers = MOCK_CUSTOMERS.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Memoized list rendering helpers (avoids inline functions inside FlashList for high performance)
  const renderItem = useCallback(({ item }: { item: CustomerItem }) => {
    return (
      <CustomerCard
        name={item.name}
        phone={item.phone}
        tiffinStatus={item.tiffinStatus}
        balance={item.balance}
        onPress={() => console.log('Tapped customer:', item.name)}
        style={styles.cardMargin}
      />
    );
  }, []);

  const keyExtractor = useCallback((item: CustomerItem) => item.id, []);

  return (
    <PageContainer>
      <SafeAreaContainer>
        <ContentWrapper style={styles.flex}>
          {/* Header */}
          <PageHeader title="Customers" subtitle="Manage plan statuses and outstanding balances" />

          {/* Search bar */}
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search customers by name..."
            style={styles.searchBar}
          />

          {/* High-performance FlashList */}
          <View style={styles.listContainer}>
            <FlashList
              data={filteredCustomers}
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
