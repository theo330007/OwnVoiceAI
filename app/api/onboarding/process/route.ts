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

    const { answers } = (await req.json()) as { answers: OnboardingAnswers };

    // Process with Gemini
    const profile = await processOnboardingAnswers(answers);

    // Build update payload
    // Strategy fields (persona, niche, positioning, offering, competitors, hot_news)
    // are stored in metadata since migration 009 was not applied to the database
    const updateData: Record<string, any> = {
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
          core_belief: profile.core_belief,
          opposition: profile.opposition,
          tone: profile.tone,
          brand_words: profile.brand_words,
          content_boundaries: profile.content_boundaries,
          preferred_formats: profile.preferred_formats,
          vision_statement: profile.vision_statement,
          offer_types: profile.offer_types,
          offer_price: profile.offer_price,
        },
        onboarding: {
          completed_at: new Date().toISOString(),
          answers,
        },
      },
    };

    // Also update basic profile fields from Step 1 if provided
    if (answers.first_name || answers.last_name) {
      const name = [answers.first_name, answers.last_name].filter(Boolean).join(' ');
      if (name) updateData.name = name;
    }
    if (answers.business_name) updateData.business_name = answers.business_name;
    if (answers.website) updateData.website_url = answers.website;
    if (answers.instagram || answers.tiktok) {
      updateData.social_links = {
        ...(user.social_links || {}),
        ...(answers.instagram ? { instagram: answers.instagram } : {}),
        ...(answers.tiktok ? { tiktok: answers.tiktok } : {}),
      };
    }

    // Update user in database
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Onboarding processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process onboarding' },
      { status: 500 }
    );
  }
}
