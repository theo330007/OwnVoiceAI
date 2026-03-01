import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase';
import type { OnboardingAnswers } from '@/lib/types/onboarding';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answers } = (await req.json()) as { answers: OnboardingAnswers };

    const updateData: Record<string, any> = {
      metadata: {
        ...(user.metadata || {}),
        // Map niche_tags + primary_industry to industries so NicheTrendsPanel picks them up
        ...(answers.niche_tags?.length
          ? { industries: answers.niche_tags }
          : answers.primary_industry
          ? { industries: [answers.primary_industry] }
          : {}),
        onboarding: {
          ...(user.metadata?.onboarding || {}),
          skipped_at: new Date().toISOString(),
          answers,
        },
      },
    };

    // Save basic profile fields if provided
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

    // Save Brand Anchor fields if reached
    if (answers.primary_industry) updateData.industry = answers.primary_industry;
    if (answers.brand_bio) updateData.bio = answers.brand_bio;

    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id);

    if (error) {
      throw new Error(`Failed to save progress: ${error.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Onboarding skip save error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save progress' },
      { status: 500 }
    );
  }
}
