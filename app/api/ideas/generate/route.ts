import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type FormatKey = 'carousel' | 'reel' | 'storytelling' | 'sales';
type ContentType = 'Value' | 'Authority' | 'Sales';

// ─── Date Utilities ───────────────────────────────────────────────────────────

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Posting days per cadence (0=Sun, 1=Mon, ...)
const CADENCE_DAYS: Record<number, number[]> = {
  3: [1, 3, 5],          // Mon, Wed, Fri
  4: [1, 2, 4, 6],       // Mon, Tue, Thu, Sat
  5: [1, 2, 3, 4, 5],    // Mon–Fri
  7: [0, 1, 2, 3, 4, 5, 6],
};

function getNextPostingDates(count: number, cadence: number): { date: string; day_name: string }[] {
  const postingDays = CADENCE_DAYS[cadence] || CADENCE_DAYS[4];
  const result: { date: string; day_name: string }[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1); // start from tomorrow
  d.setHours(0, 0, 0, 0);

  while (result.length < count) {
    if (postingDays.includes(d.getDay())) {
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      result.push({ date: `${y}-${mo}-${da}`, day_name: DAY_NAMES[d.getDay()] });
    }
    d.setDate(d.getDate() + 1);
  }
  return result;
}

// Map format → content type
const FORMAT_CONTENT_TYPE: Record<FormatKey, ContentType> = {
  carousel:     'Value',
  reel:         'Authority',
  storytelling: 'Value',
  sales:        'Sales',
};

const FORMAT_OBJECTIVE: Record<FormatKey, string> = {
  carousel:     'Visibility',
  reel:         'Authority',
  storytelling: 'Connection',
  sales:        'Conversion',
};

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pillar, angle, sources } = await request.json();

    if (!pillar?.title || !angle || !Array.isArray(sources) || sources.length === 0) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const strategy = (user.metadata as any)?.strategy || {};
    const niche_funnel = (user.metadata as any)?.niche_funnel || {};
    const industries: string[] = (user.metadata as any)?.industries || [];
    const editorialPrefs = (user.metadata as any)?.editorial_preferences || {};

    // Editorial preferences
    const cadence: number = editorialPrefs.cadence ?? 4;

    // Build niche context
    const nicheContext = niche_funnel?.microniche
      ? `${niche_funnel.category} > ${niche_funnel.subcategory} > ${niche_funnel.microniche}`
      : niche_funnel?.subcategory
      ? `${niche_funnel.category} > ${niche_funnel.subcategory}`
      : industries.filter(Boolean).join(', ') || strategy.niche || 'wellness & personal development';

    const vt = strategy.verbal_territory || {};
    const tone = vt.tone || strategy.desired_tone || 'authentic and expert';
    const style = vt.style || 'conversational and story-driven';
    const useWords: string[] = vt.preferred_vocabulary || strategy.brand_words || [];
    const avoidWords: string[] = vt.words_to_avoid || [];
    const positioning = strategy.positioning || '';
    const targetAudience = strategy.target_audience || '';
    const transformation = strategy.transformation || '';
    const hotNews = strategy.hot_news || '';

    const allPillars: { title: string }[] = strategy.content_pillars || [];

    const angleDescriptions: Record<string, string> = {
      standard: 'natural, on-brand, aligned with their established voice and values',
      differentiating: 'explicitly challenges the most common approach or advice in this niche — show why the mainstream view is wrong or incomplete',
      polarizing: 'takes a bold, divisive stance that intentionally sparks debate — provoke, challenge sacred cows, and invite strong reactions',
    };

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { temperature: 0.92, maxOutputTokens: 3072 },
    });

    const prompt = `You are an expert content strategist generating 21 hyper-specific content ideas for a creator.

CREATOR PROFILE:
- Niche: ${nicheContext}
- Positioning: ${positioning || 'Expert creator in their niche'}
- Target audience: ${targetAudience || 'Engaged niche audience'}
- Transformation they deliver: ${transformation || 'Real, measurable results'}
- Voice tone: ${tone}
- Communication style: ${style}
${useWords.length > 0 ? `- Vocabulary to USE: ${useWords.join(', ')}` : ''}
${avoidWords.length > 0 ? `- Vocabulary to AVOID: ${avoidWords.join(', ')}` : ''}
${hotNews ? `- Current hot topic in their niche: ${hotNews}` : ''}
${allPillars.length > 1 ? `- Other content pillars (for context): ${allPillars.filter(p => p.title !== pillar.title).map(p => p.title).join(', ')}` : ''}

ACTIVE PILLAR: "${pillar.title}"${pillar.description ? ` — ${pillar.description}` : ''}

ANGLE: ${angle} — ${angleDescriptions[angle] || angleDescriptions.standard}

SOURCES (draw from these, label each idea accordingly):
${sources.join(', ')}
- Inspiration: brand values, aspirational lifestyle, personal experience storytelling
- News: current events, trending conversations${hotNews ? `, hot topic: "${hotNews}"` : ''}
- Competition: what others in ${nicheContext} typically post — but differentiate or flip it
- Global Trends: macro cultural, societal, or behavioral shifts relevant to the niche
- Niche Trends: specific micro-movements, emerging conversations within ${nicheContext}

Generate EXACTLY 21 ideas as JSON with this structure (no markdown fences, raw JSON only):
{
  "carousel": [ /* exactly 10 items */ ],
  "reel": [ /* exactly 5 items */ ],
  "storytelling": [ /* exactly 3 items */ ],
  "sales": [ /* exactly 3 items */ ]
}

Each item: { "hook": "...", "concept": "...", "cta": "...", "source_type": "..." }

FORMAT RULES:
- carousel: educational frameworks, myth-busting listicles, swipeable step-by-step guides, comparison breakdowns — designed for saves
- reel: punchy pattern-interrupt hooks, quick POV takes, before/after scenarios, 15-30 second transformations — designed for reach
- storytelling: personal narrative arcs starting with "When I…" or "I used to think…", vulnerability moments, real-life examples — designed for connection
- sales: desire-first hooks, outcome-led framing, problem-agitate-solve structure, direct CTA toward an offer — designed for conversion

QUALITY RULES:
- Apply the ANGLE (${angle}) to EVERY single idea — not just some
- source_type must be one of: ${sources.join(', ')}
- Distribute source_types across the 21 ideas — not all from one source
- Hooks must be scroll-stopping: surprising stats, bold claims, relatable pain points, counter-intuitive angles
- Topics must be SPECIFIC to "${pillar.title}" and "${nicheContext}" — never generic
- Do NOT use "wellness tips", "healthy habits", "grow your business" or other vague titles
- Vocabulary: ${useWords.length > 0 ? `naturally use terms like ${useWords.join(', ')}` : 'use natural, niche-specific language'}
- Return ONLY raw JSON — no \`\`\`json fences, no preamble, no explanation`;

    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();

    // Strip markdown fences if AI added them
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    const parsed = JSON.parse(raw);

    // Defensive validation
    if (!Array.isArray(parsed.carousel) || !Array.isArray(parsed.reel) ||
        !Array.isArray(parsed.storytelling) || !Array.isArray(parsed.sales)) {
      throw new Error('AI returned an invalid ideas structure');
    }

    // Ensure counts are right (pad or trim gracefully)
    const ensure = (arr: any[], count: number) =>
      arr.length >= count ? arr.slice(0, count) : arr;

    const grouped = {
      carousel:     ensure(parsed.carousel, 10),
      reel:         ensure(parsed.reel, 5),
      storytelling: ensure(parsed.storytelling, 3),
      sales:        ensure(parsed.sales, 3),
    };

    // ─── Assign calendar dates ─────────────────────────────────────────────────
    // Interleave formats: 1 carousel, 1 reel, 1 storytelling, 1 sales, then surplus carousel
    const pools: Record<FormatKey, any[]> = {
      carousel:     [...grouped.carousel],
      reel:         [...grouped.reel],
      storytelling: [...grouped.storytelling],
      sales:        [...grouped.sales],
    };

    const interleaved: { idea: any; format: FormatKey }[] = [];
    const fmtOrder: FormatKey[] = ['carousel', 'reel', 'storytelling', 'sales'];

    while (fmtOrder.some(f => pools[f].length > 0)) {
      for (const fmt of fmtOrder) {
        if (pools[fmt].length > 0) {
          interleaved.push({ idea: pools[fmt].shift(), format: fmt });
        }
      }
    }

    const dates = getNextPostingDates(interleaved.length, cadence);

    const scheduledInterleaved = interleaved.map((item, i) => ({
      ...item.idea,
      format: item.format,
      contentType: FORMAT_CONTENT_TYPE[item.format],
      scheduled_date: dates[i].date,
      day_name: dates[i].day_name,
    }));

    // Re-group by format (with dates attached)
    const withDates = {
      carousel:     scheduledInterleaved.filter(i => i.format === 'carousel'),
      reel:         scheduledInterleaved.filter(i => i.format === 'reel'),
      storytelling: scheduledInterleaved.filter(i => i.format === 'storytelling'),
      sales:        scheduledInterleaved.filter(i => i.format === 'sales'),
    };

    return NextResponse.json({
      ...withDates,
      total_scheduled: scheduledInterleaved.length,
      first_date: dates[0]?.date,
      last_date: dates[dates.length - 1]?.date,
    });
  } catch (error: any) {
    console.error('Ideas generate error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate ideas' },
      { status: 500 }
    );
  }
}
