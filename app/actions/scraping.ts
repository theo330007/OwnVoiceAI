'use server';

import { firecrawl } from '@/lib/services/firecrawl.service';
import { trendExtraction } from '@/lib/services/trend-extraction.service';
import { addTrend } from './trends';
import type { TrendLayer } from '@/lib/types';

export interface ScrapingConfig {
  platform: 'instagram' | 'tiktok' | 'pinterest' | 'custom';
  urls?: string[];
  hashtags?: string[];
  accounts?: string[];
  layer: TrendLayer;
}

export interface ScrapingResult {
  success: boolean;
  trendsFound: number;
  trendsAdded: number;
  errors: string[];
  trends: Array<{
    title: string;
    score: number;
  }>;
}

/**
 * Scrape Instagram and extract MEGA trends across all industries
 */
export async function scrapeInstagramTrends(
  config: ScrapingConfig
): Promise<ScrapingResult> {
  const errors: string[] = [];
  const allTrends: any[] = [];

  try {
    // Check if Firecrawl is configured
    if (!firecrawl.isConfigured()) {
      return {
        success: false,
        trendsFound: 0,
        trendsAdded: 0,
        errors: ['Firecrawl API key not configured. Add FIRECRAWL_API_KEY to .env.local'],
        trends: [],
      };
    }

    let scrapedContent: string[] = [];

    // Scrape based on configuration
    if (config.urls && config.urls.length > 0) {
      // Scrape specific URLs
      const results = await firecrawl.scrapeMultiple(config.urls);
      scrapedContent = results.map((r) => r.content);
    } else if (config.hashtags && config.hashtags.length > 0) {
      // Scrape Instagram hashtags
      for (const hashtag of config.hashtags) {
        try {
          const results = await firecrawl.searchInstagram(hashtag);
          scrapedContent.push(...results.map((r) => r.content));
        } catch (error: any) {
          errors.push(`Failed to scrape hashtag #${hashtag}: ${error.message}`);
        }
      }
    } else {
      return {
        success: false,
        trendsFound: 0,
        trendsAdded: 0,
        errors: ['No URLs or hashtags provided'],
        trends: [],
      };
    }

    // Extract trends from all scraped content
    for (const content of scrapedContent) {
      if (!content || content.trim().length === 0) continue;

      try {
        const extractedTrends = await trendExtraction.extractTrends(
          content,
          config.platform,
          config.layer
        );
        allTrends.push(...extractedTrends);
      } catch (error: any) {
        errors.push(`Trend extraction failed: ${error.message}`);
      }
    }

    // Deduplicate and rank trends
    const uniqueTrends = trendExtraction.deduplicateTrends(allTrends);
    const rankedTrends = trendExtraction.rankTrends(uniqueTrends);

    // Add trends to database
    let addedCount = 0;
    for (const trend of rankedTrends) {
      try {
        await addTrend({
          layer: config.layer,
          trend_type: trend.trend_type,
          title: trend.title,
          description: trend.description,
          keywords: trend.keywords,
          relevance_score: trend.relevance_score,
          source_url: `https://www.instagram.com`, // Could be more specific
          metadata: {
            examples: trend.examples || [],
            key_players: trend.key_players || [],
            momentum: trend.momentum || 'Unknown',
            geographic_focus: trend.geographic_focus || [],
            actionable_insight: trend.actionable_insight || '',
            source_content: trend.source_content || '',
          },
        });
        addedCount++;
      } catch (error: any) {
        errors.push(`Failed to add trend "${trend.title}": ${error.message}`);
      }
    }

    return {
      success: addedCount > 0,
      trendsFound: rankedTrends.length,
      trendsAdded: addedCount,
      errors,
      trends: rankedTrends.map((t) => ({
        title: t.title,
        score: t.relevance_score,
      })),
    };
  } catch (error: any) {
    return {
      success: false,
      trendsFound: 0,
      trendsAdded: 0,
      errors: [`Scraping failed: ${error.message}`],
      trends: [],
    };
  }
}

/**
 * Get popular trending hashtags for Instagram scraping (cross-industry)
 */
export async function getTrendingHashtags(): Promise<string[]> {
  return [
    'trending',
    'viral',
    'fyp',
    'explore',
    'tiktoktrends',
    'instagramtrends',
    'whatstrending',
    'viralvideos',
    'trendingnow',
    'explorepage',
  ];
}

/**
 * Get popular trend discovery URLs for scraping (cross-industry)
 */
export async function getTrendingUrls(): Promise<string[]> {
  return [
    'https://www.instagram.com/explore/',
    'https://trends.google.com/trends/',
    // Add more trend discovery sources as needed
  ];
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use getTrendingHashtags instead
 */
export async function getWellnessHashtags(): Promise<string[]> {
  return getTrendingHashtags();
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use getTrendingUrls instead
 */
export async function getWellnessUrls(): Promise<string[]> {
  return getTrendingUrls();
}
