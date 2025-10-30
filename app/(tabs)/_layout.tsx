import { Tabs } from 'expo-router';
import { Home, ShoppingCart, Camera, History, BarChart3 } from 'lucide-react-native';
import HeaderActions from '@/components/HeaderActions';
import LogoutButton from '@/components/LogoutButton';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#ff00ff',
        tabBarInactiveTintColor: '#6b7280',
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerTitle: 'Grocery Tracker',
          headerRight: () => <HeaderActions />,
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cart',
          headerTitle: 'My Grocery Cart',
          headerRight: () => <HeaderActions />,
          tabBarIcon: ({ size, color }) => (
            <ShoppingCart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="grocery"
        options={{
          title: 'Scan',
          headerTitle: 'Scan Products',
          headerRight: () => <HeaderActions />,
          tabBarIcon: ({ size, color }) => (
            <Camera size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          headerTitle: 'Purchase History',
          headerRight: () => <HeaderActions />,
          tabBarIcon: ({ size, color }) => (
            <History size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          headerTitle: 'Shopping Analytics',
          headerRight: () => <HeaderActions />,
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Account Settings',
          headerRight: () => <LogoutButton />,
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
