import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../types/order';

interface Props {
  status: OrderStatus;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, size = 'medium' }: Props) {
  const color = ORDER_STATUS_COLORS[status];
  const label = ORDER_STATUS_LABELS[status];
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }, isSmall && styles.badgeSmall]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }, isSmall && styles.labelSmall]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: 11,
  },
});
