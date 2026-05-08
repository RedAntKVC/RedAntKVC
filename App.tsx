import React, { useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { PurchaseOrder, ApprovalStatus } from './src/types/purchaseOrder';
import { MOCK_PURCHASE_ORDERS } from './src/data/mockPurchaseOrders';
import { PurchaseOrderListScreen } from './src/screens/PurchaseOrderListScreen';
import { OrderApprovalScreen } from './src/screens/OrderApprovalScreen';
import { SubmitOrderScreen } from './src/screens/SubmitOrderScreen';
import { ReportsScreen } from './src/screens/ReportsScreen';
import { RootStackParamList, TabParamList } from './src/navigation/types';

// 角色設定：正式版接入登入系統後改用 auth token
const CURRENT_USER = { name: '系統管理員', role: '批核者' as const };

// 切換為 true 並設定 .env 後使用 Firebase 真實資料庫
const USE_FIREBASE = false;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={{ fontSize: 10, color: focused ? '#C8102E' : '#9CA3AF', marginTop: 1 }}>{label}</Text>
    </View>
  );
}

function MainTabs({ orders, userRole }: { orders: PurchaseOrder[]; userRole: string }) {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarShowLabel: false, tabBarStyle: { height: 60 } }}
    >
      <Tab.Screen
        name="OrderList"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="採購單" emoji="📋" focused={focused} /> }}
      >
        {(props) => <PurchaseOrderListScreen {...props} orders={orders} userRole={userRole} />}
      </Tab.Screen>
      <Tab.Screen
        name="Reports"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="報表" emoji="📊" focused={focused} /> }}
      >
        {() => <ReportsScreen orders={orders} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);

  const handleApprove = useCallback((id: string, status: ApprovalStatus, note: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, approvalStatus: status, approvalNote: note, approvalDate: new Date(), updatedAt: new Date() }
          : o
      )
    );
  }, []);

  const handleSubmitOrder = useCallback(
    (order: Omit<PurchaseOrder, 'id' | 'approvalStatus' | 'approvalNote' | 'approvalDate' | 'createdAt' | 'updatedAt'>) => {
      const newOrder: PurchaseOrder = {
        ...order,
        id: String(Date.now()),
        approvalStatus: '待處理',
        approvalNote: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setOrders((prev) => [newOrder, ...prev]);
    },
    []
  );

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main">
          {(props) => (
            <MainTabs orders={orders} userRole={CURRENT_USER.role} />
          )}
        </Stack.Screen>
        <Stack.Screen name="OrderDetail">
          {(props) => (
            <OrderApprovalScreen
              {...props}
              orders={orders}
              userRole={CURRENT_USER.role}
              onApprove={handleApprove}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="SubmitOrder">
          {(props) => (
            <SubmitOrderScreen
              {...props}
              onSubmit={handleSubmitOrder}
              submitterName={CURRENT_USER.name}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
