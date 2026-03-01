import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const funnel = user.metadata?.niche_funnel;
    const industries: string[] = user.metadata?.industries || (user.industry ? [user.industry] : []);
    const strategy = user.metadata?.strategy || {};

    // Build a niche context string from whichever is available
    const nicheContext = funnel?.microniche
      ? `${funnel.category} > ${funnel.subcategory} > ${funnel.microniche}`
      : funnel?.subcategory
      ? `${funnel.category} > ${funnel.subcategory}`
      : industries.filter(Boolean).join(', ') || strategy.niche || 'wellness & personal development';

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-pro-preview',
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    });

    const prompt = `You are a content trend analyst specializing in the creator economy.

The creator works in this niche: ${nicheContext}
Their positioning: ${strategy.positioning || 'Not specified'}
Their target audience: ${strategy.target_audience || 'Not specified'}

Generate 3–5 current, highly relevant hot topics, trends, or conversations happening RIGHT NOW in their niche that they could leverage for content creation. Focus on:
- Viral debates and discussions
- Emerging research or methodology shifts
- Cultural moments intersecting with their niche
- Audience pain points trending on social media

Return ONLY a plain paragraph (2–4 sentences) written naturally, as if briefing a creator before their content session. No bullet points, no headers. Write in English.`;

    const result = await model.generateContent(prompt);
    const hot_news = result.response.text().trim();

    if (!hot_news) {
      throw new Error('No content returned from AI');
    }

    // Persist to DB
    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      .update({
        metadata: {
          ...(user.metadata || {}),
          strategy: {
            ...(strategy || {}),
            hot_news,
          },
        },
      })
      .eq('id', user.id);

    if (error) throw new Error(`Failed to save: ${error.message}`);

    return NextResponse.json({ success: true, hot_news });
  } catch (error: any) {
    console.error('Refresh hot topics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to refresh hot topics' },
      { status: 500 }
    );
  }
}
