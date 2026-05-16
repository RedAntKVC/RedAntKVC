import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { GoogleCalendarService } from '@/lib/google-calendar';
import { AppleCalDAVService } from '@/lib/apple-caldav';
import { SocialFeedService } from '@/lib/social-feed';
import { MonitorTarget } from '@/types';

WebBrowser.maybeCompleteAuthSession();

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-6 mb-2">
      {title}
    </Text>
  );
}

function SettingRow({
  label,
  value,
  onPress,
  rightElement,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-3.5 border-b border-slate-800"
      onPress={onPress}
    >
      <Text className="text-white">{label}</Text>
      {rightElement || <Text className="text-slate-400 text-sm">{value}</Text>}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [appleConnected, setAppleConnected] = useState(false);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [appleUser, setAppleUser] = useState('');
  const [applePass, setApplePass] = useState('');
  const [showAppleForm, setShowAppleForm] = useState(false);
  const [twitterToken, setTwitterToken] = useState('');
  const [showTwitterForm, setShowTwitterForm] = useState(false);
  const [monitors, setMonitors] = useState<MonitorTarget[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    GoogleCalendarService.isConnected().then(setGoogleConnected);
    AppleCalDAVService.isConnected().then(setAppleConnected);
    SocialFeedService.isConnected().then(setTwitterConnected);
  }, []);

  const [, , promptAsync] = GoogleCalendarService.useGoogleAuth();

  async function handleGoogleConnect() {
    if (googleConnected) {
      await GoogleCalendarService.clearTokens();
      setGoogleConnected(false);
    } else {
      const result = await promptAsync();
      if (result?.type === 'success') {
        // In production: exchange code for tokens via backend
        Alert.alert('Google 授權成功', '日曆同步已啟用。請在後端完成 token 交換。');
        setGoogleConnected(true);
      }
    }
  }

  async function connectApple() {
    if (!appleUser.trim() || !applePass.trim()) {
      Alert.alert('請輸入完整資訊');
      return;
    }
    await AppleCalDAVService.saveCredentials(appleUser.trim(), applePass);
    setAppleConnected(true);
    setShowAppleForm(false);
    setAppleUser('');
    setApplePass('');
    Alert.alert('Apple 連接成功', 'iCloud 日曆同步已啟用');
  }

  async function disconnectApple() {
    await AppleCalDAVService.clearCredentials();
    setAppleConnected(false);
  }

  async function connectTwitter() {
    if (!twitterToken.trim()) return;
    await SocialFeedService.saveBearerToken(twitterToken.trim());
    setTwitterConnected(true);
    setShowTwitterForm(false);
    setTwitterToken('');
  }

  function addMonitor() {
    if (!newUrl.trim() || !newLabel.trim()) return;
    const target: MonitorTarget = {
      id: Date.now().toString(),
      url: newUrl.trim(),
      label: newLabel.trim(),
      keyword: newKeyword.trim() || undefined,
      checkInterval: 15,
    };
    setMonitors((prev) => [...prev, target]);
    setNewUrl('');
    setNewLabel('');
    setNewKeyword('');
  }

  function removeMonitor(id: string) {
    setMonitors((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView className="flex-1 px-4">
        <Text className="text-white text-2xl font-bold mt-4 mb-2">設定</Text>

        <SectionHeader title="帳號連接" />
        <View className="bg-slate-800 rounded-xl px-4">
          {/* Google */}
          <SettingRow
            label="🔵 Google 日曆 / 待辦"
            rightElement={
              <TouchableOpacity
                className={`px-3 py-1 rounded-full ${
                  googleConnected ? 'bg-green-800' : 'bg-blue-600'
                }`}
                onPress={handleGoogleConnect}
              >
                <Text className="text-white text-xs">
                  {googleConnected ? '已連接' : '連接'}
                </Text>
              </TouchableOpacity>
            }
          />

          {/* Apple */}
          <SettingRow
            label="🍎 Apple iCloud"
            rightElement={
              <TouchableOpacity
                className={`px-3 py-1 rounded-full ${
                  appleConnected ? 'bg-green-800' : 'bg-red-600'
                }`}
                onPress={appleConnected ? disconnectApple : () => setShowAppleForm((v) => !v)}
              >
                <Text className="text-white text-xs">
                  {appleConnected ? '已連接' : '連接'}
                </Text>
              </TouchableOpacity>
            }
          />
          {showAppleForm && (
            <View className="py-3 gap-2">
              <TextInput
                className="bg-slate-700 text-white rounded-lg px-3 py-2"
                placeholder="Apple ID（電郵）"
                placeholderTextColor="#64748b"
                value={appleUser}
                onChangeText={setAppleUser}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                className="bg-slate-700 text-white rounded-lg px-3 py-2"
                placeholder="App 專用密碼（非 Apple ID 密碼）"
                placeholderTextColor="#64748b"
                value={applePass}
                onChangeText={setApplePass}
                secureTextEntry
              />
              <Text className="text-slate-500 text-xs">
                請前往 appleid.apple.com 產生 App 專用密碼
              </Text>
              <TouchableOpacity
                className="bg-red-500 rounded-lg py-2 items-center"
                onPress={connectApple}
              >
                <Text className="text-white font-semibold">確認連接</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Twitter */}
          <SettingRow
            label="🐦 Twitter / X"
            rightElement={
              <TouchableOpacity
                className={`px-3 py-1 rounded-full ${
                  twitterConnected ? 'bg-green-800' : 'bg-sky-600'
                }`}
                onPress={() => setShowTwitterForm((v) => !v)}
              >
                <Text className="text-white text-xs">
                  {twitterConnected ? '已連接' : '連接'}
                </Text>
              </TouchableOpacity>
            }
          />
          {showTwitterForm && (
            <View className="py-3 gap-2">
              <TextInput
                className="bg-slate-700 text-white rounded-lg px-3 py-2"
                placeholder="Bearer Token"
                placeholderTextColor="#64748b"
                value={twitterToken}
                onChangeText={setTwitterToken}
                secureTextEntry
              />
              <Text className="text-slate-500 text-xs">
                請至 developer.twitter.com 取得 Bearer Token
              </Text>
              <TouchableOpacity
                className="bg-sky-500 rounded-lg py-2 items-center"
                onPress={connectTwitter}
              >
                <Text className="text-white font-semibold">確認連接</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <SectionHeader title="網頁監控" />
        <View className="bg-slate-800 rounded-xl px-4">
          {monitors.length === 0 && (
            <Text className="text-slate-500 text-sm py-3">尚未新增監控目標</Text>
          )}
          {monitors.map((m) => (
            <SettingRow
              key={m.id}
              label={m.label}
              value={m.url.length > 32 ? m.url.slice(0, 32) + '…' : m.url}
              onPress={() => removeMonitor(m.id)}
              rightElement={
                <TouchableOpacity onPress={() => removeMonitor(m.id)}>
                  <Text className="text-red-400 text-sm">刪除</Text>
                </TouchableOpacity>
              }
            />
          ))}
          <View className="py-3 gap-2">
            <TextInput
              className="bg-slate-700 text-white rounded-lg px-3 py-2"
              placeholder="顯示名稱"
              placeholderTextColor="#64748b"
              value={newLabel}
              onChangeText={setNewLabel}
            />
            <TextInput
              className="bg-slate-700 text-white rounded-lg px-3 py-2"
              placeholder="網址（https://...）"
              placeholderTextColor="#64748b"
              value={newUrl}
              onChangeText={setNewUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            <TextInput
              className="bg-slate-700 text-white rounded-lg px-3 py-2"
              placeholder="監控關鍵字（選填）"
              placeholderTextColor="#64748b"
              value={newKeyword}
              onChangeText={setNewKeyword}
            />
            <TouchableOpacity
              className="bg-slate-600 rounded-lg py-2 items-center"
              onPress={addMonitor}
            >
              <Text className="text-white">+ 新增監控目標</Text>
            </TouchableOpacity>
          </View>
        </View>

        <SectionHeader title="關於" />
        <View className="bg-slate-800 rounded-xl px-4 mb-8">
          <SettingRow label="版本" value="1.0.0" />
          <SettingRow label="開發者" value="RedAntKVC" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
