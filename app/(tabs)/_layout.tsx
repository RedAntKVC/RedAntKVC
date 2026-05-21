import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View className="items-center">
      <Text className="text-xl">{emoji}</Text>
      <Text className={`text-xs mt-0.5 ${focused ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          height: 70,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" label="今日" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📆" label="日曆" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="✅" label="待辦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📡" label="動態" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" label="設定" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="textbook"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📚" label="用書" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
