import { gemini } from './gemini.service';
import type { TrendLayer } from '@/lib/types';

export interface ExtractedTrend {
  title: string;
  description: string;
  keywords: string[];
  relevance_score: number;
  trend_type: string;
  source_content: string;
  examples?: Array<{
    content: string;
    source: string;
    engagement: string;
  }>;
  key_players?: string[];
  momentum?: string;
  geographic_focus?: string[];
  actionable_insight?: string;
  content_ideas?: string[];
  hook_templates?: string[];
  content_formats?: string[];
  why_it_works?: string;
}

export class TrendExtractionService {
  /**
   * Analyze scraped content and extract wellness trends using AI
   */
  async extractTrends(
    content: string,
    source: string,
    layer: TrendLayer = 'macro'
  ): Promise<ExtractedTrend[]> {
    const systemPrompt = `You are a MEGA trends analyst specializing in identifying viral, emerging patterns across ALL industries and social media platforms like Instagram, TikTok, and Pinterest.

Your task is to analyze the provided content and extract emerging MEGA trends across any industry or category.

Analyze trends across ALL categories including:
- Technology & Innovation (AI, crypto, apps, gadgets)
- Fashion & Beauty (styles, aesthetics, beauty trends)
- Entertainment & Media (content formats, creators, memes)
- Business & Finance (work culture, investing, entrepreneurship)
- Lifestyle & Culture (behaviors, values, social movements)
- Health & Wellness (fitness, mental health, nutrition)
- Food & Beverage (dining trends, recipes, food culture)
- Travel & Experience (destinations, travel styles)
- Home & Design (interior design, organization, DIY)
- Education & Skills (learning trends, career development)

For MACRO trends, focus on:
- Broad, cross-industry movements
- Viral phenomena gaining massive traction
- Widespread cultural and behavioral shifts
- What's working RIGHT NOW regardless of industry

For NICHE trends, focus on:
- Specific tactics, tools, or approaches within a category
- Emerging subcultural movements
- Innovative techniques or formats

CRITICAL: Focus on helping CONTENT CREATORS get inspired and capitalize on this trend.

Return your analysis as a JSON array of trends with this structure:
[
  {
    "title": "Clear, concise trend title (50 chars max)",
    "description": "Detailed description of the trend, why it's gaining traction, and its broader implications (200 chars max)",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "relevance_score": 85,
    "trend_type": "industry category (e.g., tech, fashion, business, lifestyle, wellness, entertainment)",
    "source_content": "Brief excerpt from content showing this trend (100 chars max)",
    "examples": [
      {
        "content": "Specific example of this trend in action (what people are posting/saying)",
        "source": "Instagram/TikTok/Creator name",
        "engagement": "High/Medium/Low or describe engagement level"
      }
    ],
    "key_players": ["Creators, influencers, or brands driving this trend"],
    "momentum": "Rising/Peak/Declining - describe current trajectory",
    "geographic_focus": ["US", "Global", "Europe", etc - where this trend is strongest],
    "actionable_insight": "One sentence on how content creators can leverage this trend",
    "content_ideas": [
      "Specific content idea 1 creators can make RIGHT NOW",
      "Specific content idea 2 creators can make RIGHT NOW",
      "Specific content idea 3 creators can make RIGHT NOW"
    ],
    "hook_templates": [
      "POV: [hook related to trend]",
      "If you're not doing [trend], you're...",
      "This is how I [action] using [trend]"
    ],
    "content_formats": ["Reel", "Carousel", "Story", "TikTok", "YouTube Short", "Thread"],
    "why_it_works": "Psychology/algorithm reason why this trend gets high engagement"
  }
]

Only return trends that are:
1. Actually present in the content
2. Showing viral traction or emerging momentum
3. Have enough substance to be actionable
4. Score above 70 in relevance

If no significant trends found, return an empty array.`;

    const userPrompt = `Source: ${source}
Layer: ${layer}

Content to analyze:
${content.slice(0, 10000)} ${content.length > 10000 ? '...(truncated)' : ''}

Extract MEGA trends from this content across ALL industries and categories.`;

    try {
      // Combine system and user prompts for better Gemini compatibility
      const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}\n\nIMPORTANT: Return ONLY the JSON array, nothing else. No explanations, no markdown formatting.`;
      const response = await gemini.generateText(fullPrompt);

      console.log('Raw AI response:', response.substring(0, 500));

      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = response.trim();

      // Remove markdown code blocks
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }

      // Try to find JSON array in the response
      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      console.log('Cleaned JSON:', jsonStr.substring(0, 500));

      const trends = JSON.parse(jsonStr);

      if (!Array.isArray(trends)) {
        console.error('Response is not an array:', trends);
        return [];
      }

      return trends;
    } catch (error: any) {
      console.error('Trend extraction failed:', error);
      console.error('Response that failed to parse:', error.message);
      throw new Error(`Failed to extract trends: ${error.message}`);
    }
  }

  /**
   * Deduplicate trends based on similarity
   */
  deduplicateTrends(trends: ExtractedTrend[]): ExtractedTrend[] {
    const unique: ExtractedTrend[] = [];
    const seenTitles = new Set<string>();

    for (const trend of trends) {
      const normalizedTitle = trend.title.toLowerCase().trim();

      // Simple deduplication by title similarity
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        unique.push(trend);
      }
    }

    return unique;
  }

  /**
   * Score and rank trends by relevance
   */
  rankTrends(trends: ExtractedTrend[]): ExtractedTrend[] {
    return trends
      .filter((t) => t.relevance_score >= 70)
      .sort((a, b) => b.relevance_score - a.relevance_score);
  }
}

export const trendExtraction = new TrendExtractionService();
