'use server';

import { createClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { instagramScraper } from '@/lib/services/instagram-scraper.service';
import { revalidatePath } from 'next/cache';

export interface InstagramInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  value: string;
  metric_value: number;
  frequency: number;
  confidence_score: number;
  generated_at: string;
}

export interface InstagramPost {
  id: string;
  caption: string;
  media_type: string;
  media_url: string;
  permalink: string;
  post_timestamp: string;
  like_count: number;
  comment_count: number;
  engagement_rate: number;
  hashtags: string[];
  performance_score: number;
}

/**
 * Connect Instagram account (manual username entry for scraping)
 */
export async function connectInstagramAccount(username: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    // Always use mock profile data for development
    const profile = await instagramScraper.scrapeProfile(username);

    // Update user with Instagram data
    const { error: updateError } = await supabase
      .from('users')
      .update({
        instagram_username: username,
        instagram_profile_picture_url: profile.profilePicUrl,
        instagram_bio: profile.bio,
        instagram_follower_count: profile.followerCount,
        instagram_following_count: profile.followingCount,
        instagram_posts_count: profile.postsCount,
        instagram_connected_at: new Date().toISOString(),
        instagram_last_synced_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`);
    }

    // Start initial sync (with mock data)
    await syncInstagramData(username);

    revalidatePath('/dashboard');
    revalidatePath('/profile');

    return { success: true, profile };
  } catch (error: any) {
    console.error('Instagram connection failed:', error);
    throw new Error(`Failed to connect Instagram: ${error.message}`);
  }
}

/**
 * Sync Instagram data (posts + generate insights)
 */
export async function syncInstagramData(username?: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const instagramUsername = username || user.instagram_username;

  if (!instagramUsername) {
    throw new Error('No Instagram account connected');
  }

  // Create sync log
  const { data: syncLog, error: logError } = await supabase
    .from('instagram_sync_log')
    .insert({
      user_id: user.id,
      sync_type: username ? 'full' : 'incremental',
      status: 'started',
    })
    .select()
    .single();

  if (logError) {
    console.error('Failed to create sync log:', logError);
  }

  try {
    // Scrape posts
    const posts = await instagramScraper.scrapePosts(instagramUsername, 50);

    console.log(`Scraped ${posts.length} posts for ${instagramUsername}`);

    // Get current follower count for engagement rate calculation
    const { data: userData } = await supabase
      .from('users')
      .select('instagram_follower_count')
      .eq('id', user.id)
      .single();

    const followerCount = userData?.instagram_follower_count || 1;

    // Save posts to database
    let postsInserted = 0;

    for (const post of posts) {
      const engagementRate = instagramScraper.calculateEngagementRate(
        post.likeCount,
        post.commentCount,
        followerCount
      );

      const postAge = Math.floor(
        (Date.now() - new Date(post.timestamp).getTime()) / (1000 * 60 * 60 * 24)
      );

      const performanceScore = instagramScraper.calculatePerformanceScore(
        engagementRate,
        post.likeCount,
        post.commentCount,
        postAge
      );

      const { error: postError } = await supabase.from('instagram_posts').upsert(
        {
          user_id: user.id,
          instagram_post_id: post.id,
          instagram_username: instagramUsername,
          caption: post.caption,
          media_type: post.mediaType,
          media_url: post.mediaUrl,
          permalink: post.permalink,
          thumbnail_url: post.thumbnailUrl,
          timestamp: post.timestamp,
          like_count: post.likeCount,
          comment_count: post.commentCount,
          engagement_rate: engagementRate,
          hashtags: post.hashtags,
          mentions: post.mentions,
          location: post.location,
          performance_score: performanceScore,
          scraped_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,instagram_post_id',
        }
      );

      if (!postError) {
        postsInserted++;
      }
    }

    // Generate insights
    const insights = await generateInstagramInsights(user.id);

    // Update sync log
    await supabase
      .from('instagram_sync_log')
      .update({
        status: 'completed',
        posts_fetched: postsInserted,
        insights_generated: insights.length,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncLog?.id);

    // Update last synced timestamp
    await supabase
      .from('users')
      .update({
        instagram_last_synced_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    revalidatePath('/dashboard');

    return {
      success: true,
      postsScraped: postsInserted,
      insightsGenerated: insights.length,
    };
  } catch (error: any) {
    console.error('Instagram sync failed:', error);

    // Update sync log with error
    if (syncLog) {
      await supabase
        .from('instagram_sync_log')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLog.id);
    }

    throw new Error(`Failed to sync Instagram data: ${error.message}`);
  }
}

/**
 * Generate insights from Instagram posts
 */
async function generateInstagramInsights(userId: string): Promise<InstagramInsight[]> {
  const supabase = await createClient();

  // Get all posts
  const { data: posts } = await supabase
    .from('instagram_posts')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (!posts || posts.length === 0) {
    return [];
  }

  const insights: any[] = [];

  // 1. Top Hashtags
  const hashtagFrequency: Record<string, number> = {};
  posts.forEach((post) => {
    post.hashtags?.forEach((tag: string) => {
      hashtagFrequency[tag] = (hashtagFrequency[tag] || 0) + 1;
    });
  });

  const topHashtags = Object.entries(hashtagFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  topHashtags.forEach(([hashtag, count], index) => {
    insights.push({
      user_id: userId,
      insight_type: 'top_hashtag',
      title: `#${hashtag}`,
      description: `You use this hashtag frequently in your content`,
      value: hashtag,
      metric_value: count,
      frequency: count,
      confidence_score: Math.max(0.5, 1 - index * 0.1),
    });
  });

  // 2. Content Themes (based on caption analysis)
  const themes = analyzeContentThemes(posts);
  themes.forEach((theme) => {
    insights.push({
      user_id: userId,
      insight_type: 'content_theme',
      title: theme.title,
      description: theme.whyItWorks || theme.description,
      value: theme.keywords.join(', '),
      metric_value: theme.frequency,
      frequency: theme.frequency,
      confidence_score: theme.confidence,
    });
  });

  // 3. Best Posting Times
  const postingTimes = posts.map((p) => new Date(p.timestamp).getHours());
  const bestHour = mode(postingTimes);
  const timeExplanation = getPostingTimeExplanation(bestHour);

  insights.push({
    user_id: userId,
    insight_type: 'best_posting_time',
    title: `Best Time: ${bestHour}:00`,
    description: timeExplanation,
    value: bestHour.toString(),
    metric_value: bestHour,
    frequency: postingTimes.filter((h) => h === bestHour).length,
    confidence_score: 0.7,
  });

  // 4. Top Performing Content with "Why It Works" analysis
  const topPosts = posts
    .filter((p) => p.performance_score > 50)
    .sort((a, b) => b.performance_score - a.performance_score)
    .slice(0, 3);

  topPosts.forEach((post, index) => {
    const whyItWorks = analyzePostPerformance(post, posts);

    insights.push({
      user_id: userId,
      insight_type: 'top_performing_content',
      title: `Top Post #${index + 1}`,
      description: whyItWorks,
      value: post.instagram_post_id,
      metric_value: post.performance_score,
      frequency: 1,
      confidence_score: 0.9 - index * 0.1,
      supporting_post_ids: [post.instagram_post_id],
      metadata: {
        caption: post.caption?.slice(0, 150),
        engagement_rate: post.engagement_rate,
        likes: post.like_count,
        comments: post.comment_count,
      },
    });
  });

  // Clear old insights
  await supabase.from('instagram_insights').delete().eq('user_id', userId);

  // Insert new insights
  const { data: insertedInsights } = await supabase
    .from('instagram_insights')
    .insert(insights)
    .select();

  return (insertedInsights || []) as InstagramInsight[];
}

/**
 * Analyze content themes from posts
 */
function analyzeContentThemes(posts: any[]): any[] {
  const themes: any[] = [];

  // Common wellness/content themes with explanations
  const themeKeywords: Record<string, { keywords: string[]; whyItWorks: string }> = {
    'Gut Health': {
      keywords: ['gut', 'digestion', 'microbiome', 'probiotic', 'ferment'],
      whyItWorks:
        'Gut health content performs well because it addresses a universal concern with clear, actionable solutions. Your audience responds to practical wellness advice.',
    },
    'Nutrition': {
      keywords: ['nutrition', 'food', 'recipe', 'meal', 'diet', 'eating'],
      whyItWorks:
        'Nutrition posts drive engagement through visual appeal and shareability. People save these for later reference, boosting your reach.',
    },
    'Wellness Tips': {
      keywords: ['wellness', 'health', 'tip', 'advice', 'self-care'],
      whyItWorks:
        'Quick wellness tips are highly shareable and position you as an authority. Bite-sized advice gets maximum engagement.',
    },
    'Fertility': {
      keywords: ['fertility', 'pregnancy', 'conception', 'ttc', 'ovulation'],
      whyItWorks:
        "Fertility content connects deeply with your audience's personal journey. Vulnerable, hopeful content builds strong community bonds.",
    },
    'Hormones': {
      keywords: ['hormone', 'hormonal', 'pcos', 'thyroid', 'cortisol'],
      whyItWorks:
        'Hormone health addresses an often-ignored topic. Your audience values education on this complex subject, driving saves and shares.',
    },
    'Mental Health': {
      keywords: ['mental', 'anxiety', 'stress', 'mindfulness', 'meditation'],
      whyItWorks:
        'Mental health content resonates because it normalizes struggles. Authentic vulnerability creates connection and engagement.',
    },
  };

  Object.entries(themeKeywords).forEach(([theme, config]) => {
    let count = 0;
    const matchingPosts: string[] = [];

    posts.forEach((post) => {
      const caption = (post.caption || '').toLowerCase();
      if (config.keywords.some((keyword) => caption.includes(keyword))) {
        count++;
        matchingPosts.push(post.instagram_post_id);
      }
    });

    if (count > 0) {
      themes.push({
        title: theme,
        description: `${count} posts • ${((count / posts.length) * 100).toFixed(0)}% of your content`,
        whyItWorks: config.whyItWorks,
        keywords: config.keywords,
        frequency: count,
        confidence: Math.min(1, count / posts.length),
        supportingPosts: matchingPosts,
      });
    }
  });

  return themes.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Explain why a posting time works well
 */
function getPostingTimeExplanation(hour: number): string {
  if (hour >= 6 && hour <= 9) {
    return 'Morning scrollers catching up on their feed with coffee';
  } else if (hour >= 12 && hour <= 14) {
    return 'Lunch break engagement - people take mental breaks';
  } else if (hour >= 17 && hour <= 20) {
    return 'Evening wind-down time - highest engagement window';
  } else if (hour >= 21 && hour <= 23) {
    return 'Night owls scrolling before bed';
  }
  return 'Your audience is most active at this hour';
}

/**
 * Analyze why a specific post performed well
 */
function analyzePostPerformance(post: any, allPosts: any[]): string {
  const reasons: string[] = [];

  // High engagement rate
  if (post.engagement_rate > 5) {
    reasons.push('Strong audience connection');
  }

  // Carousel post (typically performs better)
  if (post.media_type === 'CAROUSEL_ALBUM') {
    reasons.push('Carousel format keeps attention longer');
  }

  // Many hashtags
  if (post.hashtags && post.hashtags.length >= 5) {
    reasons.push('Strategic hashtag use expands reach');
  }

  // High comment-to-like ratio (indicates conversation)
  const commentRatio = post.comment_count / (post.like_count || 1);
  if (commentRatio > 0.05) {
    reasons.push('Sparked meaningful conversation');
  }

  // Check if it contains popular wellness keywords
  const caption = (post.caption || '').toLowerCase();
  if (caption.includes('gut') || caption.includes('wellness') || caption.includes('hormone')) {
    reasons.push('Addresses trending wellness topic');
  }

  // Timely post (recent posts perform differently)
  const daysOld = (Date.now() - new Date(post.timestamp).getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld < 7) {
    reasons.push('Recent & relevant');
  }

  if (reasons.length === 0) {
    return 'Consistent quality content resonates with your audience';
  }

  return reasons.slice(0, 3).join(' • ');
}

/**
 * Get mode (most frequent value) from array
 */
function mode(arr: number[]): number {
  const frequency: Record<number, number> = {};
  arr.forEach((val) => {
    frequency[val] = (frequency[val] || 0) + 1;
  });

  let maxFreq = 0;
  let mode = arr[0];

  Object.entries(frequency).forEach(([val, freq]) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = parseInt(val);
    }
  });

  return mode;
}

/**
 * Get user's Instagram insights
 */
export async function getInstagramInsights(userId: string): Promise<InstagramInsight[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('instagram_insights')
    .select('*')
    .eq('user_id', userId)
    .order('confidence_score', { ascending: false })
    .order('metric_value', { ascending: false });

  if (error) {
    console.error('Error fetching Instagram insights:', error);
    return [];
  }

  return data as InstagramInsight[];
}

/**
 * Get top performing Instagram posts
 */
export async function getTopInstagramPosts(
  userId: string,
  limit: number = 10
): Promise<InstagramPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_top_performing_instagram_posts', {
    p_user_id: userId,
    limit_count: limit,
  });

  if (error) {
    console.error('Error fetching top posts:', error);
    return [];
  }

  return data as InstagramPost[];
}

/**
 * Disconnect Instagram account
 */
export async function disconnectInstagramAccount() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Clear Instagram data from user
  await supabase
    .from('users')
    .update({
      instagram_username: null,
      instagram_user_id: null,
      instagram_access_token: null,
      instagram_profile_picture_url: null,
      instagram_bio: null,
      instagram_follower_count: null,
      instagram_following_count: null,
      instagram_posts_count: null,
      instagram_connected_at: null,
      instagram_last_synced_at: null,
    })
    .eq('id', user.id);

  // Delete posts and insights
  await supabase.from('instagram_posts').delete().eq('user_id', user.id);
  await supabase.from('instagram_insights').delete().eq('user_id', user.id);

  revalidatePath('/dashboard');
  revalidatePath('/profile');

  return { success: true };
}
