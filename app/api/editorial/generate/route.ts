import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CADENCE_DAYS: Record<number, string[]> = {
  3: ['Monday', 'Wednesday', 'Friday'],
  4: ['Monday', 'Tuesday', 'Thursday', 'Saturday'],
  5: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'],
  7: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cadence, mix } = await request.json();

    if (!cadence || !mix || !CADENCE_DAYS[cadence]) {
      return NextResponse.json({ error: 'Invalid cadence or mix' }, { status: 400 });
    }

    const strategy = (user.metadata as any)?.strategy || {};
    const niche_funnel = (user.metadata as any)?.niche_funnel || {};
    const industries: string[] = (user.metadata as any)?.industries || [];

    const nicheContext = niche_funnel?.microniche
      ? `${niche_funnel.category} > ${niche_funnel.subcategory} > ${niche_funnel.microniche}`
      : niche_funnel?.subcategory
      ? `${niche_funnel.category} > ${niche_funnel.subcategory}`
      : industries.filter(Boolean).join(', ') || strategy.niche || 'wellness & personal development';

    const pillars: { title: string; description: string }[] = strategy.content_pillars || [];
    const objectives: string[] = strategy.post_objectives || [];
    const days = CADENCE_DAYS[cadence];

    const pillarsText = pillars.length > 0
      ? pillars.map(p => `- ${p.title}${p.description ? `: ${p.description}` : ''}`).join('\n')
      : '(No pillars defined — infer 3–4 pillars from the niche context)';

    const objectivesText = objectives.length > 0 ? objectives.join(', ') : 'Visibility, Education & Authority';

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
    });

    const prompt = `You are an editorial strategist for content creators. Generate a precise, actionable 4-week content calendar.

Creator profile:
- Niche: ${nicheContext}
- Content Pillars:
${pillarsText}
- Post Objectives: ${objectivesText}
- Posting cadence: ${cadence} posts/week
- Content mix: ${mix.value}% Value, ${mix.authority}% Authority, ${mix.sales}% Sales

Week themes (apply strictly):
- Week 1: Awareness & Discovery
- Week 2: Depth & Education
- Week 3: Social Proof & Community
- Week 4: Activation & Conversion

Day slots for each week (same days every week): ${days.join(', ')}

Total posts across 4 weeks: ${cadence * 4}
Expected content type counts (approximate):
- Value: ~${Math.round(cadence * 4 * mix.value / 100)} posts
- Authority: ~${Math.round(cadence * 4 * mix.authority / 100)} posts
- Sales: ~${Math.round(cadence * 4 * mix.sales / 100)} posts

Return ONLY valid JSON matching this exact schema (no markdown, no explanations):
{
  "generated_at": "${new Date().toISOString()}",
  "cadence": ${cadence},
  "mix": ${JSON.stringify(mix)},
  "strategic_notes": "2–3 sentence note explaining the logic behind this month's plan and how it serves the creator's goals.",
  "weeks": [
    {
      "week": 1,
      "theme": "Awareness & Discovery",
      "posts": [
        {
          "day": "Monday",
          "pillar": "Exact pillar title from the list above",
          "contentType": "Value",
          "objective": "Visibility",
          "format": "Reel",
          "topic": "Specific, niche-tailored post topic as a full sentence",
          "hook": "Scroll-stopping opening sentence for the post"
        }
      ]
    }
  ]
}

CRITICAL RULES:
- Generate exactly ${cadence} posts per week, using exactly the days listed: ${days.join(', ')}
- Rotate pillars evenly — no single pillar should dominate any week
- Respect the content mix percentages across ALL 16+ posts (Value/${mix.value}%, Authority/${mix.authority}%, Sales/${mix.sales}%)
- Week 4 must have the highest concentration of Sales posts (Activation theme)
- Topics must be HYPER-SPECIFIC and niche-tailored. NOT generic ("5 signs your gut is inflamed after 35" not "health tips")
- Hooks must be compelling — use bold claims, surprising stats, relatable pain points, or provocative questions
- Match format to objective: Reels for Visibility, Carousels for Education & Authority, Stories for Connection, Static Posts for authority statements
- objective field must be one of: Visibility, Connection, Conversion, Education & Authority
- contentType must be one of: Value, Authority, Sales
- format must be one of: Reel, Carousel, Story, Static Post, Live, Newsletter
- Return ONLY raw JSON — no \`\`\`json fences, no preamble`;

    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();

    // Strip any markdown fences if present
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    const parsed = JSON.parse(raw);

    // Defensive validation
    if (!Array.isArray(parsed.weeks) || parsed.weeks.length !== 4) {
      throw new Error('AI returned an invalid plan structure (expected 4 weeks)');
    }
    if (!parsed.strategic_notes) parsed.strategic_notes = '';
    parsed.generated_at = new Date().toISOString();
    parsed.cadence = cadence;
    parsed.mix = mix;

    // Persist to Supabase
    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      .update({
        metadata: {
          ...(user.metadata || {}),
          editorial_plan: parsed,
        },
      })
      .eq('id', user.id);

    if (error) throw new Error(`Failed to save plan: ${error.message}`);

    return NextResponse.json({ success: true, plan: parsed });
  } catch (error: any) {
    console.error('Editorial generate error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate editorial plan' },
      { status: 500 }
    );
  }
}
