import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ApprovalStatus, APPROVAL_STATUS_COLORS } from '../types/purchaseOrder';

interface Props {
  status: ApprovalStatus;
  size?: 'small' | 'medium';
}

export function ApprovalStatusBadge({ status, size = 'medium' }: Props) {
  const color = APPROVAL_STATUS_COLORS[status];
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }, isSmall && styles.small]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }, isSmall && styles.smallText]}>{status}</Text>
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
  small: { paddingHorizontal: 7, paddingVertical: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  label: { fontSize: 13, fontWeight: '600' },
  smallText: { fontSize: 11 },
});
