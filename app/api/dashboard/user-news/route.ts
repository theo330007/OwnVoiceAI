import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase';

export interface UserNewsItem {
  id: string;
  title: string;
  addedAt: string;
}

// POST — add a news item
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title } = await request.json();
    if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 });

    const existing: UserNewsItem[] = (user.metadata as any)?.user_news ?? [];
    const newItem: UserNewsItem = {
      id: crypto.randomUUID(),
      title: title.trim(),
      addedAt: new Date().toISOString(),
    };
    const updated = [newItem, ...existing].slice(0, 20); // cap at 20 items

    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      .update({ metadata: { ...(user.metadata || {}), user_news: updated } })
      .eq('id', user.id);

    if (error) throw new Error(error.message);
    return NextResponse.json({ item: newItem, user_news: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add news item' }, { status: 500 });
  }
}

// DELETE — remove a news item by id
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const existing: UserNewsItem[] = (user.metadata as any)?.user_news ?? [];
    const updated = existing.filter(item => item.id !== id);

    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      .update({ metadata: { ...(user.metadata || {}), user_news: updated } })
      .eq('id', user.id);

    if (error) throw new Error(error.message);
    return NextResponse.json({ user_news: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete news item' }, { status: 500 });
  }
}
