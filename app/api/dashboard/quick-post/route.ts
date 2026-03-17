import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase';

export interface QuickPost {
  id: string;
  date: string;       // YYYY-MM-DD
  day_name: string;   // e.g. "Wednesday"
  topic: string;
  pillar: string;
  contentType: 'Value' | 'Authority' | 'Sales';
  objective: string;
  format: string;
  hook: string;
  created_at: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic } = await request.json();
    if (!topic?.trim()) return NextResponse.json({ error: 'Topic required' }, { status: 400 });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    const dayName = DAY_NAMES[tomorrow.getDay()];

    const newPost: QuickPost = {
      id: crypto.randomUUID(),
      date: dateStr,
      day_name: dayName,
      topic: topic.trim(),
      pillar: 'Hot Topic',
      contentType: 'Value',
      objective: 'Visibility',
      format: 'Reel',
      hook: '',
      created_at: new Date().toISOString(),
    };

    const existing: QuickPost[] = (user.metadata as any)?.quick_posts ?? [];
    const updated = [newPost, ...existing].slice(0, 50);

    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      .update({ metadata: { ...(user.metadata || {}), quick_posts: updated } })
      .eq('id', user.id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ post: newPost, day_name: dayName, date: dateStr });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add post' }, { status: 500 });
  }
}
