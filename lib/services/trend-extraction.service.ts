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
    layer: TrendLayer = 'macro',
    industry?: string
  ): Promise<ExtractedTrend[]> {
    // For niche trends with specific industry, use industry-focused prompt
    if (layer === 'niche' && industry) {
      return this.extractIndustrySpecificTrends(content, source, industry);
    }

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
   * Extract industry-specific niche trends
   */
  async extractIndustrySpecificTrends(
    content: string,
    source: string,
    industry: string
  ): Promise<ExtractedTrend[]> {
    const industryFocus = {
      fertility: 'fertility, conception, IVF, reproductive health, pregnancy preparation, hormone balance',
      nutrition: 'nutrition, healthy eating, diet trends, supplements, meal planning, food science, nutritionists',
      wellness: 'wellness, holistic health, self-care, mindfulness, stress management, work-life balance',
      fitness: 'fitness, workouts, exercise trends, training methods, athletic performance, recovery',
      mentalhealth: 'mental health, therapy, anxiety management, depression support, psychological well-being, mindfulness',
      motherhood: 'motherhood, parenting, pregnancy, postpartum, child development, mom life',
      beauty: 'beauty, skincare, cosmetics, beauty routines, makeup techniques, skin health',
      health: 'health, preventive care, medical wellness, lifestyle medicine, longevity, immune health',
    };

    const focusArea = industryFocus[industry.toLowerCase() as keyof typeof industryFocus] || industry;

    const systemPrompt = `You are a ${industry} trends analyst specializing in identifying emerging content trends specifically within the ${industry} industry on Instagram, TikTok, and Pinterest.

Your task is to analyze the provided content and extract ONLY trends that are directly related to ${industry}.

Focus EXCLUSIVELY on ${focusArea}.

CRITICAL FILTERS - Reject trends that are:
- General lifestyle trends not specific to ${industry}
- Nostalgia or cultural movements (Y2K, 90s, etc.) unless directly applied to ${industry}
- Broad social movements (de-influencing, anti-consumerism) unless specifically about ${industry} products
- Fashion, entertainment, or tech trends unless they directly impact ${industry} content

ACCEPT trends that are:
- Specific ${industry} content formats, styles, or approaches
- ${industry}-specific techniques, methods, or practices
- Emerging topics within ${industry} gaining traction
- New ways ${industry} creators are presenting content
- ${industry}-specific product trends, ingredients, or tools
- Educational content trends within ${industry}

Return your analysis as a JSON array of trends with this structure:
[
  {
    "title": "Clear, concise trend title focused on ${industry} (50 chars max)",
    "description": "Detailed description of this ${industry} trend and why it's gaining traction (200 chars max)",
    "keywords": ["${industry}-specific keyword1", "keyword2", "keyword3"],
    "relevance_score": 85,
    "trend_type": "${industry}",
    "source_content": "Brief excerpt showing this ${industry} trend (100 chars max)",
    "examples": [
      {
        "content": "Specific ${industry} example",
        "source": "Instagram/TikTok/Creator name",
        "engagement": "High/Medium/Low"
      }
    ],
    "key_players": ["${industry} creators, experts, or brands driving this"],
    "momentum": "Rising/Peak/Declining",
    "geographic_focus": ["US", "Global", etc],
    "actionable_insight": "How ${industry} creators can leverage this trend",
    "content_ideas": [
      "Specific ${industry} content idea 1",
      "Specific ${industry} content idea 2",
      "Specific ${industry} content idea 3"
    ],
    "hook_templates": [
      "POV: [${industry} hook]",
      "If you're not [${industry} action], you're...",
      "This is how I [${industry} technique]"
    ],
    "content_formats": ["Reel", "Carousel", "Story", "TikTok"],
    "why_it_works": "Why this ${industry} trend gets high engagement"
  }
]

Only return trends that are:
1. DIRECTLY related to ${industry}
2. Specific to ${industry} content or practices
3. Showing traction within the ${industry} community
4. Score above 70 in relevance

If no ${industry}-specific trends found, return an empty array.`;

    const userPrompt = `Source: ${source}
Industry Focus: ${industry}

Content to analyze:
${content.slice(0, 10000)} ${content.length > 10000 ? '...(truncated)' : ''}

Extract ONLY ${industry}-specific niche trends. Ignore general lifestyle or cultural trends.`;

    try {
      const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}\n\nIMPORTANT: Return ONLY the JSON array of ${industry}-specific trends, nothing else.`;
      const response = await gemini.generateText(fullPrompt);

      console.log(`[${industry}] Raw AI response:`, response.substring(0, 500));

      // Extract JSON from response
      let jsonStr = response.trim();

      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }

      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      console.log(`[${industry}] Cleaned JSON:`, jsonStr.substring(0, 500));

      const trends = JSON.parse(jsonStr);

      if (!Array.isArray(trends)) {
        console.error('Response is not an array:', trends);
        return [];
      }

      // Additional filter: ensure trends are actually about the industry
      const filteredTrends = trends.filter(trend => {
        const combinedText = `${trend.title} ${trend.description} ${trend.keywords.join(' ')}`.toLowerCase();
        const industryKeywords = focusArea.toLowerCase().split(', ');

        // Check if at least one industry keyword appears in the trend
        return industryKeywords.some(keyword => combinedText.includes(keyword));
      });

      console.log(`[${industry}] Filtered ${filteredTrends.length} of ${trends.length} trends as industry-specific`);

      return filteredTrends;
    } catch (error: any) {
      console.error(`[${industry}] Trend extraction failed:`, error);
      throw new Error(`Failed to extract ${industry} trends: ${error.message}`);
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
