import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, eachDayOfInterval, isSameDay, isToday,
} from 'date-fns';
import { useCalendar } from '@/hooks/useCalendar';
import { CalendarEvent } from '@/types';

type ViewMode = 'month' | 'week' | 'day';

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

function MonthGrid({
  currentMonth,
  selectedDate,
  events,
  onSelectDate,
}: {
  currentMonth: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  onSelectDate: (d: Date) => void;
}) {
  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });

  return (
    <View>
      <View className="flex-row mb-1">
        {WEEK_DAYS.map((d) => (
          <Text key={d} className="flex-1 text-center text-slate-500 text-xs">{d}</Text>
        ))}
      </View>
      <View className="flex-row flex-wrap">
        {days.map((day) => {
          const dayEvents = events.filter((e) => isSameDay(e.start, day));
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isSelected = isSameDay(day, selectedDate);
          const isToday_ = isToday(day);
          return (
            <TouchableOpacity
              key={day.toISOString()}
              className={`items-center py-1 ${isSelected ? 'bg-red-500 rounded-full' : ''}`}
              style={{ width: `${100 / 7}%` }}
              onPress={() => onSelectDate(day)}
            >
              <Text
                className={`text-sm ${
                  isSelected
                    ? 'text-white font-bold'
                    : isToday_
                    ? 'text-red-400 font-bold'
                    : isCurrentMonth
                    ? 'text-white'
                    : 'text-slate-600'
                }`}
              >
                {format(day, 'd')}
              </Text>
              {dayEvents.length > 0 && (
                <View className="flex-row gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((_, i) => (
                    <View key={i} className="w-1 h-1 rounded-full bg-red-400" />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function CalendarScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { events, loading, fetchEvents } = useCalendar();

  useEffect(() => {
    fetchEvents(startOfMonth(subMonths(currentMonth, 1)), endOfMonth(addMonths(currentMonth, 1)));
  }, [currentMonth]);

  const selectedEvents = useMemo(
    () => events.filter((e) => isSameDay(e.start, selectedDate)),
    [events, selectedDate]
  );

  const viewModes: { key: ViewMode; label: string }[] = [
    { key: 'month', label: '月' },
    { key: 'week', label: '週' },
    { key: 'day', label: '日' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => setCurrentMonth((m) => subMonths(m, 1))}>
          <Text className="text-slate-400 text-2xl px-2">‹</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">{format(currentMonth, 'yyyy年M月')}</Text>
        <TouchableOpacity onPress={() => setCurrentMonth((m) => addMonths(m, 1))}>
          <Text className="text-slate-400 text-2xl px-2">›</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row mx-4 mb-3 bg-slate-800 rounded-lg p-1">
        {viewModes.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            className={`flex-1 py-1.5 rounded-md items-center ${viewMode === key ? 'bg-red-500' : ''}`}
            onPress={() => setViewMode(key)}
          >
            <Text className={`text-sm ${viewMode === key ? 'text-white font-semibold' : 'text-slate-400'}`}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() =>
              fetchEvents(startOfMonth(currentMonth), endOfMonth(currentMonth))
            }
            tintColor="#ef4444"
          />
        }
      >
        <MonthGrid
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          events={events}
          onSelectDate={setSelectedDate}
        />

        <View className="mt-4 mb-2">
          <Text className="text-slate-300 font-semibold">
            {isToday(selectedDate) ? '今天' : format(selectedDate, 'M月d日')} 的行程
          </Text>
        </View>

        {selectedEvents.length === 0 ? (
          <Text className="text-slate-500 text-center py-8">這天沒有行程</Text>
        ) : (
          selectedEvents.map((event) => (
            <View key={event.id} className="bg-slate-800 rounded-xl p-3 mb-2 flex-row">
              <View
                className="w-1 rounded-full mr-3"
                style={{ backgroundColor: event.calendarColor }}
              />
              <View className="flex-1">
                <Text className="text-white font-medium">{event.title}</Text>
                {!event.allDay && (
                  <Text className="text-slate-400 text-xs mt-1">
                    {format(event.start, 'HH:mm')} – {format(event.end, 'HH:mm')}
                  </Text>
                )}
                {event.location && (
                  <Text className="text-slate-500 text-xs mt-1">📍 {event.location}</Text>
                )}
                {event.description && (
                  <Text className="text-slate-500 text-xs mt-1" numberOfLines={2}>
                    {event.description}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
