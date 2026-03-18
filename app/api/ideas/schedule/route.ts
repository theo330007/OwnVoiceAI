import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase';

type ContentType = 'Value' | 'Authority' | 'Sales';

interface ScheduledIdea {
  hook: string;
  concept: string;
  cta: string;
  source_type: string;
  format: string;
  contentType: ContentType;
  scheduled_date: string;
  day_name: string;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { pillar, ideas }: { pillar: string; ideas: ScheduledIdea[] } = await request.json();

    if (!pillar || !Array.isArray(ideas) || ideas.length === 0) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const OBJECTIVE: Record<string, string> = {
      carousel:     'Visibility',
      reel:         'Authority',
      storytelling: 'Connection',
      sales:        'Conversion',
    };

    const newQuickPosts = ideas.map(idea => ({
      id: crypto.randomUUID(),
      date: idea.scheduled_date,
      day_name: idea.day_name,
      topic: idea.concept.length > 100 ? idea.concept.slice(0, 97) + '…' : idea.concept,
      pillar,
      contentType: idea.contentType,
      objective: OBJECTIVE[idea.format.toLowerCase()] ?? 'Visibility',
      format: idea.format.charAt(0).toUpperCase() + idea.format.slice(1),
      hook: idea.hook,
      source: 'discover',
      created_at: new Date().toISOString(),
    }));

    const supabase = await createClient();
    const existing: any[] = (user.metadata as any)?.quick_posts ?? [];
    // Replace previous discover ideas for this pillar, keep everything else
    const kept = existing.filter((p: any) => !(p.source === 'discover' && p.pillar === pillar));
    const updated = [...newQuickPosts, ...kept].slice(0, 200);

    const { error } = await supabase
      .from('users')
      .update({ metadata: { ...(user.metadata || {}), quick_posts: updated } })
      .eq('id', user.id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ scheduled: newQuickPosts.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to schedule ideas' }, { status: 500 });
  }
}
