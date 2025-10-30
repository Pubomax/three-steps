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
import { Camera, X, Save, ShoppingCart, AlertCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/imageUpload';
import StartGroceryFlow from '@/components/StartGroceryFlow';
import type { Database } from '@/types/database';

type ScanStep = 'qr' | 'photo' | 'details';

interface ActiveSession {
  id: string;
  name: string;
  store_name: string;
  store_location: string;
  spending_limit: number;
}

export default function ScanScreen() {
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
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
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

      setActiveSession(session);
    } catch (error) {
      console.error('Error checking active session:', error);
    } finally {
      setCheckingSession(false);
    }
  };

  // Check for active session first, before camera permissions
  if (checkingSession) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Checking active session...</Text>
        </View>
      </View>
    );
  }

  if (!activeSession) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.noSessionContainer}>
            <AlertCircle size={64} color="#ff00ff" />
            <Text style={styles.noSessionTitle}>No Active Grocery Session</Text>
            <Text style={styles.noSessionDescription}>
              You need to start a grocery session before you can scan products.
              Each session tracks your shopping trip at a specific store with a budget.
            </Text>
            
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowStartFlow(true)}>
              <ShoppingCart size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Start Grocery Session</Text>
            </TouchableOpacity>
          </View>
        </View>

        <StartGroceryFlow
          visible={showStartFlow}
          onClose={() => setShowStartFlow(false)}
          onSuccess={(sessionId) => {
            setShowStartFlow(false);
            checkActiveSession();
          }}
        />
      </ScrollView>
    );
  }

  // Only check camera permissions if we have an active session
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#ff00ff" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan QR codes and take product photos for your active session: {activeSession.name}
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
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
            // Continue without image if upload fails
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

      const { data: previousScans } = await (supabase as any)
        .from('scans')
        .select('price, store_id, stores(name)')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .order('scanned_at', { ascending: false })
        .limit(1);

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

      if (previousScans && previousScans.length > 0) {
        const previousScan = previousScans[0] as any;
        const previousPrice = previousScan.price;
        const previousStore = previousScan.stores?.name;
        const currentPrice = parseFloat(price);

        if (currentPrice > previousPrice) {
          Alert.alert(
            'Price Alert',
            `This product was cheaper at ${previousStore} ($${previousPrice.toFixed(2)}). Current price: $${currentPrice.toFixed(2)}`
          );
        } else if (currentPrice < previousPrice) {
          Alert.alert(
            'Great Deal!',
            `You found a better price! Previously $${previousPrice.toFixed(2)} at ${previousStore}, now $${currentPrice.toFixed(2)}`
          );
        }
      }

      Alert.alert('Success', `Product added to ${activeSession.name}!`, [{ text: 'OK', onPress: resetScan }]);
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

  // If we reach here, we have both an active session and camera permissions
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Active Session Info */}
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle}>Active Session: {activeSession.name}</Text>
        <Text style={styles.sessionStore}>📍 {activeSession.store_name}</Text>
        <Text style={styles.sessionBudget}>💰 Budget: ${activeSession.spending_limit}</Text>
      </View>

      {scanStep === 'qr' && (
        <View style={styles.section}>
          <Text style={styles.title}>Scan Product</Text>
          <Text style={styles.description}>
            Scan products to add them to your active grocery session at {activeSession.store_name}
          </Text>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => {
              setShowCamera(true);
              setScanStep('qr');
            }}>
            <Camera size={32} color="#fff" />
            <Text style={styles.scanButtonText}>Scan QR Code</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter QR code manually"
            value={qrCode}
            onChangeText={setQrCode}
          />

          {qrCode && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setShowCamera(true);
                setScanStep('photo');
              }}>
              <Text style={styles.primaryButtonText}>Next: Take Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {scanStep === 'details' && (
        <View style={styles.section}>
          <Text style={styles.title}>Product Details</Text>

          {productPhoto && <Image source={{ uri: productPhoto }} style={styles.productImage} />}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Brand</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter brand name (e.g., Coca-Cola)"
              value={brandName}
              onChangeText={setBrandName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product name (e.g., Diet Coke 12oz)"
              value={productName}
              onChangeText={setProductName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.sessionInfoInline}>
            <Text style={styles.sessionInfoLabel}>Store:</Text>
            <Text style={styles.sessionInfoValue}>{activeSession.store_name}</Text>
          </View>

          <View style={styles.sessionInfoInline}>
            <Text style={styles.sessionInfoLabel}>Session:</Text>
            <Text style={styles.sessionInfoValue}>{activeSession.name}</Text>
          </View>

          <View style={styles.autoAddInfo}>
            <ShoppingCart size={16} color="#10b981" />
            <Text style={styles.autoAddText}>Will be automatically added to your active session</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={resetScan}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, styles.flexButton]}
              onPress={saveProduct}
              disabled={loading}>
              <Save size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>{loading ? 'Saving...' : 'Save Product'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  noSessionContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noSessionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noSessionDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  sessionInfo: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff00ff',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sessionStore: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  sessionBudget: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '500',
  },
  sessionInfoInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  sessionInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  sessionInfoValue: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  autoAddInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    marginBottom: 24,
  },
  autoAddText: {
    fontSize: 14,
    color: '#10b981',
    marginLeft: 8,
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  scanButton: {
    backgroundColor: '#ff00ff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9ca3af',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#ff00ff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginRight: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  flexButton: {
    flex: 2,
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
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
    padding: 8,
  },
  cameraCenterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraInstructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 8,
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
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
});
