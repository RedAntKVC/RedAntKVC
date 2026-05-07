import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Order, OrderStatus } from './src/types/order';
import { MOCK_ORDERS } from './src/data/mockOrders';
import { OrderListScreen } from './src/screens/OrderListScreen';
import { OrderDetailScreen } from './src/screens/OrderDetailScreen';
import { RootStackParamList } from './src/navigation/types';

// 切換為 true 並設定 Firebase 設定後，即可使用真實資料庫
const USE_FIREBASE = false;

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  useEffect(() => {
    if (!USE_FIREBASE) return;
    // Firebase 即時監聽
    const { subscribeOrders } = require('./src/firebase/orders');
    const unsubscribe = subscribeOrders((liveOrders: Order[]) => setOrders(liveOrders));
    return unsubscribe;
  }, []);

  const handleStatusChange = useCallback(async (id: string, status: OrderStatus) => {
    if (USE_FIREBASE) {
      const { updateOrderStatus } = require('./src/firebase/orders');
      await updateOrderStatus(id, status);
    } else {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status, updatedAt: new Date() } : o
        )
      );
    }
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="OrderList">
          {(props) => (
            <OrderListScreen
              {...props}
              orders={orders}
              onStatusChange={handleStatusChange}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="OrderDetail">
          {(props) => (
            <OrderDetailScreen
              {...props}
              orders={orders}
              onStatusChange={handleStatusChange}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
