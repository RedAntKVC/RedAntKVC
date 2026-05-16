import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, RefreshControl, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, isToday, isPast, isTomorrow } from 'date-fns';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/types';

type Filter = 'all' | 'today' | 'pending';

function TaskItem({ task }: { task: Task }) {
  const dueSoon = task.due && !task.completed && isPast(task.due);

  return (
    <View className="flex-row items-start py-3 border-b border-slate-800">
      <View
        className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex-shrink-0 items-center justify-center ${
          task.completed ? 'bg-green-500 border-green-500' : 'border-slate-500'
        }`}
      >
        {task.completed && <Text className="text-white text-xs">✓</Text>}
      </View>
      <View className="flex-1">
        <Text
          className={`${task.completed ? 'line-through text-slate-500' : 'text-white'} leading-5`}
        >
          {task.title}
        </Text>
        <View className="flex-row items-center mt-1 gap-2">
          <Text className="text-slate-600 text-xs">{task.listName}</Text>
          {task.due && (
            <Text className={`text-xs ${dueSoon ? 'text-red-400' : 'text-slate-400'}`}>
              {isToday(task.due)
                ? '今天'
                : isTomorrow(task.due)
                ? '明天'
                : format(task.due, 'M/d')}
            </Text>
          )}
        </View>
        {task.notes && (
          <Text className="text-slate-500 text-xs mt-1" numberOfLines={1}>
            {task.notes}
          </Text>
        )}
      </View>
      <View
        className={`ml-2 px-1.5 py-0.5 rounded ${
          task.source === 'google' ? 'bg-blue-900' : 'bg-red-900'
        }`}
      >
        <Text className="text-xs text-white">
          {task.source === 'google' ? 'Google' : 'Apple'}
        </Text>
      </View>
    </View>
  );
}

export default function TasksScreen() {
  const { tasks, loading, fetchTasks } = useTasks();
  const [filter, setFilter] = useState<Filter>('pending');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'today') return !!t.due && isToday(t.due);
    if (filter === 'pending') return !t.completed;
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'pending', label: '待完成' },
    { key: 'today', label: '今天' },
    { key: 'all', label: '全部' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-white text-2xl font-bold mb-3">待辦事項</Text>
        <TextInput
          className="bg-slate-800 text-white rounded-xl px-4 py-2.5 mb-3"
          placeholder="搜尋..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />
        <View className="flex-row gap-2">
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              className={`px-4 py-1.5 rounded-full ${
                filter === f.key ? 'bg-red-500' : 'bg-slate-800'
              }`}
              onPress={() => setFilter(f.key)}
            >
              <Text
                className={`text-sm ${
                  filter === f.key ? 'text-white font-semibold' : 'text-slate-400'
                }`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchTasks} tintColor="#ef4444" />
        }
      >
        <Text className="text-slate-500 text-xs mt-2 mb-2">{filtered.length} 項</Text>
        <View className="bg-slate-800 rounded-xl px-4">
          {filtered.length === 0 ? (
            <Text className="text-slate-500 text-center py-8">沒有待辦事項</Text>
          ) : (
            filtered.map((t) => <TaskItem key={`${t.source}-${t.id}`} task={t} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
