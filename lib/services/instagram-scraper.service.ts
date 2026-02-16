import { firecrawl } from './firecrawl.service';

export interface InstagramProfile {
  username: string;
  fullName: string;
  bio: string;
  profilePicUrl: string;
  followerCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  isPrivate: boolean;
}

export interface InstagramPost {
  id: string;
  caption: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  permalink: string;
  thumbnailUrl?: string;
  timestamp: string;
  likeCount: number;
  commentCount: number;
  hashtags: string[];
  mentions: string[];
  location?: string;
}

export class InstagramScraperService {
  /**
   * Scrape Instagram profile data
   */
  async scrapeProfile(username: string): Promise<InstagramProfile> {
    const url = `https://www.instagram.com/${username}/`;

    try {
      const result = await firecrawl.scrapeUrl(url);

      // Parse profile data from HTML/markdown
      const profile = this.parseProfileData(result.content, result.content);

      return profile;
    } catch (error: any) {
      console.error('Instagram profile scraping failed:', error);
      // Fallback to mock data for development/testing
      return this.mockProfileData(username);
    }
  }

  /**
   * Scrape Instagram posts from profile
   */
  async scrapePosts(username: string, maxPosts: number = 50): Promise<InstagramPost[]> {
    const url = `https://www.instagram.com/${username}/`;

    try {
      const result = await firecrawl.scrapeUrl(url);

      // Parse posts from HTML
      const posts = this.parsePostsData(
        result.content,
        result.content,
        username,
        maxPosts
      );

      return posts;
    } catch (error: any) {
      console.error('Instagram posts scraping failed:', error);
      // Fallback to mock data for development/testing
      return this.mockPostsData(username, maxPosts);
    }
  }

  /**
   * Parse profile data from HTML/markdown
   */
  private parseProfileData(html: string, markdown: string): InstagramProfile {
    // Extract profile data using regex patterns
    // Instagram embeds data in script tags as JSON
    const jsonDataMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    const sharedDataMatch = html.match(/window\._sharedData\s*=\s*({.+?});/);

    let profileData: any = {};

    // Try to parse from JSON-LD
    if (jsonDataMatch) {
      try {
        profileData = JSON.parse(jsonDataMatch[1]);
      } catch (e) {
        console.warn('Failed to parse JSON-LD data');
      }
    }

    // Try to parse from _sharedData
    if (sharedDataMatch && Object.keys(profileData).length === 0) {
      try {
        const sharedData = JSON.parse(sharedDataMatch[1]);
        const user = sharedData?.entry_data?.ProfilePage?.[0]?.graphql?.user;
        if (user) {
          profileData = user;
        }
      } catch (e) {
        console.warn('Failed to parse _sharedData');
      }
    }

    // Fallback to regex patterns if JSON parsing fails
    const username = this.extractWithRegex(html, /"username":"([^"]+)"/);
    const fullName = this.extractWithRegex(html, /"full_name":"([^"]+)"/);
    const bio = this.extractWithRegex(html, /"biography":"([^"]+)"/);
    const profilePicUrl = this.extractWithRegex(html, /"profile_pic_url":"([^"]+)"/);
    const followerCount = parseInt(this.extractWithRegex(html, /"edge_followed_by":{"count":(\d+)/)) || 0;
    const followingCount = parseInt(this.extractWithRegex(html, /"edge_follow":{"count":(\d+)/)) || 0;
    const postsCount = parseInt(this.extractWithRegex(html, /"edge_owner_to_timeline_media":{"count":(\d+)/)) || 0;
    const isVerified = html.includes('"is_verified":true');
    const isPrivate = html.includes('"is_private":true');

    return {
      username: profileData.username || username || '',
      fullName: profileData.full_name || fullName || '',
      bio: profileData.biography || bio || '',
      profilePicUrl: profileData.profile_pic_url || profilePicUrl || '',
      followerCount: profileData.edge_followed_by?.count || followerCount,
      followingCount: profileData.edge_follow?.count || followingCount,
      postsCount: profileData.edge_owner_to_timeline_media?.count || postsCount,
      isVerified: profileData.is_verified || isVerified,
      isPrivate: profileData.is_private || isPrivate,
    };
  }

  /**
   * Parse posts data from HTML
   */
  private parsePostsData(
    html: string,
    markdown: string,
    username: string,
    maxPosts: number
  ): InstagramPost[] {
    const posts: InstagramPost[] = [];

    // Extract posts from _sharedData or graphql data
    const sharedDataMatch = html.match(/window\._sharedData\s*=\s*({.+?});/);

    if (sharedDataMatch) {
      try {
        const sharedData = JSON.parse(sharedDataMatch[1]);
        const edges =
          sharedData?.entry_data?.ProfilePage?.[0]?.graphql?.user?.edge_owner_to_timeline_media
            ?.edges || [];

        for (const edge of edges.slice(0, maxPosts)) {
          const node = edge.node;

          posts.push({
            id: node.id || node.shortcode,
            caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
            mediaType: this.getMediaType(node.__typename),
            mediaUrl: node.display_url || node.thumbnail_src || '',
            permalink: `https://www.instagram.com/p/${node.shortcode}/`,
            thumbnailUrl: node.thumbnail_src,
            timestamp: new Date(node.taken_at_timestamp * 1000).toISOString(),
            likeCount: node.edge_liked_by?.count || node.edge_media_preview_like?.count || 0,
            commentCount: node.edge_media_to_comment?.count || 0,
            hashtags: this.extractHashtags(node.edge_media_to_caption?.edges?.[0]?.node?.text || ''),
            mentions: this.extractMentions(node.edge_media_to_caption?.edges?.[0]?.node?.text || ''),
            location: node.location?.name,
          });
        }
      } catch (e) {
        console.warn('Failed to parse posts from _sharedData:', e);
      }
    }

    // Fallback: try to extract from HTML structure
    if (posts.length === 0) {
      const postMatches = Array.from(html.matchAll(/"shortcode":"([^"]+)"/g));

      for (const match of postMatches.slice(0, maxPosts)) {
        const shortcode = match[1];
        // Extract basic post data
        posts.push({
          id: shortcode,
          caption: '',
          mediaType: 'IMAGE',
          mediaUrl: '',
          permalink: `https://www.instagram.com/p/${shortcode}/`,
          timestamp: new Date().toISOString(),
          likeCount: 0,
          commentCount: 0,
          hashtags: [],
          mentions: [],
        });
      }
    }

    return posts;
  }

  /**
   * Extract hashtags from caption
   */
  private extractHashtags(caption: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = caption.match(hashtagRegex);
    return matches ? matches.map((tag) => tag.slice(1)) : [];
  }

  /**
   * Extract mentions from caption
   */
  private extractMentions(caption: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = caption.match(mentionRegex);
    return matches ? matches.map((mention) => mention.slice(1)) : [];
  }

  /**
   * Get media type from typename
   */
  private getMediaType(typename: string): 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' {
    if (typename === 'GraphSidecar') return 'CAROUSEL_ALBUM';
    if (typename === 'GraphVideo') return 'VIDEO';
    return 'IMAGE';
  }

  /**
   * Extract value using regex
   */
  private extractWithRegex(text: string, regex: RegExp): string {
    const match = text.match(regex);
    return match ? match[1] : '';
  }

  /**
   * Calculate engagement rate
   */
  calculateEngagementRate(
    likeCount: number,
    commentCount: number,
    followerCount: number
  ): number {
    if (followerCount === 0) return 0;
    return ((likeCount + commentCount) / followerCount) * 100;
  }

  /**
   * Calculate performance score
   */
  calculatePerformanceScore(
    engagementRate: number,
    likeCount: number,
    commentCount: number,
    postAge: number // in days
  ): number {
    // Weighted score: engagement rate (50%), total engagement (30%), recency (20%)
    const engagementScore = engagementRate * 0.5;
    const totalEngagement = (likeCount + commentCount * 3) / 1000; // Weight comments more
    const engagementTotal = totalEngagement * 0.3;
    const recencyScore = Math.max(0, 1 - postAge / 90) * 0.2; // Decay over 90 days

    return (engagementScore + engagementTotal + recencyScore) * 100;
  }

  /**
   * Mock profile data for development/testing
   */
  private mockProfileData(username: string): InstagramProfile {
    return {
      username,
      fullName: `${username.charAt(0).toUpperCase() + username.slice(1)} (Mock)`,
      bio: 'Wellness content creator | Sharing tips on gut health, nutrition, and holistic wellness 🌿',
      profilePicUrl: `https://ui-avatars.com/api/?name=${username}&size=200`,
      followerCount: 12500,
      followingCount: 450,
      postsCount: 287,
      isVerified: false,
      isPrivate: false,
    };
  }

  /**
   * Mock posts data for development/testing
   */
  private mockPostsData(username: string, maxPosts: number): InstagramPost[] {
    const posts: InstagramPost[] = [];
    const topics = [
      {
        caption: '5 simple gut health hacks that changed my life 🌿✨\n\n#guthealth #wellness #healthylifestyle #nutrition',
        hashtags: ['guthealth', 'wellness', 'healthylifestyle', 'nutrition'],
        likes: 3420,
        comments: 187,
      },
      {
        caption: 'What I eat in a day for hormone balance 💚 Save this for later!\n\n#hormones #healthyeating #fertility #wellness',
        hashtags: ['hormones', 'healthyeating', 'fertility', 'wellness'],
        likes: 5210,
        comments: 312,
      },
      {
        caption: 'The truth about seed oils nobody talks about 👀\n\n#nutrition #health #healthyfats #wellness',
        hashtags: ['nutrition', 'health', 'healthyfats', 'wellness'],
        likes: 8930,
        comments: 542,
      },
      {
        caption: 'Morning routine for better energy all day ☀️\n\n#morningroutine #wellness #selfcare #healthylifestyle',
        hashtags: ['morningroutine', 'wellness', 'selfcare', 'healthylifestyle'],
        likes: 2150,
        comments: 98,
      },
      {
        caption: 'Best supplements for women over 30 (from my nutritionist) 💊\n\n#supplements #womenshealth #wellness #fertility',
        hashtags: ['supplements', 'womenshealth', 'wellness', 'fertility'],
        likes: 4680,
        comments: 267,
      },
      {
        caption: 'Why I quit coffee and what I drink instead 🍵\n\n#wellness #healthylifestyle #guthealth #nutrition',
        hashtags: ['wellness', 'healthylifestyle', 'guthealth', 'nutrition'],
        likes: 6720,
        comments: 421,
      },
      {
        caption: 'Fertility-friendly meals that actually taste good 🥗\n\n#fertility #ttc #nutrition #healthyeating',
        hashtags: ['fertility', 'ttc', 'nutrition', 'healthyeating'],
        likes: 3890,
        comments: 203,
      },
      {
        caption: 'Signs your gut needs healing (swipe for tips) ➡️\n\n#guthealth #wellness #digestion #healthtips',
        hashtags: ['guthealth', 'wellness', 'digestion', 'healthtips'],
        likes: 7340,
        comments: 389,
      },
      {
        caption: 'My go-to stress relief practices 🧘‍♀️✨\n\n#stressrelief #mentalhealth #wellness #selfcare',
        hashtags: ['stressrelief', 'mentalhealth', 'wellness', 'selfcare'],
        likes: 2980,
        comments: 145,
      },
      {
        caption: 'What eating for hormone health really looks like 🍽️\n\n#hormones #nutrition #womenshealth #wellness',
        hashtags: ['hormones', 'nutrition', 'womenshealth', 'wellness'],
        likes: 5560,
        comments: 298,
      },
    ];

    const count = Math.min(maxPosts, topics.length);

    for (let i = 0; i < count; i++) {
      const topic = topics[i % topics.length];
      const daysAgo = i * 3; // Posts every 3 days
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      posts.push({
        id: `mock_${username}_${i}`,
        caption: topic.caption,
        mediaType: i % 3 === 0 ? 'CAROUSEL_ALBUM' : 'IMAGE',
        mediaUrl: `https://picsum.photos/seed/${username}${i}/1080/1080`,
        permalink: `https://www.instagram.com/p/mock_${i}/`,
        thumbnailUrl: `https://picsum.photos/seed/${username}${i}/300/300`,
        timestamp: timestamp.toISOString(),
        likeCount: topic.likes,
        commentCount: topic.comments,
        hashtags: topic.hashtags,
        mentions: [],
      });
    }

    return posts;
  }
}

export const instagramScraper = new InstagramScraperService();
