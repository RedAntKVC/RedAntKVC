import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Platform, Alert,
} from 'react-native';
import { PurchaseOrder, BRANCHES, ApprovalStatus } from '../types/purchaseOrder';
import {
  generateApprovalStatsCSV, generateBranchSummaryCSV,
  generateFinancePendingCSV, generateOrderDetailCSV, downloadCSV,
} from '../utils/reportExport';

type Props = { orders: PurchaseOrder[] };

type ReportType = '批核統計' | '門市彙總' | '財務待審' | '訂單明細';

const REPORTS: { type: ReportType; icon: string; desc: string }[] = [
  { type: '批核統計', icon: '📊', desc: '各訂單類別的批核數量統計' },
  { type: '門市彙總', icon: '🏪', desc: '各門市的訂單及批核狀況' },
  { type: '財務待審', icon: '💼', desc: '轉交財務部尚待審批的訂單清單' },
  { type: '訂單明細', icon: '📋', desc: '所有訂單完整明細記錄' },
];

export function ReportsScreen({ orders }: Props) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [branchFilter, setBranchFilter] = useState('全部');
  const [generating, setGenerating] = useState<ReportType | null>(null);

  function getFilters() {
    return {
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      branch: branchFilter === '全部' ? undefined : branchFilter,
    };
  }

  function handleExport(type: ReportType) {
    if (Platform.OS !== 'web') {
      Alert.alert('提示', '報表匯出目前僅支援網頁版，手機版即將推出');
      return;
    }
    setGenerating(type);
    const filters = getFilters();
    const now = new Date().toISOString().split('T')[0];
    let csv = '';
    let filename = '';

    switch (type) {
      case '批核統計':
        csv = generateApprovalStatsCSV(orders, filters);
        filename = `批核統計_${now}.csv`;
        break;
      case '門市彙總':
        csv = generateBranchSummaryCSV(orders, filters);
        filename = `門市彙總_${now}.csv`;
        break;
      case '財務待審':
        csv = generateFinancePendingCSV(orders);
        filename = `財務待審_${now}.csv`;
        break;
      case '訂單明細':
        csv = generateOrderDetailCSV(orders, filters);
        filename = `訂單明細_${now}.csv`;
        break;
    }

    downloadCSV(filename, csv);
    setGenerating(null);
  }

  // Summary stats
  const pending = orders.filter((o) => o.approvalStatus === '待處理').length;
  const approved = orders.filter((o) => o.approvalStatus === '已批核').length;
  const rejected = orders.filter((o) => o.approvalStatus === '不批核需修正').length;
  const finance = orders.filter((o) => o.approvalStatus === '轉交財務部').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>報表中心</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 快速統計 */}
        <View style={styles.statsGrid}>
          <StatCard label="待處理" count={pending} color="#F59E0B" />
          <StatCard label="已批核" count={approved} color="#10B981" />
          <StatCard label="需修正" count={rejected} color="#EF4444" />
          <StatCard label="轉財務" count={finance} color="#8B5CF6" />
        </View>

        {/* 篩選條件 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>篩選條件</Text>
          <View style={styles.card}>
            <FilterRow label="上載日期 由" placeholder="YYYY-MM-DD" value={dateFrom} onChange={setDateFrom} />
            <FilterRow label="上載日期 至" placeholder="YYYY-MM-DD" value={dateTo} onChange={setDateTo} />
            <View style={styles.branchRow}>
              <Text style={styles.filterLabel}>門市</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.branchScroll}>
                {['全部', ...BRANCHES].map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.branchChip, branchFilter === b && styles.branchChipActive]}
                    onPress={() => setBranchFilter(b)}
                  >
                    <Text style={[styles.branchChipText, branchFilter === b && styles.branchChipTextActive]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* 報表按鈕 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>匯出報表（CSV）</Text>
          <View style={styles.reportGrid}>
            {REPORTS.map((r) => (
              <TouchableOpacity
                key={r.type}
                style={[styles.reportCard, generating === r.type && styles.reportCardDisabled]}
                onPress={() => handleExport(r.type)}
                disabled={generating === r.type}
              >
                <Text style={styles.reportIcon}>{r.icon}</Text>
                <Text style={styles.reportType}>{r.type}</Text>
                <Text style={styles.reportDesc}>{r.desc}</Text>
                <View style={styles.exportBtn}>
                  <Text style={styles.exportBtnText}>
                    {generating === r.type ? '產生中...' : '匯出 CSV'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {Platform.OS !== 'web' && (
          <Text style={styles.webNote}>
            📌 報表匯出功能請使用網頁版（電腦）操作
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FilterRow({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  const { TextInput } = require('react-native');
  return (
    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>{label}</Text>
      <TextInput
        style={styles.filterInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
      />
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
  },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  scroll: { padding: 16, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  statCount: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, paddingHorizontal: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  filterLabel: { width: 80, fontSize: 13, color: '#6B7280' },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 36,
    fontSize: 13,
    color: '#374151',
  },
  branchRow: { flexDirection: 'row', alignItems: 'center' },
  branchScroll: { flex: 1 },
  branchChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 6,
  },
  branchChipActive: { backgroundColor: BRAND },
  branchChipText: { fontSize: 12, color: '#6B7280' },
  branchChipTextActive: { color: '#fff', fontWeight: '600' },
  reportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: Platform.OS === 'web' ? '47%' : '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  reportCardDisabled: { opacity: 0.6 },
  reportIcon: { fontSize: 28, marginBottom: 8 },
  reportType: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  reportDesc: { fontSize: 12, color: '#9CA3AF', marginBottom: 12, lineHeight: 17 },
  exportBtn: { backgroundColor: BRAND, borderRadius: 6, paddingVertical: 8, alignItems: 'center' },
  exportBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  webNote: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 24, lineHeight: 18 },
});
