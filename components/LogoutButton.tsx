import { TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function LogoutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <LogOut size={24} color="#ef4444" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 16,
  },
});
