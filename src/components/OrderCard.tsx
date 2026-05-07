import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Order } from '../types/order';
import { StatusBadge } from './StatusBadge';

interface Props {
  order: Order;
  onPress: () => void;
}

export function OrderCard({ order, onPress }: Props) {
  const dateStr = order.createdAt.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        <StatusBadge status={order.status} size="small" />
      </View>
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.label}>客戶</Text>
          <Text style={styles.value}>{order.customerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>電話</Text>
          <Text style={styles.value}>{order.customerPhone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>商品</Text>
          <Text style={styles.value} numberOfLines={1}>
            {order.items.map((i) => i.name).join('、')}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.date}>{dateStr}</Text>
        <Text style={styles.amount}>NT$ {order.totalAmount.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  body: {
    gap: 4,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#9CA3AF',
    width: 36,
  },
  value: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C8102E',
  },
});
