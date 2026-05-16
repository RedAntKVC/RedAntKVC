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
      className="flex-row items-center justify-between py-3.5 border-b border-slate-700"
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
  const [showAppleForm, setShowAppleForm] = useState(false);
  const [appleUser, setAppleUser] = useState('');
  const [applePass, setApplePass] = useState('');
  const [showTwitterForm, setShowTwitterForm] = useState(false);
  const [twitterToken, setTwitterToken] = useState('');
  const [monitors, setMonitors] = useState<MonitorTarget[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => {
    GoogleCalendarService.isConnected().then(setGoogleConnected);
    AppleCalDAVService.isConnected().then(setAppleConnected);
    SocialFeedService.isConnected().then(setTwitterConnected);
  }, []);

  const [request, response, promptAsync] = GoogleCalendarService.useGoogleAuth();

  useEffect(() => {
    if (response?.type === 'success') {
      Alert.alert('Google 授權成功', '日曆同步已啟用');
      setGoogleConnected(true);
    }
  }, [response]);

  async function connectApple() {
    if (!appleUser || !applePass) return;
    await AppleCalDAVService.saveCredentials(appleUser, applePass);
    setAppleConnected(true);
    setShowAppleForm(false);
    Alert.alert('Apple 連接成功', 'iCloud 日曆同步已啟用');
  }

  async function disconnectGoogle() {
    await GoogleCalendarService.clearTokens();
    setGoogleConnected(false);
  }

  async function disconnectApple() {
    await AppleCalDAVService.clearCredentials();
    setAppleConnected(false);
  }

  async function connectTwitter() {
    if (!twitterToken) return;
    await SocialFeedService.saveBearerToken(twitterToken);
    setTwitterConnected(true);
    setShowTwitterForm(false);
  }

  function addMonitor() {
    if (!newUrl || !newLabel) return;
    const target: MonitorTarget = {
      id: Date.now().toString(),
      url: newUrl,
      label: newLabel,
      checkInterval: 15,
    };
    setMonitors((prev) => [...prev, target]);
    setNewUrl('');
    setNewLabel('');
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
                className={`px-3 py-1 rounded-full ${googleConnected ? 'bg-green-800' : 'bg-blue-600'}`}
                onPress={googleConnected ? disconnectGoogle : () => promptAsync()}
              >
                <Text className="text-white text-xs">{googleConnected ? '已連接 ✓' : '連接'}</Text>
              </TouchableOpacity>
            }
          />

          {/* Apple */}
          <SettingRow
            label="🍎 Apple iCloud 日曆"
            rightElement={
              <TouchableOpacity
                className={`px-3 py-1 rounded-full ${appleConnected ? 'bg-green-800' : 'bg-red-600'}`}
                onPress={appleConnected ? disconnectApple : () => setShowAppleForm(!showAppleForm)}
              >
                <Text className="text-white text-xs">{appleConnected ? '已連接 ✓' : '連接'}</Text>
              </TouchableOpacity>
            }
          />
          {showAppleForm && (
            <View className="py-3 gap-2">
              <TextInput
                className="bg-slate-700 text-white rounded-lg px-3 py-2"
                placeholder="Apple ID (電郵)"
                placeholderTextColor="#64748b"
                value={appleUser}
                onChangeText={setAppleUser}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                className="bg-slate-700 text-white rounded-lg px-3 py-2"
                placeholder="App 專用密碼"
                placeholderTextColor="#64748b"
                value={applePass}
                onChangeText={setApplePass}
                secureTextEntry
              />
              <Text className="text-slate-500 text-xs">
                請至 appleid.apple.com → 安全性 → 產生 App 專用密碼
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
            label="🐦 Twitter / X 動態"
            rightElement={
              <TouchableOpacity
                className={`px-3 py-1 rounded-full ${twitterConnected ? 'bg-green-800' : 'bg-sky-600'}`}
                onPress={() => setShowTwitterForm(!showTwitterForm)}
              >
                <Text className="text-white text-xs">{twitterConnected ? '已連接 ✓' : '連接'}</Text>
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
                請至 developer.twitter.com 申請並取得 Bearer Token
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
          {monitors.map((m) => (
            <SettingRow
              key={m.id}
              label={m.label}
              value={m.url.length > 30 ? m.url.slice(0, 30) + '…' : m.url}
              onPress={() => setMonitors((prev) => prev.filter((x) => x.id !== m.id))}
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
              placeholder="網址 (https://...)"
              placeholderTextColor="#64748b"
              value={newUrl}
              onChangeText={setNewUrl}
              autoCapitalize="none"
              keyboardType="url"
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
