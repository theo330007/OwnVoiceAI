# Instagram Scraping for Macro Trends - Documentation

## Overview

The Instagram Scraping feature automatically extracts wellness trends from Instagram content using AI analysis. It combines web scraping (Firecrawl) with AI-powered trend extraction (Gemini) to populate your macro trends automatically.

## How It Works

```
Instagram Content → Firecrawl Scraping → Gemini Analysis → Trend Extraction → Database Storage
```

### Workflow

1. **Scrape Instagram** - Firecrawl fetches content from Instagram hashtags or profiles
2. **AI Analysis** - Gemini 2.5 Flash analyzes content for wellness trends
3. **Trend Extraction** - AI identifies trends with titles, descriptions, keywords, and relevance scores
4. **Deduplication** - Removes duplicate trends
5. **Database Storage** - Adds unique, high-quality trends to your `trends` table

## Features

### ✅ Implemented

- **Hashtag Scraping** - Scrape specific Instagram hashtags (#wellness, #guthealth, etc.)
- **AI-Powered Extraction** - Gemini identifies trends from scraped content
- **Smart Scoring** - Each trend gets a relevance score (0-100)
- **Automatic Deduplication** - No duplicate trends added
- **Mock Mode** - Works without API keys for development/testing
- **Real-time Results** - See extracted trends immediately

### 🔮 Coming Soon (Extensible)

- TikTok scraping
- Pinterest scraping
- Twitter/X scraping
- Custom URL scraping
- Scheduled automatic scraping (via Inngest)
- Multi-platform aggregation

## Access

### From Admin Dashboard

1. Go to [/admin/dashboard](http://localhost:3000/admin/dashboard)
2. Find the **Instagram Scraper** card
3. Click "Scrape Trends Now" button
4. Wait 10-30 seconds for results
5. View extracted trends and see what was added

### From API

```typescript
POST /api/scrape/instagram

Body:
{
  "hashtags": ["wellness", "holistichealth", "guthealth"],
  "layer": "macro"  // or "niche"
}

Response:
{
  "success": true,
  "trendsFound": 8,
  "trendsAdded": 7,
  "trends": [
    { "title": "Gut Health Revolution", "score": 95 },
    { "title": "Hormonal Balance Naturally", "score": 90 },
    ...
  ],
  "errors": []
}
```

## Configuration

### Environment Variables

```bash
# Required for real Instagram scraping
FIRECRAWL_API_KEY=fc-your-key-here

# Required for AI trend extraction
GEMINI_API_KEY=AIzaSy...
```

### Without API Keys

The system works in **mock mode** if `FIRECRAWL_API_KEY` is not configured:
- Uses realistic sample Instagram content
- Still performs AI trend extraction
- Perfect for development and testing
- No external API costs

## Hashtags

### Default Wellness Hashtags

The scraper uses these hashtags by default:

- `#wellness`
- `#holistichealth`
- `#guthealth`

### Recommended Additional Hashtags

```typescript
// Macro trends
['wellness', 'holistichealth', 'guthealth', 'hormonalhealth',
 'functionalmedicine', 'womenshealth', 'stressmanagement', 'sleephealth']

// Niche trends
['fertility', 'adaptogens', 'seedcycling', 'omega3', 'microbiome',
 'vagusnervе', 'minerals', 'polyphenols']
```

## AI Trend Extraction

### What Gemini Looks For

The AI analyzes content for:

**Macro Trends:**
- Broad wellness movements
- Mainstream health shifts
- Consumer behavior changes
- Overarching themes

**Niche Trends:**
- Specific supplements or practices
- Emerging protocols
- Targeted health solutions
- Detailed techniques

### Trend Structure

Each extracted trend includes:

```typescript
{
  title: string;              // "Gut Health Revolution"
  description: string;        // Detailed explanation (200 chars)
  keywords: string[];         // ['gut health', 'microbiome', 'probiotics']
  relevance_score: number;    // 0-100 (only >70 saved)
  trend_type: string;         // 'gut-health', 'hormones', 'nutrition'
  source_content: string;     // Excerpt from Instagram content
}
```

### Quality Filters

- **Minimum Relevance:** 70/100
- **Deduplication:** Similar titles are merged
- **Ranking:** Sorted by relevance score
- **Validation:** Must be wellness-related

## Usage Examples

### Example 1: Basic Scraping

```typescript
import { scrapeInstagramTrends } from '@/app/actions/scraping';

const result = await scrapeInstagramTrends({
  platform: 'instagram',
  hashtags: ['wellness', 'holistichealth'],
  layer: 'macro'
});

console.log(`Found ${result.trendsFound} trends`);
console.log(`Added ${result.trendsAdded} to database`);
```

### Example 2: Custom URLs

```typescript
const result = await scrapeInstagramTrends({
  platform: 'instagram',
  urls: [
    'https://www.instagram.com/explore/tags/wellness/',
    'https://www.instagram.com/wellness_account/'
  ],
  layer: 'macro'
});
```

### Example 3: Niche Trends

```typescript
const result = await scrapeInstagramTrends({
  platform: 'instagram',
  hashtags: ['fertility', 'adaptogens', 'omega3'],
  layer: 'niche'
});
```

## Technical Architecture

### Services

**FirecrawlService** (`lib/services/firecrawl.service.ts`)
- Handles web scraping
- Falls back to mock data if API not configured
- Supports multiple URL scraping in parallel
- Instagram-specific search methods

**TrendExtractionService** (`lib/services/trend-extraction.service.ts`)
- AI-powered trend analysis using Gemini
- Structured JSON output
- Deduplication logic
- Relevance scoring

### Server Actions

**scrapeInstagramTrends** (`app/actions/scraping.ts`)
- Orchestrates scraping workflow
- Handles errors gracefully
- Returns detailed results
- Stores trends in database

### API Routes

**POST /api/scrape/instagram** (`app/api/scrape/instagram/route.ts`)
- Public API endpoint
- 60-second timeout for long scrapes
- Error handling and validation
- JSON response format

### UI Components

**InstagramScraper** (`app/admin/dashboard/components/InstagramScraper.tsx`)
- Beautiful Instagram-branded UI
- One-click scraping trigger
- Real-time results display
- Status indicators (success/error)

## Performance

### Scraping Speed

- **Mock Mode:** < 2 seconds
- **Real Scraping (3 hashtags):** 10-30 seconds
- **Real Scraping (10 hashtags):** 30-60 seconds

### Costs

- **Firecrawl:** ~$0.001 per page scraped
- **Gemini:** ~$0.00001 per trend extraction
- **Total:** ~$0.01-0.05 per scraping session

### Rate Limits

- Firecrawl: 100 requests/minute (typical)
- Gemini: 10 requests/second
- Recommended: Run scraping 1-2 times per day

## Best Practices

### 1. Scraping Frequency

- **Manual:** On-demand when you need fresh trends
- **Scheduled:** Daily or weekly (add Inngest later)
- **Event-driven:** Before creating content campaigns

### 2. Hashtag Selection

- Mix broad (`#wellness`) and specific (`#guthealth`) hashtags
- Rotate hashtags to get diverse trends
- Monitor trending hashtags in your niche

### 3. Quality Control

- Review extracted trends before using
- Delete low-quality or irrelevant trends
- Adjust relevance score thresholds as needed

### 4. Database Management

- Periodically archive old trends
- Keep trends table under 1000 records for performance
- Use `updated_at` to track freshness

## Troubleshooting

### "Firecrawl API key not configured"

**Solution:** Add `FIRECRAWL_API_KEY=fc-your-key` to `.env.local`

The system will fall back to mock data, which still works for testing.

### "No trends found"

**Possible causes:**
- Content doesn't contain wellness trends
- Relevance scores all below 70
- Gemini extraction failed

**Solution:** Try different hashtags or check Gemini API key

### "Trends added: 0" but "Trends found: 5"

**Possible causes:**
- Trends already exist in database (duplicates)
- Database error during insertion

**Solution:** Check browser console and Supabase logs

### Slow scraping (>60 seconds)

**Possible causes:**
- Too many hashtags (>10)
- Firecrawl rate limiting
- Large Instagram pages

**Solution:** Reduce hashtag count or scrape in batches

## Extending to Other Platforms

### Adding TikTok

```typescript
// lib/services/tiktok.service.ts
export class TikTokService {
  async scrapeTikTok(hashtag: string) {
    // Similar to Firecrawl approach
    // Use TikTok API or web scraping
  }
}
```

### Adding Pinterest

```typescript
// lib/services/pinterest.service.ts
export class PinterestService {
  async scrapePinterest(board: string) {
    // Pinterest API or Firecrawl
  }
}
```

### Universal Scraper Pattern

All platforms follow the same pattern:
1. Scrape content
2. Extract text/markdown
3. Feed to Gemini for trend analysis
4. Store in trends table

## Related Files

### Core Services
- `lib/services/firecrawl.service.ts` - Web scraping
- `lib/services/trend-extraction.service.ts` - AI analysis
- `lib/services/gemini.service.ts` - Gemini AI client

### Actions & Routes
- `app/actions/scraping.ts` - Server actions
- `app/api/scrape/instagram/route.ts` - API endpoint

### UI Components
- `app/admin/dashboard/components/InstagramScraper.tsx` - UI

### Types
- `lib/types/index.ts` - TrendLayer, ScrapingConfig, etc.

## Future Roadmap

### Phase 2: Automation
- [ ] Inngest scheduled jobs
- [ ] Automatic daily scraping
- [ ] Email notifications when new trends found
- [ ] Trend change detection

### Phase 3: Multi-Platform
- [ ] TikTok integration
- [ ] Pinterest integration
- [ ] Twitter/X integration
- [ ] YouTube community posts

### Phase 4: Advanced Features
- [ ] Trend sentiment analysis
- [ ] Engagement metric tracking
- [ ] Influencer identification
- [ ] Viral content prediction
- [ ] Custom scraping rules

## Support

For issues with Instagram scraping:
1. Check environment variables (`.env.local`)
2. Verify Firecrawl API key is valid
3. Test with mock mode first
4. Check browser console for errors
5. Review Supabase logs

---

**Last Updated:** January 2026
**Version:** 1.0.0 (MVP)
