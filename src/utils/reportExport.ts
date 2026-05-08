import { PurchaseOrder, ApprovalStatus } from '../types/purchaseOrder';
import { Platform } from 'react-native';

function escapeCSV(val: string | number | undefined): string {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toRow(fields: (string | number | undefined)[]): string {
  return fields.map(escapeCSV).join(',');
}

function formatDate(d?: Date): string {
  if (!d) return '';
  return d.toLocaleDateString('zh-TW');
}

export interface ReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  branch?: string;
  status?: ApprovalStatus;
}

// ── 批核統計報表 ───────────────────────────────────────────────────────────────
export function generateApprovalStatsCSV(orders: PurchaseOrder[], filters: ReportFilters): string {
  const filtered = applyFilters(orders, filters);
  const statuses: ApprovalStatus[] = ['待處理', '已批核', '不批核需修正', '轉交財務部'];
  const orderTypes = [...new Set(filtered.map((o) => o.orderType))].sort();

  const header = toRow(['訂單類別', ...statuses, '合計']);
  const rows = orderTypes.map((type) => {
    const subset = filtered.filter((o) => o.orderType === type);
    const counts = statuses.map((s) => subset.filter((o) => o.approvalStatus === s).length);
    return toRow([type, ...counts, subset.length]);
  });

  const totals = statuses.map((s) => filtered.filter((o) => o.approvalStatus === s).length);
  const totalRow = toRow(['合計', ...totals, filtered.length]);

  return ['﻿' + header, ...rows, totalRow].join('\n');
}

// ── 門市彙總報表 ───────────────────────────────────────────────────────────────
export function generateBranchSummaryCSV(orders: PurchaseOrder[], filters: ReportFilters): string {
  const filtered = applyFilters(orders, filters);
  const branches = [...new Set(filtered.map((o) => o.branch))].sort();

  const header = toRow(['門市', '待處理', '已批核', '不批核需修正', '轉交財務部', '合計']);
  const rows = branches.map((branch) => {
    const subset = filtered.filter((o) => o.branch === branch);
    return toRow([
      branch,
      subset.filter((o) => o.approvalStatus === '待處理').length,
      subset.filter((o) => o.approvalStatus === '已批核').length,
      subset.filter((o) => o.approvalStatus === '不批核需修正').length,
      subset.filter((o) => o.approvalStatus === '轉交財務部').length,
      subset.length,
    ]);
  });

  return ['﻿' + header, ...rows].join('\n');
}

// ── 財務部待審報表 ─────────────────────────────────────────────────────────────
export function generateFinancePendingCSV(orders: PurchaseOrder[]): string {
  const filtered = orders.filter((o) => o.approvalStatus === '轉交財務部');

  const header = toRow([
    '採購單號碼', '訂單類別', '門市', '供應商編號', '學校級別',
    '上載日期', '轉交日期', '備註',
  ]);
  const rows = filtered.map((o) =>
    toRow([
      o.orderNumber, o.orderType, o.branch, o.supplier, o.schoolLevel,
      formatDate(o.uploadDate), formatDate(o.approvalDate), o.approvalNote,
    ])
  );

  return ['﻿' + header, ...rows].join('\n');
}

// ── 訂單明細報表 ───────────────────────────────────────────────────────────────
export function generateOrderDetailCSV(orders: PurchaseOrder[], filters: ReportFilters): string {
  const filtered = applyFilters(orders, filters);

  const header = toRow([
    '採購單號碼', '訂單類別', '門市', '供應商編號', '學校級別',
    '上載日期', '批核狀態', '批核日期', '批核備註', '提交人',
  ]);
  const rows = filtered.map((o) =>
    toRow([
      o.orderNumber, o.orderType, o.branch, o.supplier, o.schoolLevel,
      formatDate(o.uploadDate), o.approvalStatus,
      formatDate(o.approvalDate), o.approvalNote, o.submittedBy,
    ])
  );

  return ['﻿' + header, ...rows].join('\n');
}

function applyFilters(orders: PurchaseOrder[], filters: ReportFilters): PurchaseOrder[] {
  return orders.filter((o) => {
    if (filters.branch && o.branch !== filters.branch) return false;
    if (filters.status && o.approvalStatus !== filters.status) return false;
    if (filters.dateFrom && o.uploadDate < filters.dateFrom) return false;
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setDate(end.getDate() + 1);
      if (o.uploadDate >= end) return false;
    }
    return true;
  });
}

export function downloadCSV(filename: string, csv: string): void {
  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  // On native, expo-sharing would be used — placeholder for now
}
