import { useState, useRef } from 'react';
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
import { Camera, X, Save, ShoppingCart } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/imageUpload';

type ScanStep = 'qr' | 'photo' | 'details';

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
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [addToCart, setAddToCart] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#10b981" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan QR codes and take product photos
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Grant Permission</Text>
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
    setStoreName('');
    setAddToCart(false);
  };

  const saveProduct = async () => {
    if (!brandName || !productName || !price || !storeName) {
      Alert.alert('Error', 'Please fill in all fields');
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

      let storeId: string;
      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('name', storeName)
        .maybeSingle();

      if (existingStore) {
        storeId = existingStore.id;
      } else {
        const { data: newStore, error: storeError } = await supabase
          .from('stores')
          .insert({ name: storeName })
          .select('id')
          .single();

        if (storeError || !newStore) throw storeError;
        storeId = newStore.id;
      }

      let productId: string;
      const { data: existingProduct } = await supabase
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

        const { data: newProduct, error: productError } = await supabase
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

      const { data: previousScans } = await supabase
        .from('scans')
        .select('price, store_id, stores(name)')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .order('scanned_at', { ascending: false })
        .limit(1);

      const { error: scanError } = await supabase.from('scans').insert({
        user_id: user.id,
        product_id: productId,
        store_id: storeId,
        price: parseFloat(price),
      });

      if (scanError) throw scanError;

      if (addToCart) {
        const { data: activeSession } = await supabase
          .from('grocery_sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (activeSession) {
          const { error: cartError } = await supabase.from('cart_items').insert({
            user_id: user.id,
            session_id: activeSession.id,
            product_id: productId,
            price: parseFloat(price),
            quantity: parseInt(quantity) || 1,
          });

          if (cartError) throw cartError;
        }
      }

      if (previousScans && previousScans.length > 0) {
        const previousPrice = previousScans[0].price;
        const previousStore = (previousScans[0].stores as any)?.name;
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

      Alert.alert('Success', 'Product saved successfully!', [{ text: 'OK', onPress: resetScan }]);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {scanStep === 'qr' && (
        <View style={styles.section}>
          <Text style={styles.title}>Scan Product</Text>
          <Text style={styles.description}>
            Start by scanning the product's QR code or barcode to track its price
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter store name"
              value={storeName}
              onChangeText={setStoreName}
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAddToCart(!addToCart)}>
            <View style={[styles.checkbox, addToCart && styles.checkboxChecked]}>
              {addToCart && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Add to active shopping cart</Text>
          </TouchableOpacity>

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
    backgroundColor: '#10b981',
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
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 14,
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 14,
    flex: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  flexButton: {
    flex: 2,
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
    padding: 16,
    paddingTop: 48,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#10b981',
    borderRadius: 16,
  },
  cameraFooter: {
    padding: 32,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    padding: 5,
  },
  captureButtonInner: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: '#10b981',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#374151',
  },
});
