'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase';
import { createWorkflow } from './workflows';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type ContentType = 'educational' | 'behind_the_scenes' | 'promotional' | 'interactive';

interface ConversationMessage {
  role: string;
  content: string;
}

interface SynthesizedInsight {
  trend_title: string;
  content_ideas: {
    educational: { hook: string; concept: string; cta: string };
    behind_the_scenes: { hook: string; concept: string; cta: string };
    promotional: { hook: string; concept: string; cta: string };
    interactive: { hook: string; concept: string; cta: string };
  };
}

async function synthesizeConversation(messages: ConversationMessage[]): Promise<SynthesizedInsight> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const conversationText = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
    .join('\n\n');

  const prompt = `Based on this content validation conversation, synthesize the core content idea into a structured brief.

CONVERSATION:
${conversationText}

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "trend_title": "A concise 3-7 word title capturing the content idea",
  "content_ideas": {
    "educational": {
      "hook": "An engaging hook for an educational post about this topic",
      "concept": "The educational angle and key takeaway",
      "cta": "Call to action for educational content"
    },
    "behind_the_scenes": {
      "hook": "Hook for a behind-the-scenes angle",
      "concept": "What behind-the-scenes story to tell",
      "cta": "Call to action"
    },
    "promotional": {
      "hook": "Hook for a promotional angle",
      "concept": "How to tie this topic to an offer or service",
      "cta": "Call to action"
    },
    "interactive": {
      "hook": "Hook for an interactive/engagement post",
      "concept": "How to make this topic interactive (poll, question, challenge)",
      "cta": "Call to action"
    }
  }
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to synthesize conversation into a project brief');

  return JSON.parse(jsonMatch[0]) as SynthesizedInsight;
}

export async function createProjectFromConversation(
  messages: ConversationMessage[],
  contentType: ContentType
): Promise<string> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  // Synthesize conversation into structured insight
  const insight = await synthesizeConversation(messages);

  // Insert synthetic trend row
  const { data: trend, error: trendError } = await supabase
    .from('trends')
    .insert({
      layer: 'niche',
      trend_type: 'lab_generated',
      title: insight.trend_title,
      keywords: [],
      relevance_score: 80,
    })
    .select('id')
    .single();

  if (trendError) throw new Error(`Failed to create trend: ${trendError.message}`);

  // Insert strategic insight
  const { data: strategicInsight, error: insightError } = await supabase
    .from('strategic_insights')
    .insert({
      user_id: user.id,
      trend_id: trend.id,
      trend_title: insight.trend_title,
      content_ideas: insight.content_ideas,
    })
    .select('id')
    .single();

  if (insightError) throw new Error(`Failed to create insight: ${insightError.message}`);

  // Create workflow using existing action
  const workflow = await createWorkflow(strategicInsight.id, contentType);

  return workflow.id;
}
