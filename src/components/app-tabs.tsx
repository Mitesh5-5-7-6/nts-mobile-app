import { Tabs } from 'expo-router';
import { CustomTabBar } from './navigation/CustomTabBar';

export default function AppTabs() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Quick Add',
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
        }}
      />
    </Tabs>
  );
}
