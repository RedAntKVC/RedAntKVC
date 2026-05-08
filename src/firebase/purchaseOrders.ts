import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { PurchaseOrder, ApprovalStatus } from '../types/purchaseOrder';

const COL = 'purchaseOrders';

function toOrder(id: string, d: any): PurchaseOrder {
  return {
    id,
    orderNumber: d.orderNumber,
    orderType: d.orderType,
    branch: d.branch,
    supplier: d.supplier,
    schoolLevel: d.schoolLevel,
    uploadDate: d.uploadDate?.toDate() ?? new Date(),
    approvalStatus: d.approvalStatus,
    approvalDate: d.approvalDate?.toDate(),
    approvalNote: d.approvalNote || '',
    submittedBy: d.submittedBy,
    createdAt: d.createdAt?.toDate() ?? new Date(),
    updatedAt: d.updatedAt?.toDate() ?? new Date(),
  };
}

export function subscribePurchaseOrders(cb: (orders: PurchaseOrder[]) => void) {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => toOrder(d.id, d.data()))));
}

export async function createPurchaseOrder(
  order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = Timestamp.now();
  const ref = await addDoc(collection(db, COL), { ...order, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function approvePurchaseOrder(
  id: string,
  status: ApprovalStatus,
  note: string
): Promise<void> {
  const now = Timestamp.now();
  await updateDoc(doc(db, COL, id), {
    approvalStatus: status,
    approvalNote: note,
    approvalDate: status !== '待處理' ? now : null,
    updatedAt: now,
  });
}

export async function batchImportOrders(orders: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
  const batch = writeBatch(db);
  const now = Timestamp.now();
  orders.forEach((o) => {
    const ref = doc(collection(db, COL));
    batch.set(ref, { ...o, createdAt: now, updatedAt: now });
  });
  await batch.commit();
}
