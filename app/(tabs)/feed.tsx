import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, RefreshControl, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useFeed } from '@/hooks/useFeed';
import { MonitorTarget, FeedItem } from '@/types';

function FeedCard({ item }: { item: FeedItem }) {
  const timeAgo = formatDistanceToNow(item.publishedAt, { addSuffix: true, locale: zhTW });

  return (
    <TouchableOpacity
      className={`bg-slate-800 rounded-xl p-4 mb-3 ${
        item.isNew ? 'border border-red-500' : ''
      }`}
      onPress={() => item.url && Linking.openURL(item.url)}
    >
      <View className="flex-row items-center mb-2">
        <Text className="text-lg mr-2">{item.type === 'twitter' ? '🐦' : '🌐'}</Text>
        <Text className="text-slate-400 text-xs flex-1">{item.title}</Text>
        {item.isNew && <View className="w-2 h-2 bg-red-500 rounded-full mr-1" />}
        <Text className="text-slate-500 text-xs">{timeAgo}</Text>
      </View>
      <Text className="text-white leading-5">{item.content}</Text>
      {item.author && (
        <Text className="text-slate-500 text-xs mt-2">by {item.author}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function FeedScreen() {
  const [monitors] = useState<MonitorTarget[]>([]);
  const { items, loading, fetchFeed } = useFeed(monitors);

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-white text-2xl font-bold">動態</Text>
        <TouchableOpacity
          onPress={fetchFeed}
          className="bg-slate-800 px-3 py-1.5 rounded-lg"
        >
          <Text className="text-slate-300 text-sm">重新整理</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchFeed} tintColor="#ef4444" />
        }
      >
        {items.length === 0 && !loading ? (
          <View className="items-center py-16">
            <Text className="text-4xl mb-4">📡</Text>
            <Text className="text-slate-400 text-center">沒有動態</Text>
            <Text className="text-slate-500 text-sm text-center mt-2">
              請在設定中連接 Twitter 或新增網頁監控
            </Text>
          </View>
        ) : (
          items.map((item) => <FeedCard key={item.id} item={item} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
