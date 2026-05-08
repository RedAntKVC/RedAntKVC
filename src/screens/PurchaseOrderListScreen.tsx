import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PurchaseOrder, ApprovalStatus, BRANCHES, ORDER_TYPES, OrderType } from '../types/purchaseOrder';
import { ApprovalStatusBadge } from '../components/ApprovalStatusBadge';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
  orders: PurchaseOrder[];
  userRole: string;
};

const STATUS_TABS: (ApprovalStatus | '全部')[] = ['全部', '待處理', '已批核', '不批核需修正', '轉交財務部'];

export function PurchaseOrderListScreen({ navigation, orders, userRole }: Props) {
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState<ApprovalStatus | '全部'>('全部');
  const [branchFilter, setBranchFilter] = useState('全部門市');
  const [typeFilter, setTypeFilter] = useState<OrderType | '全部類別'>('全部類別');
  const [showBranchPicker, setShowBranchPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (activeStatus !== '全部' && o.approvalStatus !== activeStatus) return false;
      if (branchFilter !== '全部門市' && o.branch !== branchFilter) return false;
      if (typeFilter !== '全部類別' && o.orderType !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !o.orderNumber.includes(q) &&
          !o.branch.includes(q) &&
          !o.supplier.toLowerCase().includes(q) &&
          !o.submittedBy.includes(q)
        ) return false;
      }
      return true;
    });
  }, [orders, activeStatus, branchFilter, typeFilter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { '全部': orders.length };
    orders.forEach((o) => { c[o.approvalStatus] = (c[o.approvalStatus] || 0) + 1; });
    return c;
  }, [orders]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>採購單批核系統</Text>
          <Text style={styles.subtitle}>共 {orders.length} 張單　待處理 {counts['待處理'] || 0} 張</Text>
        </View>
        {(userRole === '門市' || userRole === '批核者') && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('SubmitOrder')}
          >
            <Text style={styles.addBtnText}>+ 提交</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 搜尋 */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜尋採購單號碼、門市、供應商..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* 篩選器 */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowBranchPicker(!showBranchPicker)}>
          <Text style={styles.filterBtnText}>{branchFilter} ▾</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowTypePicker(!showTypePicker)}>
          <Text style={styles.filterBtnText}>{typeFilter} ▾</Text>
        </TouchableOpacity>
      </View>

      {showBranchPicker && (
        <View style={styles.pickerDropdown}>
          {['全部門市', ...BRANCHES].map((b) => (
            <TouchableOpacity key={b} style={styles.pickerItem} onPress={() => { setBranchFilter(b); setShowBranchPicker(false); }}>
              <Text style={[styles.pickerItemText, branchFilter === b && styles.pickerItemActive]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showTypePicker && (
        <View style={styles.pickerDropdown}>
          {(['全部類別', ...ORDER_TYPES] as const).map((t) => (
            <TouchableOpacity key={t} style={styles.pickerItem} onPress={() => { setTypeFilter(t as any); setShowTypePicker(false); }}>
              <Text style={[styles.pickerItemText, typeFilter === t && styles.pickerItemActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 狀態 Tab */}
      <View style={styles.tabRow}>
        {STATUS_TABS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.tab, activeStatus === s && styles.tabActive]}
            onPress={() => setActiveStatus(s)}
          >
            <Text style={[styles.tabText, activeStatus === s && styles.tabTextActive]}>
              {s}{counts[s] != null ? `(${counts[s]})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
            activeOpacity={0.75}
          >
            <View style={styles.cardTop}>
              <Text style={styles.orderNum}>{item.orderNumber}</Text>
              <ApprovalStatusBadge status={item.approvalStatus} size="small" />
            </View>
            <View style={styles.cardMid}>
              <InfoChip label="門市" value={item.branch} />
              <InfoChip label="類別" value={item.orderType} />
              <InfoChip label="學校" value={item.schoolLevel} />
            </View>
            <View style={styles.cardBot}>
              <Text style={styles.metaText}>供應商：{item.supplier}</Text>
              <Text style={styles.metaText}>
                {item.uploadDate.toLocaleDateString('zh-TW')}　{item.submittedBy}
              </Text>
            </View>
            {item.approvalNote ? (
              <Text style={styles.noteText} numberOfLines={1}>備註：{item.approvalNote}</Text>
            ) : null}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>沒有符合條件的採購單</Text>}
      />
    </SafeAreaView>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

const BRAND = '#C8102E';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    backgroundColor: BRAND,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 20 : 8,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  addBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: { color: BRAND, fontWeight: '700', fontSize: 14 },
  searchRow: { padding: 12, paddingBottom: 0 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 8 },
  filterBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  filterBtnText: { fontSize: 12, color: '#374151' },
  pickerDropdown: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 200,
    zIndex: 100,
  },
  pickerItem: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  pickerItemText: { fontSize: 13, color: '#374151' },
  pickerItemActive: { color: BRAND, fontWeight: '700' },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: BRAND },
  tabText: { fontSize: 10, color: '#9CA3AF', textAlign: 'center' },
  tabTextActive: { color: BRAND, fontWeight: '700' },
  list: { padding: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderNum: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  cardMid: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  chip: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 },
  chipLabel: { fontSize: 11, color: '#9CA3AF', marginRight: 4 },
  chipValue: { fontSize: 11, color: '#374151', fontWeight: '600' },
  cardBot: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 11, color: '#9CA3AF' },
  noteText: { fontSize: 11, color: '#F59E0B', marginTop: 4 },
  empty: { textAlign: 'center', paddingTop: 60, color: '#9CA3AF', fontSize: 14 },
});
