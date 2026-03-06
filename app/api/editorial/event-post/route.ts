import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventName, trendTitle, trendDescription, nicheContext, pillar } =
      await request.json();

    if (!nicheContext) {
      return NextResponse.json({ error: 'Missing nicheContext' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { temperature: 0.7, maxOutputTokens: 256 },
    });

    const prompt = `You are a content strategist. Generate ONE social media post for this creator.

Creator niche: ${nicheContext}
${eventName ? `Event: ${eventName}` : `Trending topic: ${trendTitle}\n${trendDescription || ''}`}
${pillar ? `Content pillar: ${pillar}` : ''}

Return ONLY valid JSON (no markdown, no fences):
{
  "topic": "specific post topic tied to the event/trend and the creator's niche",
  "hook": "compelling opening line",
  "format": "Reel",
  "contentType": "Value",
  "objective": "Visibility"
}

format must be one of: Reel, Carousel, Story, Static Post
contentType must be one of: Value, Authority, Sales
objective must be one of: Visibility, Connection, Conversion, Education & Authority`;

    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();

    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Event post generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate event post' },
      { status: 500 }
    );
  }
}
