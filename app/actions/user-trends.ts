'use server';

import { createClient } from '@/lib/supabase';
import type { Trend } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { firecrawl } from '@/lib/services/firecrawl.service';
import { trendExtraction } from '@/lib/services/trend-extraction.service';

export async function getUserNicheTrends(userId: string): Promise<Trend[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('trends')
    .select('*')
    .eq('layer', 'niche')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user niche trends:', error);
    return [];
  }

  return data as Trend[];
}

export async function addUserNicheTrend(userId: string, trend: {
  trend_type: string;
  title: string;
  description: string;
  source_url?: string;
  keywords: string[];
  relevance_score?: number;
  metadata?: any;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('trends')
    .insert({
      layer: 'niche',
      user_id: userId,
      trend_type: trend.trend_type,
      title: trend.title,
      description: trend.description,
      source_url: trend.source_url || null,
      keywords: trend.keywords,
      relevance_score: trend.relevance_score || 75,
      metadata: trend.metadata || {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add niche trend: ${error.message}`);
  }

  revalidatePath(`/admin/users/${userId}`);

  return data;
}

export async function updateUserNicheTrend(
  trendId: string,
  userId: string,
  updates: {
    title?: string;
    description?: string;
    keywords?: string[];
    relevance_score?: number;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('trends')
    .update(updates)
    .eq('id', trendId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update niche trend: ${error.message}`);
  }

  revalidatePath(`/admin/users/${userId}`);

  return data;
}

export async function deleteUserNicheTrend(trendId: string, userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('trends')
    .delete()
    .eq('id', trendId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete niche trend: ${error.message}`);
  }

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath('/dashboard');
}

export async function getStrategicInsights(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('strategic_insights')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching strategic insights:', error);
    return [];
  }

  return data;
}

/**
 * Generate strategic content insights for a niche trend using AI
 */
export async function generateStrategicInsight(trendId: string, userId: string) {
  const supabase = await createClient();

  try {
    // Fetch the trend details
    const { data: trend, error: trendError } = await supabase
      .from('trends')
      .select('*')
      .eq('id', trendId)
      .eq('user_id', userId)
      .single();

    if (trendError || !trend) {
      throw new Error('Trend not found');
    }

    // Build the AI prompt
    const prompt = `You are a strategic content advisor for wellness creators. Based on the following niche trend, generate 4 specific content ideas (one for each content type listed below).

NICHE TREND DETAILS:
Title: ${trend.title}
Description: ${trend.description}
Keywords: ${trend.keywords.join(', ')}
Why It Works: ${trend.metadata?.why_it_works || 'N/A'}
Content Ideas: ${trend.metadata?.content_ideas?.join(', ') || 'N/A'}
Actionable Insight: ${trend.metadata?.actionable_insight || 'N/A'}

Generate 4 DETAILED content ideas, one for each of these content types:

1. **Educational / Value-First Content**
   - Teaches something practical or shares valuable information
   - Establishes authority and trust
   - Example formats: "How to", "5 tips for", "What you need to know about"

2. **Behind-the-Scenes / "Daily Life" Sharing**
   - Shows the real, unfiltered side of your journey
   - Builds personal connection and relatability
   - Example formats: "A day in my life", "What I actually eat", "My morning routine"

3. **Promotional / Product-Focused**
   - Showcases a product, service, or program you offer
   - Positioned as a solution to a problem
   - Example formats: "How [product] helped me", "Why I created [service]", "[Product] review"

4. **Interactive / Community-Building**
   - Encourages conversation, engagement, and participation
   - Builds community and loyalty
   - Example formats: "Ask me anything", "Poll: Which one?", "Share your experience with..."

For EACH content type, provide:
- A compelling hook (1-2 sentences to grab attention)
- The main content concept (2-3 sentences describing what the content would cover)
- A call-to-action (what you want viewers to do)

Return your response as a JSON object with this structure:
{
  "educational": {
    "hook": "...",
    "concept": "...",
    "cta": "..."
  },
  "behind_the_scenes": {
    "hook": "...",
    "concept": "...",
    "cta": "..."
  },
  "promotional": {
    "hook": "...",
    "concept": "...",
    "cta": "..."
  },
  "interactive": {
    "hook": "...",
    "concept": "...",
    "cta": "..."
  }
}`;

    // Call Gemini to generate insights
    const gemini = (await import('@/lib/services/gemini.service')).gemini;
    const response = await gemini.generateText(prompt);

    // Parse the JSON response
    let jsonStr = response.trim();

    // Remove markdown code blocks
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    // Try to find JSON object in the response
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const insights = JSON.parse(jsonStr);

    // Save to database
    const { data: savedInsight, error: saveError } = await supabase
      .from('strategic_insights')
      .insert({
        user_id: userId,
        trend_id: trendId,
        trend_title: trend.title,
        content_ideas: insights,
        metadata: {
          trend_keywords: trend.keywords,
          trend_description: trend.description,
        },
      })
      .select()
      .single();

    if (saveError) {
      throw new Error(`Failed to save strategic insight: ${saveError.message}`);
    }

    revalidatePath('/dashboard');
    revalidatePath(`/admin/users/${userId}`);

    return savedInsight;
  } catch (error: any) {
    console.error('Strategic insight generation failed:', error);
    throw new Error(`Failed to generate strategic insight: ${error.message}`);
  }
}

/**
 * Scrape Instagram trends for a specific user based on their industry
 * Replaces existing niche trends for the user
 */
export async function scrapeUserInstagramTrends(userId: string, userIndustry: string) {
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

    // Generate industry-specific hashtags
    const industryHashtags = getIndustryHashtags(userIndustry);

    if (industryHashtags.length === 0) {
      errors.push(`No hashtags configured for industry: ${userIndustry}`);
    }

    let scrapedContent: string[] = [];

    // Scrape Instagram hashtags for the user's industry
    for (const hashtag of industryHashtags) {
      try {
        const results = await firecrawl.searchInstagram(hashtag);
        scrapedContent.push(...results.map((r) => r.content));
      } catch (error: any) {
        errors.push(`Failed to scrape hashtag #${hashtag}: ${error.message}`);
      }
    }

    if (scrapedContent.length === 0) {
      return {
        success: false,
        trendsFound: 0,
        trendsAdded: 0,
        errors: errors.length > 0 ? errors : ['No content could be scraped'],
        trends: [],
      };
    }

    // Extract trends from all scraped content
    for (const content of scrapedContent) {
      if (!content || content.trim().length === 0) continue;

      try {
        const extractedTrends = await trendExtraction.extractTrends(
          content,
          'instagram',
          'niche',
          userIndustry  // Pass industry for filtering
        );
        allTrends.push(...extractedTrends);
      } catch (error: any) {
        errors.push(`Trend extraction failed: ${error.message}`);
      }
    }

    // Deduplicate and rank trends
    const uniqueTrends = trendExtraction.deduplicateTrends(allTrends);
    const rankedTrends = trendExtraction.rankTrends(uniqueTrends);

    // Delete existing niche trends for this user
    const supabase = await createClient();
    await supabase
      .from('trends')
      .delete()
      .eq('layer', 'niche')
      .eq('user_id', userId);

    // Add new trends to database
    let addedCount = 0;
    for (const trend of rankedTrends) {
      try {
        await addUserNicheTrend(userId, {
          trend_type: trend.trend_type,
          title: trend.title,
          description: trend.description,
          keywords: trend.keywords,
          relevance_score: trend.relevance_score,
          source_url: 'https://www.instagram.com',
          metadata: {
            examples: trend.examples || [],
            key_players: trend.key_players || [],
            momentum: trend.momentum || 'Unknown',
            geographic_focus: trend.geographic_focus || [],
            actionable_insight: trend.actionable_insight || '',
            content_ideas: trend.content_ideas || [],
            hook_templates: trend.hook_templates || [],
            content_formats: trend.content_formats || [],
            why_it_works: trend.why_it_works || '',
            source_content: trend.source_content || '',
          },
        });
        addedCount++;
      } catch (error: any) {
        errors.push(`Failed to add trend "${trend.title}": ${error.message}`);
      }
    }

    revalidatePath('/dashboard');
    revalidatePath(`/admin/users/${userId}`);

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
 * Get industry-specific hashtags for scraping
 */
function getIndustryHashtags(industry: string): string[] {
  const industryMap: Record<string, string[]> = {
    fertility: ['fertility', 'fertilityjourney', 'ttc', 'ivf', 'infertility', 'fertilityawareness'],
    wellness: ['wellness', 'wellnessjourney', 'holistichealth', 'mindfulness', 'selfcare'],
    nutrition: ['nutrition', 'healthyeating', 'nutritiontips', 'healthyfood', 'nutritionist'],
    fitness: ['fitness', 'fitnessmotivation', 'workout', 'fitfam', 'fitnessjourney'],
    mentalhealth: ['mentalhealth', 'mentalhealthawareness', 'anxiety', 'depression', 'therapy'],
    motherhood: ['motherhood', 'momlife', 'pregnancy', 'newmom', 'parenthood'],
    beauty: ['beauty', 'skincare', 'beautytips', 'makeuptutorial', 'beautycommunity'],
    health: ['health', 'healthylifestyle', 'healthyliving', 'healthtips', 'healthandwellness'],
  };

  // Return industry-specific hashtags or general wellness hashtags as fallback
  return industryMap[industry.toLowerCase()] || industryMap['wellness'] || [];
}
