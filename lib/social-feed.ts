import { FeedItem } from '@/types';
import * as SecureStore from 'expo-secure-store';

export class SocialFeedService {
  private static TWITTER_TOKEN_KEY = 'twitter_bearer_token';

  static async saveBearerToken(token: string) {
    await SecureStore.setItemAsync(this.TWITTER_TOKEN_KEY, token);
  }

  static async getBearerToken(): Promise<string | null> {
    return SecureStore.getItemAsync(this.TWITTER_TOKEN_KEY);
  }

  static async isConnected(): Promise<boolean> {
    const token = await this.getBearerToken();
    return !!token;
  }

  static async fetchHomeTimeline(maxResults = 20): Promise<FeedItem[]> {
    const token = await this.getBearerToken();
    if (!token) return [];

    try {
      const params = new URLSearchParams({
        'tweet.fields': 'created_at,author_id,text',
        'user.fields': 'name,username,profile_image_url',
        expansions: 'author_id',
        max_results: String(maxResults),
      });

      const res = await fetch(
        `https://api.twitter.com/2/tweets/search/recent?query=from:me&${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error(`Twitter API ${res.status}`);
      const data = await res.json();

      return (data.data || []).map((tweet: any) => ({
        id: tweet.id,
        type: 'twitter' as const,
        title: 'Twitter',
        content: tweet.text,
        publishedAt: new Date(tweet.created_at),
        isNew: false,
      }));
    } catch (e) {
      console.error('Twitter fetch failed:', e);
      return [];
    }
  }
}
