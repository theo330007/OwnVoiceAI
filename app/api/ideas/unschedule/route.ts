import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase';

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const existing: any[] = (user.metadata as any)?.quick_posts ?? [];
    const updated = existing.filter((p: any) => p.id !== id);

    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      .update({ metadata: { ...(user.metadata || {}), quick_posts: updated } })
      .eq('id', user.id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ removed: existing.length - updated.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to remove post' }, { status: 500 });
  }
}
