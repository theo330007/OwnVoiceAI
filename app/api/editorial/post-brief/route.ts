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

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { temperature: 0.75, maxOutputTokens: 256 },
    });

    const prompt = `You are a content strategist for a ${nicheContext} creator.

Post:
- Topic: ${topic}
- Hook: "${hook}"
- Pillar: ${pillar}
- Type: ${contentType} | Format: ${format}

Generate exactly 3 short content angles or talking points the creator should cover in this post.
Each bullet should be actionable, niche-specific, and 1–2 sentences.

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
