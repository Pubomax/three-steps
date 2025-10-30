import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { UserCircle, Trash2, LogOut, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const { user, isGuest, signOut, deleteAccount } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and will delete all your data including:\n\n• Grocery sessions\n• Shopping history\n• Product scans\n• Cart items\n• All personal data',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            // Second confirmation
            Alert.alert(
              'Final Confirmation',
              'This is your last chance. Are you absolutely sure you want to delete your account and all associated data?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    setDeleting(true);
                    try {
                      const { error } = await deleteAccount();
                      if (error) {
                        Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
                      } else {
                        Alert.alert(
                          'Account Deleted',
                          'Your account and all associated data have been permanently deleted.',
                          [
                            {
                              text: 'OK',
                              onPress: () => router.replace('/login'),
                            },
                          ]
                        );
                      }
                    } catch (error) {
                      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
                    } finally {
                      setDeleting(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  if (isGuest) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.guestIconContainer}>
            <UserCircle size={80} color="#ff00ff" />
          </View>
          <Text style={styles.guestTitle}>Guest Mode</Text>
          <Text style={styles.guestSubtitle}>
            You're using the app as a guest. Your data is stored locally on this device.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Text style={styles.sectionDescription}>
            Create an account to sync your data across devices and access it from anywhere.
          </Text>
          
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              signOut();
              router.replace('/login');
            }}>
            <Mail size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSignOut}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.secondaryButtonText}>Exit Guest Mode</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Guest mode lets you use the app without an account. Your data stays on this device and won't be synced.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <UserCircle size={80} color="#ff00ff" />
        </View>
        <Text style={styles.title}>Account Settings</Text>
        {user?.email && <Text style={styles.email}>{user.email}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSignOut}>
          <LogOut size={24} color="#6b7280" />
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Sign Out</Text>
            <Text style={styles.actionDescription}>Sign out of your account</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.dangerSectionTitle}>Danger Zone</Text>
        
        <TouchableOpacity
          style={[styles.dangerButton, deleting && styles.buttonDisabled]}
          onPress={handleDeleteAccount}
          disabled={deleting}>
          <Trash2 size={24} color="#ef4444" />
          <View style={styles.actionTextContainer}>
            <Text style={styles.dangerTitle}>
              {deleting ? 'Deleting Account...' : 'Delete Account'}
            </Text>
            <Text style={styles.dangerDescription}>
              Permanently delete your account and all data
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          ⚠️ Account deletion is permanent and cannot be undone. All your data including grocery sessions, history, and scans will be permanently deleted.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  guestIconContainer: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#ff00ff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  guestTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  dangerSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  actionTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 4,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#991b1b',
  },
  primaryButton: {
    backgroundColor: '#ff00ff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#ede9fe',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#c4b5fd',
  },
  infoText: {
    fontSize: 14,
    color: '#5b21b6',
    lineHeight: 20,
  },
});
