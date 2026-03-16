/**
 * Instagram Graph API service
 * Uses the official Meta/Facebook Graph API to fetch real Instagram data.
 * Requires FACEBOOK_APP_ID and FACEBOOK_APP_SECRET env vars.
 */

const GRAPH_VERSION = 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export interface IGProfile {
  id: string;
  username: string;
  biography: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  profile_picture_url: string;
}

export interface IGMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

export interface IGTokenData {
  accessToken: string;
  expiresIn: number; // seconds
}

class InstagramGraphService {
  private async graphFetch(path: string, params: Record<string, string> = {}): Promise<any> {
    const url = new URL(`${GRAPH_BASE}/${path}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error.message || `Graph API error on ${path}`);
    }
    return data;
  }

  /** Exchange OAuth code for a short-lived user access token */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<IGTokenData> {
    const data = await this.graphFetch('oauth/access_token', {
      client_id: process.env.FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      redirect_uri: redirectUri,
      code,
    });
    return { accessToken: data.access_token, expiresIn: data.expires_in || 3600 };
  }

  /** Exchange a short-lived token for a long-lived token (~60 days) */
  async exchangeForLongLivedToken(shortToken: string): Promise<IGTokenData> {
    const data = await this.graphFetch('oauth/access_token', {
      grant_type: 'fb_exchange_token',
      client_id: process.env.FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      fb_exchange_token: shortToken,
    });
    return { accessToken: data.access_token, expiresIn: data.expires_in || 5183944 };
  }

  /** Get Facebook Pages the user manages */
  async getPages(userToken: string): Promise<Array<{ id: string; name: string; access_token: string }>> {
    const data = await this.graphFetch('me/accounts', { access_token: userToken });
    return data.data || [];
  }

  /** Get the IG Business Account ID linked to a Facebook Page */
  async getIGBusinessAccountId(pageId: string, pageToken: string): Promise<string | null> {
    const data = await this.graphFetch(pageId, {
      fields: 'instagram_business_account',
      access_token: pageToken,
    });
    return data.instagram_business_account?.id || null;
  }

  /** Fetch the authenticated IG user's profile via /me (Instagram Login flow) */
  async getMe(accessToken: string): Promise<IGProfile> {
    return this.graphFetch('me', {
      fields: 'id,username,biography,followers_count,follows_count,media_count,profile_picture_url',
      access_token: accessToken,
    });
  }

  /** Fetch IG business profile info by user ID (legacy / Graph API via pages flow) */
  async getProfile(igUserId: string, accessToken: string): Promise<IGProfile> {
    return this.graphFetch(igUserId, {
      fields: 'id,username,biography,followers_count,follows_count,media_count,profile_picture_url',
      access_token: accessToken,
    });
  }

  /** Fetch recent media (up to `limit` posts), handling pagination */
  async getMedia(igUserId: string, accessToken: string, limit = 50): Promise<IGMedia[]> {
    const fields =
      'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';
    const all: IGMedia[] = [];
    // With Instagram Login, igUserId = 'me' works too
    let nextUrl: string | null =
      `${GRAPH_BASE}/${igUserId}/media?fields=${fields}&limit=25&access_token=${accessToken}`;

    while (nextUrl && all.length < limit) {
      const res: Response = await fetch(nextUrl);
      const data: any = await res.json();
      if (data.error) throw new Error(data.error.message);
      if (data.data) all.push(...data.data);
      nextUrl = data.paging?.next || null;
    }

    return all.slice(0, limit);
  }

  /** Extract hashtags from a caption string */
  extractHashtags(caption?: string): string[] {
    if (!caption) return [];
    return (caption.match(/#[\w\u00C0-\u024F]+/g) || []).map((h) => h.slice(1).toLowerCase());
  }

  /** Calculate engagement rate as a percentage */
  calculateEngagementRate(likes: number, comments: number, followers: number): number {
    if (followers === 0) return 0;
    return ((likes + comments) / followers) * 100;
  }

  /** Composite performance score 0-100 */
  calculatePerformanceScore(
    engagementRate: number,
    likes: number,
    comments: number,
    daysOld: number
  ): number {
    let score = Math.min(engagementRate * 10, 50);
    score += Math.min(likes / 100, 30);
    score += Math.min(comments / 10, 10);
    score -= Math.min(daysOld / 30, 10);
    return Math.max(0, Math.min(100, score));
  }
}

export const instagramGraph = new InstagramGraphService();
