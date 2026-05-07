import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Order, OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../types/order';
import { StatusBadge } from '../components/StatusBadge';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;
  route: RouteProp<RootStackParamList, 'OrderDetail'>;
  orders: Order[];
  onStatusChange: (id: string, status: OrderStatus) => void;
};

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function OrderDetailScreen({ navigation, route, orders, onStatusChange }: Props) {
  const [updating, setUpdating] = useState(false);
  const order = orders.find((o) => o.id === route.params.orderId);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>找不到此訂單</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>返回列表</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const nextStatuses = STATUS_TRANSITIONS[order.status];

  async function handleStatusChange(newStatus: OrderStatus) {
    const label = ORDER_STATUS_LABELS[newStatus];
    const confirm = () => {
      setUpdating(true);
      onStatusChange(order!.id, newStatus);
      setUpdating(false);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`確定要將訂單狀態更新為「${label}」嗎？`)) confirm();
    } else {
      Alert.alert('確認更新', `確定要將訂單狀態更新為「${label}」嗎？`, [
        { text: '取消', style: 'cancel' },
        { text: '確定', onPress: confirm },
      ]);
    }
  }

  const createdStr = order.createdAt.toLocaleString('zh-TW');
  const updatedStr = order.updatedAt.toLocaleString('zh-TW');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBack}>
          <Text style={styles.goBackIcon}>←</Text>
          <Text style={styles.goBackText}>返回</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <Text style={styles.createdAt}>{createdStr}</Text>
            </View>
            <StatusBadge status={order.status} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>客戶資訊</Text>
          <View style={styles.card}>
            <InfoRow label="客戶姓名" value={order.customerName} />
            <InfoRow label="聯絡電話" value={order.customerPhone} />
            {order.note ? <InfoRow label="備註" value={order.note} /> : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>訂購商品</Text>
          <View style={styles.card}>
            {order.items.map((item, i) => (
              <View key={i} style={[styles.itemRow, i < order.items.length - 1 && styles.itemBorder]}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>x {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  NT$ {(item.unitPrice * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>總金額</Text>
              <Text style={styles.totalAmount}>NT$ {order.totalAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {nextStatuses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>更新狀態</Text>
            <View style={styles.actionRow}>
              {nextStatuses.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.actionButton, { backgroundColor: ORDER_STATUS_COLORS[s] }, updating && styles.actionButtonDisabled]}
                  onPress={() => handleStatusChange(s)}
                  disabled={updating}
                >
                  <Text style={styles.actionButtonText}>
                    {ORDER_STATUS_LABELS[s]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.updatedAt}>最後更新：{updatedStr}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topBar: {
    backgroundColor: '#C8102E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'web' ? 20 : 12,
  },
  goBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goBackIcon: {
    fontSize: 18,
    color: '#fff',
  },
  goBackText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  createdAt: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: '#9CA3AF',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
  },
  itemQty: {
    fontSize: 13,
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C8102E',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  updatedAt: {
    textAlign: 'center',
    fontSize: 11,
    color: '#D1D5DB',
    marginTop: 24,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#C8102E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
