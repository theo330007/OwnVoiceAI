import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic, hook, pillar, contentType, format, nicheContext } = await request.json();

    if (!topic || !nicheContext) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Enrich with full user profile
    const strategy = (user.metadata as any)?.strategy || {};
    const verbalTerritory: string[] = strategy.verbal_territory || [];
    const profileLines = [
      strategy.biography       ? `Creator bio: ${strategy.biography}` : '',
      strategy.positioning     ? `Unique positioning: ${strategy.positioning}` : '',
      strategy.audience        ? `Target audience: ${strategy.audience}` : '',
      strategy.offering        ? `Core offering: ${strategy.offering}` : '',
      strategy.transformation  ? `Transformation they deliver: ${strategy.transformation}` : '',
      verbalTerritory.length   ? `Voice & style: ${verbalTerritory.join(', ')}` : '',
    ].filter(Boolean).join('\n');

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { temperature: 0.75, maxOutputTokens: 300 },
    });

    const prompt = `You are a content strategist for a creator in the ${nicheContext} space.

Creator profile:
${profileLines || `Niche: ${nicheContext}`}

Post to prepare:
- Topic: ${topic}
- Hook: "${hook}"
- Pillar: ${pillar}
- Type: ${contentType} | Format: ${format}

Generate exactly 3 short content angles or talking points the creator should cover in this post.
Each bullet must be actionable, deeply tailored to their voice and audience, and 1–2 sentences max.

Return ONLY valid JSON (no markdown):
{ "angles": ["...", "...", "..."] }`;

    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();
    if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Post brief generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate post brief' },
      { status: 500 }
    );
  }
}
