import { gemini } from '@/lib/services/gemini.service';
import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], userContext } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    const systemInstruction = `You are the OwnVoice AI Strategist, a boutique wellness content advisor.
Give concise, actionable advice about content strategy, trends, and content creation for wellness entrepreneurs.
${userContext ? `Creator context: ${userContext}` : ''}
Keep responses under 150 words. Be warm, specific, and strategic. Respond in the same language as the user.`;

    const conversationText =
      (history as { role: string; content: string }[])
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n') +
      `\nUser: ${message}\nAssistant:`;

    const response = await gemini.generateText(conversationText, systemInstruction);
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Chat failed' },
      { status: 500 }
    );
  }
}
