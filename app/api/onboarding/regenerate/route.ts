import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { processOnboardingAnswers } from '@/lib/agents/onboarding-processor';
import { createClient } from '@/lib/supabase';
import type { OnboardingAnswers } from '@/lib/types/onboarding';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Load the stored onboarding answers from DB
    const answers = user.metadata?.onboarding?.answers as OnboardingAnswers | undefined;
    if (!answers) {
      return NextResponse.json(
        { error: 'No onboarding answers found. Please complete the onboarding first.' },
        { status: 400 }
      );
    }

    // Re-run Gemini with stored answers
    const profile = await processOnboardingAnswers(answers);

    // Persist updated strategy
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from('users')
      .update({
        metadata: {
          ...(user.metadata || {}),
          strategy: {
            persona: profile.persona,
            niche: profile.niche,
            positioning: profile.positioning,
            offering: profile.offering,
            competitors: profile.competitors,
            hot_news: profile.hot_news,
            target_audience: profile.target_audience,
            transformation: profile.transformation,
            tone: profile.tone,
            brand_words: profile.brand_words,
            preferred_formats: profile.preferred_formats,
            offer_types: profile.offer_types,
            content_pillars: profile.content_pillars,
            voice_keywords: answers.voice_keywords || [],
            verbal_territory: profile.verbal_territory || { tone: '', style: '', preferred_vocabulary: [], words_to_avoid: [] },
            post_objectives: profile.post_objectives || [],
          },
        },
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Regenerate profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to regenerate profile' },
      { status: 500 }
    );
  }
}
