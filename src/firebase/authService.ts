import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updatePassword,
} from 'firebase/auth';
import {
  collection, doc, setDoc, getDoc, updateDoc, getDocs, Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { AppUser } from '../types/auth';

const auth = getAuth();
const COL = 'users';

// username → email 格式（Firebase Auth 需要 email 格式）
function toEmail(username: string) {
  return `${username.toLowerCase()}@ordersys.internal`;
}

export async function firebaseLogin(username: string, password: string): Promise<AppUser> {
  const cred = await signInWithEmailAndPassword(auth, toEmail(username), password);
  const snap = await getDoc(doc(db, COL, cred.user.uid));
  if (!snap.exists()) throw new Error('找不到用戶資料');
  const d = snap.data();
  return {
    id: cred.user.uid,
    username: d.username,
    displayName: d.displayName,
    role: d.role,
    branch: d.branch,
    isActive: d.isActive,
    createdAt: d.createdAt?.toDate() ?? new Date(),
  };
}

export async function firebaseLogout() {
  await signOut(auth);
}

export async function firebaseCreateUser(
  username: string,
  password: string,
  profile: Omit<AppUser, 'id' | 'createdAt'>
): Promise<void> {
  const cred = await createUserWithEmailAndPassword(auth, toEmail(username), password);
  await setDoc(doc(db, COL, cred.user.uid), {
    ...profile,
    username,
    createdAt: Timestamp.now(),
  });
}

export async function firebaseListUsers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      username: data.username,
      displayName: data.displayName,
      role: data.role,
      branch: data.branch,
      isActive: data.isActive,
      createdAt: data.createdAt?.toDate() ?? new Date(),
    };
  });
}

export async function firebaseToggleUserActive(uid: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, COL, uid), { isActive });
}
