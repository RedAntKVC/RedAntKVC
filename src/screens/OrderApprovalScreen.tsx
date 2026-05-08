import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Platform, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { PurchaseOrder, ApprovalStatus, APPROVAL_STATUS_COLORS } from '../types/purchaseOrder';
import { ApprovalStatusBadge } from '../components/ApprovalStatusBadge';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;
  route: RouteProp<RootStackParamList, 'OrderDetail'>;
  orders: PurchaseOrder[];
  userRole: string;
  onApprove: (id: string, status: ApprovalStatus, note: string) => void;
};

const APPROVAL_ACTIONS: { status: ApprovalStatus; label: string; icon: string }[] = [
  { status: '已批核', label: '批核通過', icon: '✓' },
  { status: '不批核需修正', label: '不批核／需修正', icon: '✗' },
  { status: '轉交財務部', label: '轉交財務部', icon: '→' },
];

export function OrderApprovalScreen({ navigation, route, orders, userRole, onApprove }: Props) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const order = orders.find((o) => o.id === route.params.orderId);
  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#6B7280' }}>找不到此採購單</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canApprove = userRole === '批核者' && order.approvalStatus === '待處理';
  const canFinanceApprove = userRole === '財務部' && order.approvalStatus === '轉交財務部';

  function confirm(status: ApprovalStatus) {
    const label = status;
    const act = () => {
      setSubmitting(true);
      onApprove(order!.id, status, note);
      setSubmitting(false);
      navigation.goBack();
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`確定將此採購單標記為「${label}」？`)) act();
    } else {
      Alert.alert('確認操作', `確定將此採購單標記為「${label}」？`, [
        { text: '取消', style: 'cancel' },
        { text: '確定', onPress: act },
      ]);
    }
  }

  const dateStr = (d?: Date) => d?.toLocaleDateString('zh-TW') ?? '-';
  const datetimeStr = (d?: Date) => d?.toLocaleString('zh-TW') ?? '-';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>採購單詳情</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 基本資訊 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderNum}>{order.orderNumber}</Text>
            <ApprovalStatusBadge status={order.approvalStatus} />
          </View>
          <View style={styles.divider} />
          <Row label="訂單類別" value={order.orderType} />
          <Row label="門市" value={order.branch} />
          <Row label="供應商編號" value={order.supplier} />
          <Row label="學校級別" value={order.schoolLevel} />
          <Row label="上載日期" value={dateStr(order.uploadDate)} />
          <Row label="提交人" value={order.submittedBy} />
          <Row label="提交時間" value={datetimeStr(order.createdAt)} />
        </View>

        {/* 批核記錄 */}
        {order.approvalStatus !== '待處理' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>批核記錄</Text>
            <View style={styles.card}>
              <Row label="批核結果" value={order.approvalStatus} valueColor={APPROVAL_STATUS_COLORS[order.approvalStatus]} />
              <Row label="批核日期" value={datetimeStr(order.approvalDate)} />
              {order.approvalNote ? <Row label="備註" value={order.approvalNote} /> : null}
            </View>
          </View>
        )}

        {/* 批核操作 */}
        {(canApprove || canFinanceApprove) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {canFinanceApprove ? '財務部審批' : '批核操作'}
            </Text>
            <View style={styles.card}>
              <Text style={styles.noteLabel}>備註（選填）</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="輸入批核備註或原因..."
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
              />
              <View style={styles.actionButtons}>
                {(canFinanceApprove
                  ? [APPROVAL_ACTIONS[0], APPROVAL_ACTIONS[1]]
                  : APPROVAL_ACTIONS
                ).map((action) => (
                  <TouchableOpacity
                    key={action.status}
                    style={[
                      styles.actionBtn,
                      { backgroundColor: APPROVAL_STATUS_COLORS[action.status] },
                      submitting && styles.disabled,
                    ]}
                    onPress={() => confirm(action.status)}
                    disabled={submitting}
                  >
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        <Text style={styles.updateTime}>最後更新：{datetimeStr(order.updatedAt)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor, fontWeight: '700' } : null]}>{value}</Text>
    </View>
  );
}

const BRAND = '#C8102E';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  topBar: {
    backgroundColor: BRAND,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'web' ? 20 : 12,
  },
  back: { width: 60 },
  backText: { color: '#fff', fontSize: 14 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderNum: { fontSize: 18, fontWeight: '700', color: '#111827' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 10 },
  row: { flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  rowLabel: { width: 88, fontSize: 13, color: '#9CA3AF' },
  rowValue: { flex: 1, fontSize: 13, color: '#1F2937' },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, paddingHorizontal: 4 },
  noteLabel: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#374151',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  actionButtons: { gap: 10 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 10,
    gap: 8,
  },
  actionIcon: { color: '#fff', fontSize: 16, fontWeight: '700' },
  actionLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  updateTime: { textAlign: 'center', fontSize: 11, color: '#D1D5DB', marginTop: 24 },
});
