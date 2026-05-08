import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppUser, LoginCredentials } from '../types/auth';
import { MOCK_USERS, MockUserRecord } from '../data/mockUsers';

// ── Mock 認證邏輯 ──────────────────────────────────────────────────────────────
// 替換成 Firebase 時，改用 src/firebase/authService.ts 的函數即可

let mockUserStore: MockUserRecord[] = [...MOCK_USERS];

function mockLogin(username: string, password: string): AppUser {
  const user = mockUserStore.find(
    (u) => u.username === username && u.password === password && u.isActive
  );
  if (!user) throw new Error('帳號或密碼不正確，或帳號已停用');
  const { password: _, ...rest } = user;
  return rest;
}

function mockCreateUser(
  record: MockUserRecord
): void {
  if (mockUserStore.find((u) => u.username === record.username)) {
    throw new Error('此帳號名稱已存在');
  }
  mockUserStore = [...mockUserStore, record];
}

function mockListUsers(): AppUser[] {
  return mockUserStore.map(({ password: _, ...u }) => u);
}

function mockToggleActive(id: string, isActive: boolean): void {
  mockUserStore = mockUserStore.map((u) => (u.id === id ? { ...u, isActive } : u));
}

// ── Context ───────────────────────────────────────────────────────────────────

interface AuthContextValue {
  currentUser: AppUser | null;
  login: (creds: LoginCredentials) => Promise<void>;
  logout: () => void;
  createUser: (record: MockUserRecord) => Promise<void>;
  listUsers: () => AppUser[];
  toggleUserActive: (id: string, isActive: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  const login = useCallback(async ({ username, password }: LoginCredentials) => {
    const user = mockLogin(username, password);
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const createUser = useCallback(async (record: MockUserRecord) => {
    mockCreateUser(record);
  }, []);

  const listUsers = useCallback(() => mockListUsers(), []);

  const toggleUserActive = useCallback((id: string, isActive: boolean) => {
    mockToggleActive(id, isActive);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, createUser, listUsers, toggleUserActive }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
