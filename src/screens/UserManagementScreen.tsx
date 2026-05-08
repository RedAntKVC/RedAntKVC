import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Platform, Alert, Switch,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AppUser } from '../types/auth';
import { MockUserRecord } from '../data/mockUsers';
import { UserRole, BRANCHES } from '../types/purchaseOrder';

const ROLES: UserRole[] = ['門市', '批核者', '財務部'];

export function UserManagementScreen() {
  const { createUser, listUsers, toggleUserActive, currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>(() => listUsers());
  const [showForm, setShowForm] = useState(false);

  // 新增帳號表單
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: '門市' as UserRole,
    branch: BRANCHES[0],
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validateForm(): string | null {
    if (!form.username.trim()) return '請輸入帳號名稱';
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(form.username)) return '帳號只可用英文、數字及底線（4-20字）';
    if (!form.displayName.trim()) return '請輸入顯示名稱';
    if (form.password.length < 8) return '密碼最少需要 8 個字元';
    if (form.password !== form.confirmPassword) return '兩次密碼輸入不一致';
    if (form.role === '門市' && !form.branch) return '門市同事必須選擇所屬門市';
    return null;
  }

  async function handleCreate() {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setFormError('');
    setSubmitting(true);
    try {
      const record: MockUserRecord = {
        id: `u${Date.now()}`,
        username: form.username.trim(),
        password: form.password,
        displayName: form.displayName.trim(),
        role: form.role,
        branch: form.role === '門市' ? form.branch : undefined,
        isActive: true,
        createdAt: new Date(),
      };
      await createUser(record);
      setUsers(listUsers());
      setShowForm(false);
      setForm({ username: '', password: '', confirmPassword: '', displayName: '', role: '門市', branch: BRANCHES[0] });
      if (Platform.OS === 'web') { window.alert('帳號已建立'); } else { Alert.alert('成功', '帳號已建立'); }
    } catch (e: any) {
      setFormError(e.message ?? '建立失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  }

  function handleToggle(user: AppUser) {
    const newState = !user.isActive;
    toggleUserActive(user.id, newState);
    setUsers(listUsers());
  }

  const roleColor: Record<UserRole, string> = { 門市: '#3B82F6', 批核者: '#C8102E', 財務部: '#8B5CF6' };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>帳號管理</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
          <Text style={styles.addBtnText}>{showForm ? '取消' : '+ 新增帳號'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 新增帳號表單 */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>新增帳號</Text>

            {formError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {formError}</Text>
              </View>
            ) : null}

            <FormField label="帳號名稱（英文/數字）">
              <TextInput
                style={styles.input}
                placeholder="e.g. branch001"
                value={form.username}
                onChangeText={(v) => setForm((f) => ({ ...f, username: v }))}
                autoCapitalize="none"
              />
            </FormField>

            <FormField label="顯示名稱">
              <TextInput
                style={styles.input}
                placeholder="e.g. 陳大文"
                value={form.displayName}
                onChangeText={(v) => setForm((f) => ({ ...f, displayName: v }))}
              />
            </FormField>

            <FormField label="角色">
              <View style={styles.roleRow}>
                {ROLES.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChip, form.role === r && { backgroundColor: roleColor[r] }]}
                    onPress={() => setForm((f) => ({ ...f, role: r }))}
                  >
                    <Text style={[styles.roleChipText, form.role === r && styles.roleChipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FormField>

            {form.role === '門市' && (
              <FormField label="所屬門市">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.branchRow}>
                    {BRANCHES.map((b) => (
                      <TouchableOpacity
                        key={b}
                        style={[styles.branchChip, form.branch === b && styles.branchChipActive]}
                        onPress={() => setForm((f) => ({ ...f, branch: b }))}
                      >
                        <Text style={[styles.branchText, form.branch === b && styles.branchTextActive]}>{b}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </FormField>
            )}

            <FormField label="密碼（最少 8 字）">
              <TextInput
                style={styles.input}
                placeholder="設定密碼"
                value={form.password}
                onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
                secureTextEntry
              />
            </FormField>

            <FormField label="確認密碼">
              <TextInput
                style={styles.input}
                placeholder="再次輸入密碼"
                value={form.confirmPassword}
                onChangeText={(v) => setForm((f) => ({ ...f, confirmPassword: v }))}
                secureTextEntry
              />
            </FormField>

            <TouchableOpacity
              style={[styles.createBtn, submitting && { opacity: 0.5 }]}
              onPress={handleCreate}
              disabled={submitting}
            >
              <Text style={styles.createBtnText}>{submitting ? '建立中...' : '建立帳號'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 現有帳號列表 */}
        <Text style={styles.listTitle}>現有帳號（{users.length}）</Text>
        {users.map((user) => (
          <View key={user.id} style={[styles.userCard, !user.isActive && styles.userCardInactive]}>
            <View style={styles.userLeft}>
              <View style={[styles.roleTag, { backgroundColor: roleColor[user.role] + '20', borderColor: roleColor[user.role] }]}>
                <Text style={[styles.roleTagText, { color: roleColor[user.role] }]}>{user.role}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{user.displayName}</Text>
                <Text style={styles.userUsername}>@{user.username}</Text>
                {user.branch && <Text style={styles.userBranch}>{user.branch}</Text>}
              </View>
            </View>
            {user.id !== currentUser?.id && (
              <View style={styles.userRight}>
                <Text style={styles.toggleLabel}>{user.isActive ? '啟用' : '停用'}</Text>
                <Switch
                  value={user.isActive}
                  onValueChange={() => handleToggle(user)}
                  trackColor={{ true: '#10B981', false: '#E5E7EB' }}
                  thumbColor="#fff"
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const BRAND = '#C8102E';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  topBar: {
    backgroundColor: BRAND,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: Platform.OS === 'web' ? 20 : 14,
  },
  topTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  addBtn: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText: { color: BRAND, fontWeight: '700', fontSize: 13 },
  scroll: { padding: 16, paddingBottom: 40 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 8, padding: 10, marginBottom: 14, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { fontSize: 13, color: '#DC2626' },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#F9FAFB',
  },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F3F4F6' },
  roleChipText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  roleChipTextActive: { color: '#fff' },
  branchRow: { flexDirection: 'row', gap: 6 },
  branchChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#F3F4F6' },
  branchChipActive: { backgroundColor: '#1F2937' },
  branchText: { fontSize: 12, color: '#6B7280' },
  branchTextActive: { color: '#fff', fontWeight: '600' },
  createBtn: { backgroundColor: BRAND, borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 6 },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  listTitle: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  userCardInactive: { opacity: 0.5 },
  userLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  roleTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  roleTagText: { fontSize: 11, fontWeight: '700' },
  userName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  userUsername: { fontSize: 12, color: '#9CA3AF' },
  userBranch: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  userRight: { alignItems: 'center', gap: 2 },
  toggleLabel: { fontSize: 10, color: '#9CA3AF' },
});
