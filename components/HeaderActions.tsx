import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings, LogOut } from 'lucide-react-native';

export default function HeaderActions() {
  const router = useRouter();

  const handleSettings = () => {
    router.push('/(tabs)/settings');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handleSettings}
        style={styles.button}
        accessibilityLabel="Settings"
      >
        <Settings size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    gap: 15,
  },
  button: {
    padding: 5,
  },
});
