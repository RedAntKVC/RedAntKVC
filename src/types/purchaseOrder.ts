export type OrderType =
  | '進貨單'
  | '退貨單'
  | '後補單'
  | '物流單'
  | '物流退單'
  | '教圖單'
  | '教圖退單'
  | '培進單'
  | '培進退單';

export type SchoolLevel = '小學' | '中學' | '幼稚園' | '大專' | '其他';

export type ApprovalStatus =
  | '待處理'
  | '已批核'
  | '不批核需修正'
  | '轉交財務部';

export type UserRole = '門市' | '批核者' | '財務部';

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  branch: string;
  supplier: string;
  schoolLevel: SchoolLevel;
  uploadDate: Date;
  approvalStatus: ApprovalStatus;
  approvalDate?: Date;
  approvalNote: string;
  submittedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ORDER_TYPES: OrderType[] = [
  '進貨單', '退貨單', '後補單',
  '物流單', '物流退單',
  '教圖單', '教圖退單',
  '培進單', '培進退單',
];

export const SCHOOL_LEVELS: SchoolLevel[] = ['小學', '中學', '幼稚園', '大專', '其他'];

export const BRANCHES = [
  '康怡分館', '青衣分店', '大埔分館', '沙田分館', '屯門分館',
  '將軍澳分館', '元朗分館', '荃灣分館', '總館',
];

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  待處理: '#F59E0B',
  已批核: '#10B981',
  不批核需修正: '#EF4444',
  轉交財務部: '#8B5CF6',
};
