import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { APP_GUIDE } from '@/lib/help/app-guide';

export const runtime = 'nodejs';
export const maxDuration = 30;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function describeCurrentPage(pathname: string): string {
  if (pathname.startsWith('/editorial')) return 'The user is currently on the Editorial Calendar page — the 4-week content planning tool where they can configure cadence, content mix, routine, and generate or reschedule posts.';
  if (pathname.startsWith('/discover')) return 'The user is currently on the Discover page — the trend radar and AI idea generator for macro trends, niche signals, and personalised content ideas.';
  if (pathname.startsWith('/lab')) return 'The user is currently on the OwnVoice Lab — the AI content studio for validating ideas, generating assets (hooks, captions, scripts), and creating full content workflows.';
  if (pathname.startsWith('/projects')) return 'The user is currently on the Projects page — where they track content pieces from idea to published, and link projects to editorial calendar slots.';
  if (pathname.startsWith('/profile')) return 'The user is currently on the Profile/Settings page — where they set their content pillars, niche, and persona that drive all AI generation across the app.';
  if (pathname.startsWith('/integrations')) return 'The user is currently on the Integrations page — where they can connect social accounts like Instagram.';
  if (pathname.startsWith('/dashboard')) return 'The user is currently on the Dashboard — the main overview showing a preview of their editorial calendar and shortcuts to key features.';
  return 'The user is navigating the OwnVoice AI app.';
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], pathname, userContext } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    const pageContext = describeCurrentPage(pathname || '');

    const systemInstruction = `You are the OwnVoice Guide — a friendly, concise in-app assistant helping creators navigate and get the most out of OwnVoice AI.

${APP_GUIDE}

---
CURRENT CONTEXT:
${pageContext}
${userContext ? `User profile: ${userContext}` : ''}

INSTRUCTIONS:
- Answer questions about the app's features, navigation, and workflow
- Give page-specific tips when the user's question is relevant to where they currently are
- Use the user's niche, pillars, and strategy to make examples concrete and personalised
- Keep responses concise (under 130 words), warm, and actionable — no long essays
- If the user seems lost or unsure where to start, guide them: Profile → Editorial → Discover → Lab
- Never invent features that aren't described in the guide above
- If you don't know something, say so honestly and suggest where to look
- Respond in the same language as the user`;

    const conversationText =
      (history as { role: string; content: string }[])
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n') +
      `\nUser: ${message}\nAssistant:`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: conversationText,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 512,
        temperature: 0.7,
      },
    } as any);

    const parts = (result as any).candidates?.[0]?.content?.parts;
    const response = parts?.find((p: any) => p.text)?.text ?? '';

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Help chat error:', error);
    return NextResponse.json({ error: error.message || 'Chat failed' }, { status: 500 });
  }
}
