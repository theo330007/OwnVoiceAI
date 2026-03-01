import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase';

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!plan || !Array.isArray(plan.weeks)) {
      return NextResponse.json({ error: 'Invalid plan data' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      .update({
        metadata: {
          ...(user.metadata || {}),
          editorial_plan: plan,
        },
      })
      .eq('id', user.id);

    if (error) throw new Error(`Failed to save: ${error.message}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Editorial update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update editorial plan' },
      { status: 500 }
    );
  }
}
