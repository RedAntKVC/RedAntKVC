import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Platform, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  PurchaseOrder, OrderType, SchoolLevel,
  BRANCHES, ORDER_TYPES, SCHOOL_LEVELS,
} from '../types/purchaseOrder';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SubmitOrder'>;
  onSubmit: (order: Omit<PurchaseOrder, 'id' | 'approvalStatus' | 'approvalNote' | 'approvalDate' | 'createdAt' | 'updatedAt'>) => void;
  submitterName: string;
};

export function SubmitOrderScreen({ navigation, onSubmit, submitterName }: Props) {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('進貨單');
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [supplier, setSupplier] = useState('');
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel>('中學');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showBranchPicker, setShowBranchPicker] = useState(false);
  const [showLevelPicker, setShowLevelPicker] = useState(false);

  function validate(): string | null {
    if (!orderNumber.trim()) return '請輸入採購單號碼';
    if (!supplier.trim()) return '請輸入供應商編號';
    if (!uploadDate) return '請輸入上載日期';
    return null;
  }

  function handleSubmit() {
    const err = validate();
    if (err) {
      if (Platform.OS === 'web') { window.alert(err); } else { Alert.alert('提示', err); }
      return;
    }
    setSubmitting(true);
    onSubmit({
      orderNumber: orderNumber.trim(),
      orderType,
      branch,
      supplier: supplier.trim(),
      schoolLevel,
      uploadDate: new Date(uploadDate),
      submittedBy: submitterName,
    });
    setSubmitting(false);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← 取消</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>提交採購單</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
          <Text style={[styles.submitText, submitting && { opacity: 0.5 }]}>提交</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Field label="採購單號碼 *">
            <TextInput
              style={styles.input}
              placeholder="輸入採購單號碼"
              value={orderNumber}
              onChangeText={setOrderNumber}
              keyboardType="numeric"
            />
          </Field>

          <Field label="訂單類別 *">
            <TouchableOpacity style={styles.selector} onPress={() => { setShowTypePicker(!showTypePicker); setShowBranchPicker(false); setShowLevelPicker(false); }}>
              <Text style={styles.selectorText}>{orderType} ▾</Text>
            </TouchableOpacity>
            {showTypePicker && (
              <View style={styles.dropdown}>
                {ORDER_TYPES.map((t) => (
                  <TouchableOpacity key={t} style={styles.dropdownItem} onPress={() => { setOrderType(t); setShowTypePicker(false); }}>
                    <Text style={[styles.dropdownText, orderType === t && styles.dropdownActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Field>

          <Field label="門市 *">
            <TouchableOpacity style={styles.selector} onPress={() => { setShowBranchPicker(!showBranchPicker); setShowTypePicker(false); setShowLevelPicker(false); }}>
              <Text style={styles.selectorText}>{branch} ▾</Text>
            </TouchableOpacity>
            {showBranchPicker && (
              <View style={styles.dropdown}>
                {BRANCHES.map((b) => (
                  <TouchableOpacity key={b} style={styles.dropdownItem} onPress={() => { setBranch(b); setShowBranchPicker(false); }}>
                    <Text style={[styles.dropdownText, branch === b && styles.dropdownActive]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Field>

          <Field label="供應商編號 *">
            <TextInput
              style={styles.input}
              placeholder="輸入供應商編號"
              value={supplier}
              onChangeText={setSupplier}
              autoCapitalize="characters"
            />
          </Field>

          <Field label="學校級別 *">
            <TouchableOpacity style={styles.selector} onPress={() => { setShowLevelPicker(!showLevelPicker); setShowTypePicker(false); setShowBranchPicker(false); }}>
              <Text style={styles.selectorText}>{schoolLevel} ▾</Text>
            </TouchableOpacity>
            {showLevelPicker && (
              <View style={styles.dropdown}>
                {SCHOOL_LEVELS.map((l) => (
                  <TouchableOpacity key={l} style={styles.dropdownItem} onPress={() => { setSchoolLevel(l); setShowLevelPicker(false); }}>
                    <Text style={[styles.dropdownText, schoolLevel === l && styles.dropdownActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Field>

          <Field label="上載日期 *">
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={uploadDate}
              onChangeText={setUploadDate}
            />
          </Field>
        </View>

        <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.5 }]} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.submitBtnText}>提交採購單</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'web' ? 20 : 12,
  },
  backText: { color: '#fff', fontSize: 14 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: '#6B7280', marginBottom: 6, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: '#374151',
  },
  selector: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    justifyContent: 'center',
  },
  selectorText: { fontSize: 14, color: '#374151' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 4,
    zIndex: 100,
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownText: { fontSize: 14, color: '#374151' },
  dropdownActive: { color: BRAND, fontWeight: '700' },
  submitBtn: {
    backgroundColor: BRAND,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
