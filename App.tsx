import React, { useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { PurchaseOrder, ApprovalStatus } from './src/types/purchaseOrder';
import { MOCK_PURCHASE_ORDERS } from './src/data/mockPurchaseOrders';

import { LoginScreen } from './src/screens/LoginScreen';
import { PurchaseOrderListScreen } from './src/screens/PurchaseOrderListScreen';
import { OrderApprovalScreen } from './src/screens/OrderApprovalScreen';
import { SubmitOrderScreen } from './src/screens/SubmitOrderScreen';
import { ReportsScreen } from './src/screens/ReportsScreen';
import { UserManagementScreen } from './src/screens/UserManagementScreen';

import { RootStackParamList, TabParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={tabStyles.icon}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  icon: { alignItems: 'center', paddingTop: 2 },
  label: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  labelActive: { color: '#C8102E', fontWeight: '600' },
});

function MainTabs({
  orders,
  onApprove,
  onSubmit,
}: {
  orders: PurchaseOrder[];
  onApprove: (id: string, status: ApprovalStatus, note: string) => void;
  onSubmit: (order: Omit<PurchaseOrder, 'id' | 'approvalStatus' | 'approvalNote' | 'approvalDate' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const { currentUser } = useAuth();
  const role = currentUser?.role ?? '門市';

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarShowLabel: false, tabBarStyle: { height: 62 } }}
    >
      <Tab.Screen
        name="OrderList"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="採購單" emoji="📋" focused={focused} /> }}
      >
        {(props) => (
          <PurchaseOrderListScreen {...props} orders={orders} userRole={role} />
        )}
      </Tab.Screen>

      {/* 報表：批核者及財務部可查看 */}
      {(role === '批核者' || role === '財務部') && (
        <Tab.Screen
          name="Reports"
          options={{ tabBarIcon: ({ focused }) => <TabIcon label="報表" emoji="📊" focused={focused} /> }}
        >
          {() => <ReportsScreen orders={orders} />}
        </Tab.Screen>
      )}

      {/* 帳號管理：只有批核者可見 */}
      {role === '批核者' && (
        <Tab.Screen
          name="UserManagement"
          options={{ tabBarIcon: ({ focused }) => <TabIcon label="帳號" emoji="👥" focused={focused} /> }}
        >
          {() => <UserManagementScreen />}
        </Tab.Screen>
      )}
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { currentUser, logout } = useAuth();
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
      setOrders((prev) => [
        {
          ...order,
          id: String(Date.now()),
          approvalStatus: '待處理',
          approvalNote: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...prev,
      ]);
    },
    []
  );

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main">
          {() => (
            <MainTabs
              orders={
                // 門市只看自己門市的單；批核者/財務部看全部
                currentUser.role === '門市'
                  ? orders.filter((o) => o.branch === currentUser.branch)
                  : orders
              }
              onApprove={handleApprove}
              onSubmit={handleSubmitOrder}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="OrderDetail">
          {(props) => (
            <OrderApprovalScreen
              {...props}
              orders={orders}
              userRole={currentUser.role}
              onApprove={handleApprove}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="SubmitOrder">
          {(props) => (
            <SubmitOrderScreen
              {...props}
              onSubmit={handleSubmitOrder}
              submitterName={currentUser.displayName}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
