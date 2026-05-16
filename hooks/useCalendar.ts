import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, Calendar } from '@/types';
import { GoogleCalendarService } from '@/lib/google-calendar';
import { AppleCalDAVService } from '@/lib/apple-caldav';

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (start: Date, end: Date) => {
    setLoading(true);
    setError(null);
    try {
      const all: CalendarEvent[] = [];

      const googleConnected = await GoogleCalendarService.isConnected();
      if (googleConnected) {
        const cals = await GoogleCalendarService.listCalendars();
        setCalendars((prev) => {
          const appleOnes = prev.filter((c) => c.source === 'apple');
          return [...cals, ...appleOnes];
        });
        for (const cal of cals.filter((c) => c.enabled)) {
          const evts = await GoogleCalendarService.listEvents(cal.id, start, end);
          all.push(...evts);
        }
      }

      const appleConnected = await AppleCalDAVService.isConnected();
      if (appleConnected) {
        const appleCals = await AppleCalDAVService.discoverCalendars();
        setCalendars((prev) => {
          const googleOnes = prev.filter((c) => c.source === 'google');
          return [...googleOnes, ...appleCals];
        });
      }

      all.sort((a, b) => a.start.getTime() - b.start.getTime());
      setEvents(all);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { events, calendars, loading, error, fetchEvents };
}
