import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, ShoppingCart, Store, DollarSign, Tag } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

type GroceryType = 'regular' | 'special_event' | 'bulk' | 'weekly' | 'monthly';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: (sessionId: string) => void;
};

export default function StartGroceryFlow({ visible, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [sessionName, setSessionName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [spendingLimit, setSpendingLimit] = useState('');
  const [groceryType, setGroceryType] = useState<GroceryType>('regular');
  const [loading, setLoading] = useState(false);

  const groceryTypes: { value: GroceryType; label: string; description: string }[] = [
    { value: 'regular', label: 'Regular', description: 'Normal grocery shopping' },
    { value: 'weekly', label: 'Weekly', description: 'Weekly grocery run' },
    { value: 'monthly', label: 'Monthly', description: 'Monthly stock-up' },
    { value: 'bulk', label: 'Bulk', description: 'Bulk buying trip' },
    { value: 'special_event', label: 'Special Event', description: 'Party, holidays, etc' },
  ];

  const resetForm = () => {
    setStep(1);
    setSessionName('');
    setStoreName('');
    setStoreLocation('');
    setSpendingLimit('');
    setGroceryType('regular');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (step === 1 && !sessionName.trim()) {
      Alert.alert('Required', 'Please enter a session name');
      return;
    }
    if (step === 2 && !storeName.trim()) {
      Alert.alert('Required', 'Please enter the store name');
      return;
    }
    if (step === 2 && !storeLocation.trim()) {
      Alert.alert('Required', 'Please enter the store location');
      return;
    }
    if (step === 3 && !spendingLimit.trim()) {
      Alert.alert('Required', 'Please enter a spending limit');
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleStartGrocery();
    }
  };

  const handleStartGrocery = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingSession } = await (supabase as any)
        .from('grocery_sessions')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (existingSession) {
        Alert.alert(
          'Active Session Found',
          `You already have an active session "${existingSession.name}". Please end it before starting a new one.`,
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      const { data, error } = await (supabase as any)
        .from('grocery_sessions')
        .insert({
          user_id: user.id,
          name: sessionName,
          store_name: storeName,
          store_location: storeLocation,
          spending_limit: parseFloat(spendingLimit),
          grocery_type: groceryType,
          is_active: true,
          started_at: new Date().toISOString(),
          status: 'in_progress',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        throw error;
      }

      if (!data) {
        console.error('No data returned from session creation');
        throw new Error('Failed to create session');
      }

      console.log('Session created successfully:', data);
      // Don't show alert - immediately proceed to success callback
      resetForm();
      onSuccess(data.id);
    } catch (error) {
      console.error('Error starting grocery:', error);
      Alert.alert('Error', 'Failed to start grocery session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Start Grocery</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.progressBar}>
            {[1, 2, 3, 4].map((s) => (
              <View
                key={s}
                style={[styles.progressStep, step >= s && styles.progressStepActive]}
              />
            ))}
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {step === 1 && (
              <View style={styles.stepContainer}>
                <ShoppingCart size={48} color="#ff00ff" style={styles.stepIcon} />
                <Text style={styles.stepTitle}>Session Name</Text>
                <Text style={styles.stepDescription}>
                  Give your shopping session a name (e.g., Weekend Shopping, Walmart Trip)
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter session name"
                  value={sessionName}
                  onChangeText={setSessionName}
                  autoFocus
                />
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContainer}>
                <Store size={48} color="#ff00ff" style={styles.stepIcon} />
                <Text style={styles.stepTitle}>Store Information</Text>
                <Text style={styles.stepDescription}>Which store are you shopping at?</Text>
                <TextInput
                  style={[styles.input, { marginBottom: 12 }]}
                  placeholder="Store name (e.g., Walmart, Costco)"
                  value={storeName}
                  onChangeText={setStoreName}
                  autoFocus
                />
                <TextInput
                  style={styles.input}
                  placeholder="Store location (e.g., Downtown, 5th Ave)"
                  value={storeLocation}
                  onChangeText={setStoreLocation}
                />
              </View>
            )}

            {step === 3 && (
              <View style={styles.stepContainer}>
                <DollarSign size={48} color="#ff00ff" style={styles.stepIcon} />
                <Text style={styles.stepTitle}>Spending Limit</Text>
                <Text style={styles.stepDescription}>
                  Set a budget for this shopping trip
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 150.00"
                  value={spendingLimit}
                  onChangeText={setSpendingLimit}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
            )}

            {step === 4 && (
              <View style={styles.stepContainer}>
                <Tag size={48} color="#ff00ff" style={styles.stepIcon} />
                <Text style={styles.stepTitle}>Grocery Type</Text>
                <Text style={styles.stepDescription}>
                  What type of shopping trip is this?
                </Text>
                {groceryTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      groceryType === type.value && styles.typeOptionSelected,
                    ]}
                    onPress={() => setGroceryType(type.value)}>
                    <View style={styles.typeOptionContent}>
                      <Text
                        style={[
                          styles.typeOptionLabel,
                          groceryType === type.value && styles.typeOptionLabelSelected,
                        ]}>
                        {type.label}
                      </Text>
                      <Text style={styles.typeOptionDescription}>{type.description}</Text>
                    </View>
                    {groceryType === type.value && (
                      <View style={styles.typeOptionCheck}>
                        <Text style={styles.typeOptionCheckMark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(step - 1)}
                disabled={loading}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextButton, loading && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={loading}>
              <Text style={styles.nextButtonText}>
                {step === 4 ? 'Start Shopping' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#ff00ff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepIcon: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
  },
  typeOption: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  typeOptionSelected: {
    backgroundColor: '#d1fae5',
    borderColor: '#ff00ff',
  },
  typeOptionContent: {
    flex: 1,
  },
  typeOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  typeOptionLabelSelected: {
    color: '#059669',
  },
  typeOptionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  typeOptionCheck: {
    width: 24,
    height: 24,
    backgroundColor: '#ff00ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeOptionCheckMark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#ff00ff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
