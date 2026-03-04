import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase';

export async function PATCH() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const updated = {
      ...(user.metadata || {}),
      onboarding: {
        ...((user.metadata as any)?.onboarding || {}),
        welcome_dismissed: true,
      },
    };

    await supabase.from('users').update({ metadata: updated }).eq('id', user.id);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
