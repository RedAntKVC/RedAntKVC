import { useState, useCallback } from 'react';
import { Task, TaskList } from '@/types';
import { GoogleCalendarService } from '@/lib/google-calendar';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all: Task[] = [];
      const allLists: TaskList[] = [];

      const googleConnected = await GoogleCalendarService.isConnected();
      if (googleConnected) {
        const lists = await GoogleCalendarService.listTaskLists();
        allLists.push(...lists);
        setTaskLists(lists);
        for (const list of lists) {
          const t = await GoogleCalendarService.listTasks(list.id);
          const withName = t.map((task) => ({ ...task, listName: list.title }));
          all.push(...withName);
        }
      }

      all.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.due && b.due) return a.due.getTime() - b.due.getTime();
        return 0;
      });
      setTasks(all);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { tasks, taskLists, loading, error, fetchTasks };
}
