import { AppUser } from '../types/auth';

// 密碼在 mock 模式下明文儲存（正式環境使用 Firebase Auth）
export interface MockUserRecord extends AppUser {
  password: string;
}

export const MOCK_USERS: MockUserRecord[] = [
  {
    id: 'u001',
    username: 'admin',
    password: 'Admin@1234',
    displayName: '系統管理員',
    role: '批核者',
    isActive: true,
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'u002',
    username: 'finance01',
    password: 'Finance@1234',
    displayName: '財務部－李主任',
    role: '財務部',
    isActive: true,
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'u003',
    username: 'kangyi01',
    password: 'Branch@1234',
    displayName: '陳小文',
    role: '門市',
    branch: '康怡分館',
    isActive: true,
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'u004',
    username: 'tsuenwan01',
    password: 'Branch@1234',
    displayName: '李大明',
    role: '門市',
    branch: '青衣分店',
    isActive: true,
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'u005',
    username: 'taipo01',
    password: 'Branch@1234',
    displayName: '王志強',
    role: '門市',
    branch: '大埔分館',
    isActive: true,
    createdAt: new Date('2026-01-01'),
  },
];
