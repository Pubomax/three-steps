import { TouchableOpacity, Alert, StyleSheet, View, Text } from 'react-native';
import { LogOut, UserPlus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function LogoutButton() {
  const { signOut, isGuest } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (isGuest) {
      Alert.alert(
        'Guest Mode',
        'You are using the app as a guest. Your data is stored locally on this device.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Create Account',
            onPress: async () => {
              await signOut();
              router.replace('/login');
            },
          },
          {
            text: 'Exit Guest Mode',
            style: 'destructive',
            onPress: async () => {
              await signOut();
              router.replace('/login');
            },
          },
        ]
      );
    } else {
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
    }
  };

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      {isGuest ? (
        <View style={styles.guestIndicator}>
          <UserPlus size={20} color="#ff00ff" />
        </View>
      ) : (
        <LogOut size={24} color="#ef4444" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 16,
  },
  guestIndicator: {
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#ff00ff',
  },
});
