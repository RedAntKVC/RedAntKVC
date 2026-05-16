import { useState, useCallback } from 'react';
import { FeedItem, MonitorTarget } from '@/types';
import { SocialFeedService } from '@/lib/social-feed';
import { WebMonitorService } from '@/lib/web-monitor';

export function useFeed(monitors: MonitorTarget[]) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const all: FeedItem[] = [];

      const tweets = await SocialFeedService.fetchHomeTimeline();
      all.push(...tweets);

      const monitorResults = await Promise.all(
        monitors.map((m) => WebMonitorService.checkTarget(m))
      );
      all.push(...monitorResults.filter(Boolean) as FeedItem[]);

      all.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
      setItems(all);
    } finally {
      setLoading(false);
    }
  }, [monitors]);

  return { items, loading, fetchFeed };
}
