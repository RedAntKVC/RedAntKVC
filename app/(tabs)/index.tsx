import { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, isToday, startOfDay, endOfDay, addDays } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useCalendar } from '@/hooks/useCalendar';
import { useTasks } from '@/hooks/useTasks';
import { CalendarEvent, Task } from '@/types';

function SourceDot({ source }: { source: string }) {
  const color = source === 'google' ? 'bg-blue-500' : 'bg-red-400';
  return <View className={`w-2 h-2 rounded-full ${color} mr-2`} />;
}

function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <TouchableOpacity
      className="bg-slate-800 rounded-xl p-3 mb-2 flex-row items-start"
      onPress={() => event.url && Linking.openURL(event.url)}
    >
      <View
        className="w-1 rounded-full mr-3 self-stretch"
        style={{ backgroundColor: event.calendarColor || '#ef4444' }}
      />
      <View className="flex-1">
        <Text className="text-white font-medium">{event.title}</Text>
        {!event.allDay && (
          <Text className="text-slate-400 text-xs mt-0.5">
            {format(event.start, 'HH:mm')} – {format(event.end, 'HH:mm')}
          </Text>
        )}
        {event.location && (
          <Text className="text-slate-500 text-xs mt-0.5">📍 {event.location}</Text>
        )}
      </View>
      <SourceDot source={event.source} />
    </TouchableOpacity>
  );
}

function TaskRow({ task }: { task: Task }) {
  return (
    <View className="flex-row items-center py-2 border-b border-slate-800">
      <View
        className={`w-4 h-4 rounded border-2 mr-3 ${
          task.completed ? 'bg-green-500 border-green-500' : 'border-slate-500'
        }`}
      />
      <View className="flex-1">
        <Text className={task.completed ? 'line-through text-slate-500' : 'text-white'}>
          {task.title}
        </Text>
        {task.due && (
          <Text className="text-xs text-slate-400 mt-0.5">
            {isToday(task.due) ? '今天' : format(task.due, 'MM/dd')}
          </Text>
        )}
      </View>
      <Text className="text-xs text-slate-500">{task.source === 'google' ? 'G' : 'A'}</Text>
    </View>
  );
}

export default function TodayScreen() {
  const now = new Date();
  const { events, loading: calLoading, fetchEvents } = useCalendar();
  const { tasks, loading: taskLoading, fetchTasks } = useTasks();

  useEffect(() => {
    fetchEvents(startOfDay(now), endOfDay(addDays(now, 1)));
    fetchTasks();
  }, []);

  const todayEvents = useMemo(
    () => events.filter((e) => isToday(e.start) || isToday(e.end)),
    [events]
  );

  const pendingTasks = useMemo(
    () => tasks.filter((t) => !t.completed && (!t.due || isToday(t.due) || t.due < now)),
    [tasks]
  );

  const refreshing = calLoading || taskLoading;

  function onRefresh() {
    fetchEvents(startOfDay(now), endOfDay(addDays(now, 1)));
    fetchTasks();
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />
        }
      >
        <View className="mt-6 mb-6">
          <Text className="text-slate-400 text-sm">
            {format(now, 'EEEE', { locale: zhTW })}
          </Text>
          <Text className="text-white text-3xl font-bold">{format(now, 'M月d日')}</Text>
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-slate-800 rounded-xl p-4">
            <Text className="text-2xl font-bold text-white">{todayEvents.length}</Text>
            <Text className="text-slate-400 text-xs mt-1">今日行程</Text>
          </View>
          <View className="flex-1 bg-slate-800 rounded-xl p-4">
            <Text className="text-2xl font-bold text-white">{pendingTasks.length}</Text>
            <Text className="text-slate-400 text-xs mt-1">待辦事項</Text>
          </View>
        </View>

        {todayEvents.length > 0 && (
          <View className="mb-6">
            <Text className="text-slate-300 font-semibold mb-3">今日行程</Text>
            {todayEvents.map((e) => <EventCard key={e.id} event={e} />)}
          </View>
        )}

        {pendingTasks.length > 0 && (
          <View className="mb-6">
            <Text className="text-slate-300 font-semibold mb-3">待辦清單</Text>
            <View className="bg-slate-800 rounded-xl px-4">
              {pendingTasks.slice(0, 8).map((t) => <TaskRow key={t.id} task={t} />)}
            </View>
          </View>
        )}

        {todayEvents.length === 0 && pendingTasks.length === 0 && !refreshing && (
          <View className="items-center py-16">
            <Text className="text-4xl mb-4">🎉</Text>
            <Text className="text-slate-400">今天暫時沒有行程和待辦</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
