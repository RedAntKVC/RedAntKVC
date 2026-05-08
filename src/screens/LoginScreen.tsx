import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!username.trim() || !password) {
      setError('請輸入帳號及密碼');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login({ username: username.trim(), password });
    } catch (e: any) {
      setError(e.message ?? '登入失敗，請重試');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo / 標題區 */}
          <View style={styles.hero}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>📋</Text>
            </View>
            <Text style={styles.appName}>採購單批核系統</Text>
            <Text style={styles.appSub}>Purchase Order Approval System</Text>
          </View>

          {/* 登入表單 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>登入</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>帳號</Text>
            <TextInput
              style={styles.input}
              placeholder="輸入用戶名稱"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Text style={styles.label}>密碼</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="輸入密碼"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPwd(!showPwd)}
              >
                <Text style={styles.eyeIcon}>{showPwd ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.loginBtnText}>登入</Text>
              }
            </TouchableOpacity>
          </View>

          {/* 測試帳號提示（正式上線後移除） */}
          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>測試帳號（示範用）</Text>
            {[
              { role: '批核者', username: 'admin', password: 'Admin@1234' },
              { role: '財務部', username: 'finance01', password: 'Finance@1234' },
              { role: '門市（康怡）', username: 'kangyi01', password: 'Branch@1234' },
            ].map((u) => (
              <TouchableOpacity
                key={u.username}
                style={styles.demoRow}
                onPress={() => { setUsername(u.username); setPassword(u.password); }}
              >
                <Text style={styles.demoRole}>{u.role}</Text>
                <Text style={styles.demoCredential}>{u.username}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const BRAND = '#C8102E';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  hero: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 72,
    height: 72,
    backgroundColor: BRAND,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: { fontSize: 36 },
  appName: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  appSub: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 20 },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { fontSize: 13, color: '#DC2626' },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  passwordRow: { position: 'relative', marginBottom: 24 },
  passwordInput: { marginBottom: 0, paddingRight: 48 },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  eyeIcon: { fontSize: 18 },
  loginBtn: {
    backgroundColor: BRAND,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  demoBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  demoTitle: { fontSize: 12, fontWeight: '600', color: '#92400E', marginBottom: 10 },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE8C8',
  },
  demoRole: { fontSize: 12, color: '#92400E' },
  demoCredential: { fontSize: 12, color: '#B45309', fontWeight: '600' },
});
