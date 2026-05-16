import * as SecureStore from 'expo-secure-store';
import { CalendarEvent, Calendar, Task, TaskList } from '@/types';

const CALDAV_URL = 'https://caldav.icloud.com';
const CARDDAV_URL = 'https://contacts.icloud.com';

export class AppleCalDAVService {
  private static USER_KEY = 'apple_caldav_user';
  private static PASS_KEY = 'apple_caldav_pass';

  static async saveCredentials(username: string, appPassword: string) {
    await SecureStore.setItemAsync(this.USER_KEY, username);
    await SecureStore.setItemAsync(this.PASS_KEY, appPassword);
  }

  static async clearCredentials() {
    await SecureStore.deleteItemAsync(this.USER_KEY);
    await SecureStore.deleteItemAsync(this.PASS_KEY);
  }

  static async isConnected(): Promise<boolean> {
    const user = await SecureStore.getItemAsync(this.USER_KEY);
    return !!user;
  }

  static async getCredentials(): Promise<{ username: string; password: string } | null> {
    const username = await SecureStore.getItemAsync(this.USER_KEY);
    const password = await SecureStore.getItemAsync(this.PASS_KEY);
    if (!username || !password) return null;
    return { username, password };
  }

  private static basicAuth(username: string, password: string): string {
    return 'Basic ' + btoa(`${username}:${password}`);
  }

  static async discoverCalendars(): Promise<Calendar[]> {
    const creds = await this.getCredentials();
    if (!creds) throw new Error('Apple CalDAV 未設定');

    // PROPFIND to discover calendars
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<d:propfind xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:displayname/>
    <cs:getctag/>
    <c:calendar-description/>
    <d:resourcetype/>
  </d:prop>
</d:propfind>`;

    try {
      const res = await fetch(`${CALDAV_URL}/`, {
        method: 'PROPFIND',
        headers: {
          Authorization: this.basicAuth(creds.username, creds.password),
          'Content-Type': 'application/xml',
          Depth: '1',
        },
        body,
      });

      if (!res.ok) throw new Error(`CalDAV error: ${res.status}`);

      // Parse minimal XML response — return placeholder until full XML parser integrated
      return [
        {
          id: 'apple-default',
          name: 'iCloud 日曆',
          color: '#FF6B6B',
          source: 'apple',
          enabled: true,
        },
      ];
    } catch (e) {
      console.error('Apple CalDAV discovery failed:', e);
      return [];
    }
  }

  static async fetchEvents(
    calendarUrl: string,
    timeMin: Date,
    timeMax: Date
  ): Promise<CalendarEvent[]> {
    const creds = await this.getCredentials();
    if (!creds) return [];

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:getetag/>
    <c:calendar-data/>
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        <c:time-range start="${timeMin.toISOString().replace(/[-:]/g, '').split('.')[0]}Z"
                      end="${timeMax.toISOString().replace(/[-:]/g, '').split('.')[0]}Z"/>
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`;

    try {
      const res = await fetch(calendarUrl, {
        method: 'REPORT',
        headers: {
          Authorization: this.basicAuth(creds.username, creds.password),
          'Content-Type': 'application/xml',
          Depth: '1',
        },
        body,
      });
      if (!res.ok) throw new Error(`CalDAV REPORT error: ${res.status}`);
      // Full iCal parsing would use node-ical — return empty for now
      return [];
    } catch (e) {
      console.error('Apple CalDAV fetch failed:', e);
      return [];
    }
  }

  static async fetchReminders(): Promise<Task[]> {
    // Apple Reminders via CalDAV VTODO
    const creds = await this.getCredentials();
    if (!creds) return [];
    // Full implementation requires REPORT with VTODO filter
    return [];
  }
}
