import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase';

const CONTENT_TYPE_MAP: Record<string, 'Value' | 'Authority' | 'Sales'> = {
  carousel:     'Value',
  reel:         'Authority',
  storytelling: 'Value',
  sales:        'Sales',
};

const FORMAT_LABEL: Record<string, string> = {
  carousel:     'Carousel',
  reel:         'Reel',
  storytelling: 'Story',
  sales:        'Sales Post',
};

const OBJECTIVE_MAP: Record<string, string> = {
  carousel:     'Visibility',
  reel:         'Authority',
  storytelling: 'Connection',
  sales:        'Conversion',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getNextAvailableDate(takenDates: Set<string>, cadence: number): { date: string; day_name: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 1; i <= 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay();
    if (cadence <= 5 && (dow === 0 || dow === 6)) continue;
    const dateStr = d.toISOString().split('T')[0];
    if (!takenDates.has(dateStr)) {
      return { date: dateStr, day_name: DAY_NAMES[dow] };
    }
  }
  const t = new Date(today);
  t.setDate(today.getDate() + 1);
  return { date: t.toISOString().split('T')[0], day_name: DAY_NAMES[t.getDay()] };
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { trendTitle, trendDescription, format, pillar } = await request.json();
    if (!trendTitle || !format) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cadence: number = (user.metadata as any)?.editorial_preferences?.cadence ?? 4;
    const existing: any[] = (user.metadata as any)?.quick_posts ?? [];
    const takenDates = new Set(existing.map((p: any) => p.date));

    const { date, day_name } = getNextAvailableDate(takenDates, cadence);

    const topic = trendDescription
      ? trendDescription.length > 100 ? trendDescription.slice(0, 97) + '…' : trendDescription
      : trendTitle;

    const newPost = {
      id: crypto.randomUUID(),
      date,
      day_name,
      topic,
      pillar: pillar || 'General',
      contentType: CONTENT_TYPE_MAP[format] ?? 'Value',
      objective: OBJECTIVE_MAP[format] ?? 'Visibility',
      format: FORMAT_LABEL[format] ?? format,
      hook: trendTitle,
      source: 'discover',
      status: 'new',
      created_at: new Date().toISOString(),
    };

    const kept = existing.filter((p: any) => p.hook !== trendTitle);
    const updated = [newPost, ...kept].slice(0, 200);

    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      .update({ metadata: { ...(user.metadata || {}), quick_posts: updated } })
      .eq('id', user.id);

    if (error) throw new Error(error.message);
    return NextResponse.json({ date, day_name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to schedule trend' }, { status: 500 });
  }
}
