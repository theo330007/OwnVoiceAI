import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { pillar, contentType, format, objective, nicheContext, dayOfWeek } = await request.json();

    if (!pillar || !contentType || !nicheContext) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { temperature: 0.85, maxOutputTokens: 200 },
    });

    const prompt = `You are a content strategist for a ${nicheContext} creator.

Generate ONE post for this context:
- Pillar: ${pillar}
- Content type: ${contentType} (Value = educational/value-driven, Authority = credibility-building, Sales = conversion-focused)
- Format: ${format || 'Reel'}
- Objective: ${objective || 'Visibility'}
${dayOfWeek ? `- Day of week: ${dayOfWeek}` : ''}

Return ONLY valid JSON (no markdown):
{ "topic": "hyper-specific, niche-tailored post topic as a full sentence", "hook": "scroll-stopping opening line" }`;

    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();
    if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Quick post generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate post' },
      { status: 500 }
    );
  }
}
