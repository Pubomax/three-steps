
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ArrowLeft, QrCode, ShoppingCart, X, Save, AlertCircle, Camera } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/imageUpload';
import StartGroceryFlow from '@/components/StartGroceryFlow';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

type ScanStep = 'qr' | 'photo' | 'details';

interface ActiveSession {
  id: string;
  name: string;
  store_name: string;
  store_location: string;
  spending_limit: number;
}

export default function ScanScreen() {
  const { isGuest } = useAuth();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [scanStep, setScanStep] = useState<ScanStep>('qr');
  const [qrCode, setQrCode] = useState('');
  const [productPhoto, setProductPhoto] = useState('');
  const [brandName, setBrandName] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [showStartFlow, setShowStartFlow] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    checkActiveSession();
  }, []);

  useEffect(() => {
    if (activeSession) {
      loadCartTotal();
    }
  }, [activeSession]);

  const checkActiveSession = async () => {
    try {
      if (isGuest) {
        // Load from AsyncStorage for guest users
        const sessionsJson = await AsyncStorage.getItem('guest_sessions');
        if (sessionsJson) {
          const sessions = JSON.parse(sessionsJson);
          const active = sessions.find((s: any) => s.is_active);
          setActiveSession(active || null);
        }
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setCheckingSession(false);
          return;
        }

        const { data: session } = await supabase
          .from('grocery_sessions')
          .select('id, name, store_name, store_location, spending_limit')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        setActiveSession(session as ActiveSession | null);
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    } finally {
      setCheckingSession(false);
    }
  };

  const loadCartTotal = async () => {
    if (!activeSession) return;

    try {
      if (isGuest) {
        const cartJson = await AsyncStorage.getItem(`guest_cart_${activeSession.id}`);
        const cartItems = cartJson ? JSON.parse(cartJson) : [];
        const total = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        setCartTotal(total);
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: cartItems } = await supabase
          .from('cart_items')
          .select('price, quantity')
          .eq('user_id', user.id)
          .eq('session_id', activeSession.id);

        const total = cartItems?.reduce((sum, item: any) => sum + (item.price * item.quantity), 0) || 0;
        setCartTotal(total);
      }
    } catch (error) {
      console.error('Error loading cart total:', error);
    }
  };

  const handleGroceryStarted = (sessionId: string) => {
    setShowStartFlow(false);
    checkActiveSession();
  };

  // Check for active session first, before camera permissions
  if (checkingSession) {
    return (
      <LinearGradient
        colors={['#0a0e14', '#1a232e']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Checking active session...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!activeSession) {
    return (
      <LinearGradient
        colors={['#0a0e14', '#1a232e']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#e0e0e0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping in Progress</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.glassCard}>
            <AlertCircle size={64} color="#ff00ff" />
            <Text style={styles.noSessionTitle}>No Active Grocery Session</Text>
            <Text style={styles.noSessionDescription}>
              You need to start a grocery session before you can scan products.
              Each session tracks your shopping trip at a specific store with a budget.
            </Text>
            
            <TouchableOpacity
              style={styles.glassButton}
              onPress={() => setShowStartFlow(true)}>
              <ShoppingCart size={20} color="#ff00ff" />
              <Text style={styles.glassButtonText}>Start Grocery Session</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <StartGroceryFlow
          visible={showStartFlow}
          onClose={() => setShowStartFlow(false)}
          onSuccess={handleGroceryStarted}
        />
      </LinearGradient>
    );
  }

  // Only check camera permissions if we have an active session
  if (!permission) {
    return (
      <LinearGradient
        colors={['#0a0e14', '#1a232e']}
        style={styles.container}
      />
    );
  }

  if (!permission.granted) {
    return (
      <LinearGradient
        colors={['#0a0e14', '#1a232e']}
        style={styles.container}
      >
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#ff00ff" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan QR codes and take product photos for your active session: {activeSession.name}
          </Text>
          <TouchableOpacity style={styles.glassButton} onPress={requestPermission}>
            <Text style={styles.glassButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanStep === 'qr' && data) {
      setQrCode(data);
      setScanStep('photo');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      if (photo && photo.uri) {
        setProductPhoto(photo.uri);
        setShowCamera(false);
        setScanStep('details');
      }
    }
  };

  const resetScan = () => {
    setShowCamera(false);
    setScanStep('qr');
    setQrCode('');
    setProductPhoto('');
    setBrandName('');
    setProductName('');
    setPrice('');
    setQuantity('1');
  };

  const saveProduct = async () => {
    if (!brandName || !productName || !price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!activeSession) {
      Alert.alert('Error', 'No active grocery session found. Please start a session first.');
      return;
    }

    setLoading(true);
    try {
      if (isGuest) {
        // Guest mode: Save to AsyncStorage
        const cartJson = await AsyncStorage.getItem(`guest_cart_${activeSession.id}`);
        const cart = cartJson ? JSON.parse(cartJson) : [];
        
        const newItem = {
          id: Date.now().toString(),
          product_id: qrCode || Date.now().toString(),
          price: parseFloat(price),
          quantity: parseInt(quantity) || 1,
          products: {
            name: productName,
            brand: brandName,
            image_url: productPhoto,
          },
        };

        cart.push(newItem);
        await AsyncStorage.setItem(`guest_cart_${activeSession.id}`, JSON.stringify(cart));
        
        Alert.alert('Success', `Product added to ${activeSession.name}!`, [{ text: 'OK', onPress: resetScan }]);
      } else {
        // Authenticated user: Save to Supabase (existing logic)
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          Alert.alert('Error', 'You must be logged in to save products');
          setLoading(false);
          return;
        }

        // Get or create store from active session
        let storeId: string;
        const { data: existingStore } = await (supabase as any)
          .from('stores')
          .select('id')
          .eq('name', activeSession.store_name)
          .maybeSingle();

        if (existingStore) {
          storeId = existingStore.id;
        } else {
          const { data: newStore, error: storeError } = await (supabase as any)
            .from('stores')
            .insert({
              name: activeSession.store_name,
              address: activeSession.store_location
            })
            .select('id')
            .single();

          if (storeError || !newStore) throw storeError;
          storeId = newStore.id;
        }

        let productId: string;
        const { data: existingProduct } = await (supabase as any)
          .from('products')
          .select('id')
          .eq('qr_code', qrCode)
          .maybeSingle();

        if (existingProduct) {
          productId = existingProduct.id;
        } else {
          // Upload image to Supabase Storage
          let imageUrl: string | null = null;
          if (productPhoto) {
            try {
              imageUrl = await uploadImage(productPhoto);
            } catch (uploadError) {
              console.error('Error uploading image:', uploadError);
              Alert.alert('Warning', 'Failed to upload image, but product will be saved without photo');
            }
          }

          const { data: newProduct, error: productError } = await (supabase as any)
            .from('products')
            .insert({
              qr_code: qrCode,
              brand: brandName,
              name: productName,
              image_url: imageUrl,
            })
            .select('id')
            .single();

          if (productError || !newProduct) throw productError;
          productId = newProduct.id;
        }

        const { error: scanError } = await (supabase as any).from('scans').insert({
          user_id: user.id,
          product_id: productId,
          store_id: storeId,
          price: parseFloat(price),
        });

        if (scanError) throw scanError;

        // Automatically add to active session cart
        const { error: cartError } = await (supabase as any).from('cart_items').insert({
          user_id: user.id,
          session_id: activeSession.id,
          product_id: productId,
          price: parseFloat(price),
          quantity: parseInt(quantity) || 1,
        });

        if (cartError) throw cartError;

        Alert.alert('Success', `Product added to ${activeSession.name}!`, [{ text: 'OK', onPress: resetScan }]);
      }
      
      // Reload cart total
      await loadCartTotal();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showCamera) {
    return (
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanStep === 'qr' ? handleBarcodeScanned : undefined}
          barcodeScannerSettings={
            scanStep === 'qr'
              ? {
                  barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e'],
                }
              : undefined
          }>
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowCamera(false);
                  if (scanStep === 'photo' && !qrCode) {
                    setScanStep('qr');
                  }
                }}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.cameraCenterContainer}>
              <Text style={styles.cameraInstructionText}>
                {scanStep === 'qr' ? 'Scan the QR code or barcode' : 'Take a photo of the product'}
              </Text>
              <View style={styles.scanFrame} />
            </View>

            {scanStep === 'photo' && (
              <View style={styles.cameraFooter}>
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </CameraView>
      </View>
    );
  }

  const spendingPercentage = activeSession.spending_limit > 0 ? Math.min((cartTotal / activeSession.spending_limit) * 100, 100) : 0;

  // Main screen with active session
  return (
    <LinearGradient
      colors={['#0a0e14', '#1a232e']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#e0e0e0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping in Progress</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Active Session Card */}
        <View style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionLabel}>Active Shopping Session</Text>
            <Text style={styles.sessionName}>{activeSession.name}</Text>
            <Text style={styles.sessionStore}>at {activeSession.store_name}</Text>
          </View>

          <View style={styles.sessionStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={styles.statValue}>${cartTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Budget</Text>
              <Text style={styles.statValueMuted}>${activeSession.spending_limit.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Current Spending</Text>
              <Text style={styles.progressPercentage}>{Math.round(spendingPercentage)}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${spendingPercentage}%` }]} />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.glassButton}
            onPress={() => router.push('/(tabs)')}>
            <Text style={styles.glassButtonText}>View Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.glassButtonOutline}
            onPress={() => {
              Alert.alert(
                'End Session',
                'Are you sure you want to end this grocery session?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'End Session', style: 'destructive', onPress: () => router.push('/(tabs)/home') },
                ]
              );
            }}>
            <Text style={styles.glassButtonOutlineText}>End Session</Text>
          </TouchableOpacity>
        </View>

        {/* Product Details Form (if in details step) */}
        {scanStep === 'details' && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Product Details</Text>

            {productPhoto && <Image source={{ uri: productPhoto }} style={styles.productImage} />}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Brand</Text>
              <TextInput
                style={styles.glassInput}
                placeholder="Enter brand name"
                placeholderTextColor="#999999"
                value={brandName}
                onChangeText={setBrandName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name</Text>
              <TextInput
                style={styles.glassInput}
                placeholder="Enter product name"
                placeholderTextColor="#999999"
                value={productName}
                onChangeText={setProductName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price ($)</Text>
              <TextInput
                style={styles.glassInput}
                placeholder="0.00"
                placeholderTextColor="#999999"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Quantity</Text>
              <TextInput
                style={styles.glassInput}
                placeholder="1"
                placeholderTextColor="#999999"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.glassButtonOutline} onPress={resetScan}>
                <Text style={styles.glassButtonOutlineText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.glassButton, styles.flexButton]}
                onPress={saveProduct}
                disabled={loading}>
                <Save size={20} color="#ff00ff" />
                <Text style={styles.glassButtonText}>{loading ? 'Saving...' : 'Save Product'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Scan Button */}
      <TouchableOpacity
        style={styles.floatingScanButton}
        onPress={() => {
          setShowCamera(true);
          setScanStep('qr');
        }}>
        <QrCode size={24} color="#fff" />
        <Text style={styles.floatingScanButtonText}>Scan Item</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e0e0e0',
    flex: 1,
    textAlign: 'center',
    marginRight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#e0e0e0',
    fontSize: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(16px)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 5,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(16px)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 5,
  },
  sessionHeader: {
    alignItems: 'stretch',
    marginBottom: 16,
  },
  sessionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff00ff',
    marginBottom: 8,
  },
  sessionName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 4,
  },
  sessionStore: {
    fontSize: 16,
    color: '#999999',
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e0e0e0',
  },
  statValueMuted: {
    fontSize: 18,
    fontWeight: '700',
    color: '#999999',
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff00ff',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ff00ff',
    borderRadius: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  glassButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  glassButtonText: {
    color: '#ff00ff',
    fontSize: 16,
    fontWeight: '700',
  },
  glassButtonOutline: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  glassButtonOutlineText: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '700',
  },
  floatingScanButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: 'rgba(255, 0, 255, 0.4)',
    backdropFilter: 'blur(18px)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.5)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  floatingScanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(16px)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 5,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 16,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 8,
  },
  glassInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  flexButton: {
    flex: 2,
  },
  noSessionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e0e0e0',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noSessionDescription: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e0e0e0',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 60,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraCenterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  cameraInstructionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#ff00ff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  cameraFooter: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
});
