export type CalendarSource = 'google' | 'apple' | 'local';
export type TaskSource = 'google' | 'apple';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
  description?: string;
  source: CalendarSource;
  calendarId: string;
  calendarColor: string;
  url?: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  due?: Date;
  completed: boolean;
  completedAt?: Date;
  source: TaskSource;
  listId: string;
  listName: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  source: CalendarSource;
  enabled: boolean;
}

export interface TaskList {
  id: string;
  title: string;
  source: TaskSource;
}

export interface FeedItem {
  id: string;
  type: 'twitter' | 'monitor';
  title: string;
  content: string;
  url?: string;
  imageUrl?: string;
  author?: string;
  authorAvatar?: string;
  publishedAt: Date;
  isNew?: boolean;
}

export interface MonitorTarget {
  id: string;
  url: string;
  label: string;
  keyword?: string;
  lastChecked?: Date;
  lastContent?: string;
  hasChange?: boolean;
  checkInterval: number; // minutes
}

export interface UserSettings {
  googleConnected: boolean;
  appleConnected: boolean;
  twitterConnected: boolean;
  enabledCalendars: string[];
  enabledTaskLists: string[];
  monitorTargets: MonitorTarget[];
  pushToken?: string;
  theme: 'light' | 'dark' | 'system';
  syncInterval: number;
}
