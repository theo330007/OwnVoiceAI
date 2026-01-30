// Firecrawl Service - Works with or without API key
// For now, we'll use a simple fetch-based approach
// Can be extended with Firecrawl SDK later

export interface ScrapeResult {
  url: string;
  content: string;
  metadata: {
    title?: string;
    description?: string;
    author?: string;
    publishedDate?: string;
    likes?: number;
    comments?: number;
    hashtags?: string[];
  };
}

export class FirecrawlService {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = process.env.FIRECRAWL_API_KEY || null;
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }

  /**
   * Scrape URL using Firecrawl API
   * Falls back to mock data if API not configured
   */
  async scrapeUrl(url: string): Promise<ScrapeResult> {
    if (!this.apiKey) {
      // Mock scraping for development
      return this.mockScrape(url);
    }

    try {
      const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          url,
          formats: ['markdown'],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        url,
        content: data.markdown || data.html || '',
        metadata: {
          title: data.metadata?.title,
          description: data.metadata?.description,
        },
      };
    } catch (error: any) {
      console.error('Firecrawl scraping failed:', error);
      // Fallback to mock on error
      return this.mockScrape(url);
    }
  }

  /**
   * Mock scraping for development/testing
   * Returns realistic Instagram wellness content
   */
  private mockScrape(url: string): ScrapeResult {
    const mockContent = `
# MEGA Trends from Instagram - What's Working RIGHT NOW

## AI-Generated Content Explosion
AI tools are becoming the norm across creative industries. From AI-generated images to AI video editing, creators are leveraging these tools to produce content faster than ever.

Key signals:
- Midjourney and DALL-E art flooding feeds
- AI voice cloning for content localization
- ChatGPT integration in workflows
- Automated video editing with tools like Descript

Real Examples:
• @creatorstudio posted: "Just made 30 pieces of content in 2 hours using Midjourney + CapCut. This is the future." - 145K likes
• @techcreators: "POV: You're a content creator in 2026 and AI does 80% of your editing" - High engagement, 2M views
• Major brands like Nike and Adobe now openly using AI tools in their content

Key Players: @creatorstudio, @aiartists, @techcreators, Adobe, Midjourney
Current Momentum: Peak - mainstream adoption happening NOW
Geographic Focus: Global, particularly strong in US, Europe, Asia

Content Ideas for Creators:
1. "Before/After" showing manual editing vs AI-assisted workflow - prove time savings
2. "My AI content creation tech stack" - showcase all tools you use
3. Tutorial Reel: "How I create 30 posts in 2 hours using AI"

Hook Templates:
- "POV: You're still editing content manually in 2026"
- "This AI tool just replaced my entire editing team"
- "If you're a content creator and NOT using AI, you're already behind"

Best Formats: Reel, TikTok, YouTube Short, Carousel
Why It Works: Novelty + Proof of efficiency. People love seeing time-saving hacks and the "future is here" narrative gets massive engagement.

## "Quiet Luxury" Aesthetic Dominance
The loud logo era is over. Minimalist, understated wealth signaling through quality and craftsmanship is the new status symbol.

Characteristics:
- Neutral color palettes (beige, cream, charcoal)
- Investment pieces over fast fashion
- "Stealth wealth" styling
- Row, The Row, Loro Piana aesthetic

Real Examples:
• @fashionista: "Old money aesthetic is the new flex. No logos, just quality." - 890K likes
• @styleinfluencer posted a capsule wardrobe with neutral tones - "This is what real wealth looks like" - High engagement
• Succession TV show popularized this look, now flooding feeds

Key Players: @fashionista, @oldmoneyaesthetic, @styleinfluencer, The Row brand, Loro Piana
Current Momentum: Rising - gaining massive traction across demographics
Geographic Focus: US, Europe (especially UK/Italy)

Content Ideas for Creators:
1. "How to look expensive on a budget" - Quiet luxury dupes and styling tips
2. "10 pieces for a capsule wardrobe" - Minimalist, timeless essentials
3. "Rich person aesthetic" transformation videos

Hook Templates:
- "Old money aesthetic is the new flex. No logos, just quality."
- "If you're still wearing loud logos, you're screaming 'I'm trying too hard'"
- "This is what REAL wealth looks like"

Best Formats: Carousel, Reel, Pinterest Pin, TikTok
Why It Works: Aspiration + Anti-consumerism. People want to look wealthy but hate being sold to. This trend satisfies both desires.

## Remote Work Location Arbitrage
Digital nomads are optimizing for cost of living while maintaining high salaries. Southeast Asia, Portugal, and Latin America are trending destinations.

Popular strategies:
- Living in low-cost countries with US/EU salaries
- Co-working spaces and nomad communities
- Geographic arbitrage lifestyle
- Building location-independent businesses

## Short-Form Video Dominance (TikTok, Reels, Shorts)
Attention spans are shrinking. Brands and creators are going all-in on vertical, fast-paced content under 60 seconds.

Winning formats:
- Hook in first 3 seconds
- Pattern interrupts every 3-5 seconds
- Fast cuts and transitions
- Trending audio usage

Real Examples:
• @mrbeast transitioned fully to short-form with massive success - "Long-form is dying, adapt or die"
• @contentking: "If you're not doing Reels in 2026, you're invisible" - 2.3M views, Medium engagement
• Brands report 10x more reach on Reels vs. static posts

Key Players: @mrbeast, @contentking, @tiktokguru, Meta, TikTok, YouTube
Current Momentum: Peak - fully mainstream, long-form struggling
Geographic Focus: Global phenomenon

Content Ideas for Creators:
1. Repurpose long-form content into 60-second highlights with punchy hooks
2. "Day in the life" fast-cut montages with trending audio
3. Educational content: "3 things you didn't know about [topic]"

Hook Templates:
- "If you're not doing Reels in 2026, you're invisible"
- "Long-form is dying. Here's what's working instead"
- "POV: You finally understand why everyone's obsessed with short-form"

Best Formats: Reel, TikTok, YouTube Short, Stories
Why It Works: Platform algorithms HEAVILY favor short-form. 3-second hook = algorithm push. Fast cuts = pattern interrupts = watch time.

## Micro-Communities Over Mass Audiences
People are leaving public social media for intimate Discord servers, Slack groups, and private communities. Exclusivity and authenticity are valued over reach.

Examples:
- Paid Discord communities
- Telegram channels
- Circle/Mighty Networks groups
- WhatsApp broadcast lists

## De-Influencing Movement
Anti-consumerism backlash against traditional influencer marketing. Creators are recommending AGAINST products and calling out overconsumption.

Themes:
- "What I won't buy anymore" content
- Minimalism and intentional consumption
- Calling out greenwashing
- Quality over quantity

## Personal Branding as a Career Moat
Building an online personal brand is seen as essential job security. Everyone is becoming a "creator" in their niche.

Tactics:
- LinkedIn thought leadership
- Twitter/X threads on expertise
- Newsletter as personal media company
- Speaking at conferences and podcasts

## Nostalgia Content (Y2K, 90s, Early 2000s)
Millennials and Gen Z are obsessed with early internet culture, flip phones, and pre-smartphone aesthetics.

Signals:
- Y2K fashion revival
- Butterfly clips and low-rise jeans
- "Core" aesthetic naming (cottagecore, regencycore)
- Vintage tech as status symbols

## Mental Health Transparency
Vulnerability and openly discussing struggles (burnout, anxiety, therapy) is normalized and even celebrated online.

Examples:
- "Real talk" content about mental health
- Therapy and self-development content
- Work-life balance advocacy
- Anti-hustle culture messaging

## Subscription Fatigue
Consumers are cutting back on subscription services. People are seeking ownership over rental models.

Backlash against:
- Streaming service proliferation
- SaaS subscription creep
- Subscription boxes
- "Everything as a service" model

#trending #viral #fyp #socialmedia #tech #fashion #business #lifestyle #culture #innovation
`;

    return {
      url,
      content: mockContent,
      metadata: {
        title: 'Instagram MEGA Trends - Cross-Industry',
        description: 'Latest viral trends across all industries from Instagram',
        hashtags: [
          'trending',
          'viral',
          'fyp',
          'tech',
          'fashion',
          'business',
          'lifestyle',
        ],
      },
    };
  }

  /**
   * Search Instagram for specific hashtags or keywords
   */
  async searchInstagram(query: string): Promise<ScrapeResult[]> {
    const searchUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(query)}/`;
    const result = await this.scrapeUrl(searchUrl);
    return [result];
  }

  /**
   * Scrape multiple URLs in parallel
   */
  async scrapeMultiple(urls: string[]): Promise<ScrapeResult[]> {
    const results = await Promise.allSettled(
      urls.map((url) => this.scrapeUrl(url))
    );

    return results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<ScrapeResult>).value);
  }
}

export const firecrawl = new FirecrawlService();
