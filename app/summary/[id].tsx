import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';
import { ArrowLeft, Share2 } from 'lucide-react-native';

type SummaryItem = {
  id: string;
  price: number;
  quantity: number;
  products: {
    name: string;
    brand: string | null;
    image_url: string | null;
  };
};

type Summary = {
  id: string;
  total_amount: number;
  item_count: number;
  store_name: string | null;
  completed_at: string;
  items: SummaryItem[];
};

export default function SummaryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    if (!id) return;
    type CheckoutItemRow = {
      id: string;
      price: number;
      quantity: number;
      products: { name: string; brand: string | null; image_url: string | null };
    };
    type CheckoutSessionRow = {
      id: string;
      total_amount: number;
      item_count: number;
      store_name: string | null;
      completed_at: string;
      checkout_items: CheckoutItemRow[] | null;
    };

    const { data, error } = await supabase
      .from('checkout_sessions')
      .select(`
        id,
        total_amount,
        item_count,
        store_name,
        completed_at,
        checkout_items (
          id,
          price,
          quantity,
          products ( name, brand, image_url )
        )
      `)
      .eq('id', id)
      .maybeSingle<CheckoutSessionRow>();

    if (!error && data) {
      setSummary({
        id: data.id,
        total_amount: data.total_amount,
        item_count: data.item_count,
        store_name: data.store_name,
        completed_at: data.completed_at,
        items: data.checkout_items || [],
      });
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const exportReceipt = async () => {
    if (!summary) return;
    const lines = [
      `Store: ${summary.store_name || 'Unknown'}`,
      `Date: ${formatDate(summary.completed_at)}`,
      `Total: $${summary.total_amount.toFixed(2)}`,
      '',
      'Items:',
      ...summary.items.map(
        (i) => `- ${i.products.brand ? i.products.brand + ' - ' : ''}${i.products.name} x${i.quantity} - $${i.price.toFixed(2)}`
      ),
    ].join('\n');
    await Share.share({ message: lines });
  };

  if (!summary) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Grocery Summary</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#6b7280' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grocery Summary</Text>
        <TouchableOpacity onPress={exportReceipt}>
          <Share2 size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.summaryCard}>
          <View style={styles.row}> 
            <Text style={styles.rowLabel}>Store</Text>
            <Text style={styles.rowValueStrong}>{summary.store_name || 'Unknown'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}> 
            <Text style={styles.rowLabel}>Date</Text>
            <Text style={styles.rowValueStrong}>{formatDate(summary.completed_at)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}> 
            <Text style={styles.rowLabel}>Total Amount</Text>
            <Text style={styles.rowValueStrong}>${summary.total_amount.toFixed(2)}</Text>
          </View>
          <View style={styles.rowLast}> 
            <Text style={styles.rowLabel}>Items</Text>
            <Text style={styles.rowValueStrong}>{summary.item_count}</Text>
          </View>
        </View>

        {summary.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Image
              source={{ uri: item.products.image_url || undefined }}
              style={styles.itemImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>
                {item.products.brand ? item.products.brand + ' - ' : ''}
                {item.products.name}
              </Text>
              <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.exportBtn} onPress={exportReceipt}>
          <Share2 size={20} color="#fff" />
          <Text style={styles.exportText}>Export Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'transparent',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll: { padding: 16, paddingBottom: 120 },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  rowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowLabel: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
  rowValueStrong: { fontSize: 14, color: '#111827', fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#e5e7eb' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  itemImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#f3f4f6' },
  itemName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  itemQty: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: '700', color: '#111827' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f6f8f6',
    paddingBottom: 24,
    paddingTop: 12,
    alignItems: 'center',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
    backgroundColor: '#ff00ff',
  },
  exportText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});


