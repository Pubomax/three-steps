import { Tabs } from 'expo-router';
import { Home, ShoppingCart, Camera, History, BarChart3, Settings } from 'lucide-react-native';
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
          headerRight: () => <LogoutButton />,
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
          headerRight: () => <LogoutButton />,
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
          headerRight: () => <LogoutButton />,
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
          headerRight: () => <LogoutButton />,
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
          headerRight: () => <LogoutButton />,
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
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
