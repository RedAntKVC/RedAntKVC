import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { CalendarEvent, Calendar, Task, TaskList } from '@/types';

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/tasks.readonly',
];

const DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export class GoogleCalendarService {
  private static TOKEN_KEY = 'google_access_token';
  private static REFRESH_KEY = 'google_refresh_token';

  static async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(this.TOKEN_KEY);
  }

  static async saveTokens(access: string, refresh?: string) {
    await SecureStore.setItemAsync(this.TOKEN_KEY, access);
    if (refresh) await SecureStore.setItemAsync(this.REFRESH_KEY, refresh);
  }

  static async clearTokens() {
    await SecureStore.deleteItemAsync(this.TOKEN_KEY);
    await SecureStore.deleteItemAsync(this.REFRESH_KEY);
  }

  static async isConnected(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  static useGoogleAuth() {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'redant' });
    return AuthSession.useAuthRequest(
      {
        clientId: CLIENT_ID,
        scopes: SCOPES,
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        extraParams: { access_type: 'offline', prompt: 'consent' },
      },
      DISCOVERY
    );
  }

  private static async fetchWithAuth(url: string): Promise<any> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('Not authenticated with Google');
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Google API error: ${res.status}`);
    return res.json();
  }

  static async listCalendars(): Promise<Calendar[]> {
    const data = await this.fetchWithAuth(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList'
    );
    return (data.items || []).map((item: any) => ({
      id: item.id,
      name: item.summary,
      color: item.backgroundColor || '#ef4444',
      source: 'google' as const,
      enabled: item.selected !== false,
    }));
  }

  static async listEvents(
    calendarId: string,
    timeMin: Date,
    timeMax: Date
  ): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
    });
    const data = await this.fetchWithAuth(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`
    );
    return (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.summary || '(無標題)',
      start: new Date(item.start?.dateTime || item.start?.date),
      end: new Date(item.end?.dateTime || item.end?.date),
      allDay: !item.start?.dateTime,
      location: item.location,
      description: item.description,
      source: 'google' as const,
      calendarId,
      calendarColor: '#4285F4',
      url: item.htmlLink,
    }));
  }

  static async listTaskLists(): Promise<TaskList[]> {
    const data = await this.fetchWithAuth(
      'https://tasks.googleapis.com/tasks/v1/users/@me/lists'
    );
    return (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      source: 'google' as const,
    }));
  }

  static async listTasks(listId: string): Promise<Task[]> {
    const data = await this.fetchWithAuth(
      `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&maxResults=100`
    );
    return (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.title || '(無標題)',
      notes: item.notes,
      due: item.due ? new Date(item.due) : undefined,
      completed: item.status === 'completed',
      completedAt: item.completed ? new Date(item.completed) : undefined,
      source: 'google' as const,
      listId,
      listName: '',
    }));
  }
}
