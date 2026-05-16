import { MonitorTarget, FeedItem } from '@/types';
import { supabase } from './supabase';

export class WebMonitorService {
  static async checkTarget(target: MonitorTarget): Promise<FeedItem | null> {
    try {
      // Use a CORS proxy for web, direct fetch for native
      const url = `https://api.allorigins.win/get?url=${encodeURIComponent(target.url)}`;
      const res = await fetch(url);
      const data = await res.json();
      const content: string = data.contents || '';

      const hasKeyword = target.keyword
        ? content.toLowerCase().includes(target.keyword.toLowerCase())
        : false;

      const changed = target.lastContent && content !== target.lastContent;

      if (changed || (target.keyword && hasKeyword && !target.lastContent)) {
        return {
          id: `monitor-${target.id}-${Date.now()}`,
          type: 'monitor',
          title: `${target.label} 有更新`,
          content: target.keyword
            ? `偵測到關鍵字：${target.keyword}`
            : '網頁內容已變更',
          url: target.url,
          publishedAt: new Date(),
          isNew: true,
        };
      }
      return null;
    } catch (e) {
      console.error(`Monitor check failed for ${target.url}:`, e);
      return null;
    }
  }

  static async saveMonitorTargets(userId: string, targets: MonitorTarget[]) {
    await supabase
      .from('monitor_targets')
      .upsert(targets.map((t) => ({ ...t, user_id: userId })));
  }

  static async loadMonitorTargets(userId: string): Promise<MonitorTarget[]> {
    const { data } = await supabase
      .from('monitor_targets')
      .select('*')
      .eq('user_id', userId);
    return data || [];
  }
}
