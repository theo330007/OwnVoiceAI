import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { processOnboardingAnswers } from '@/lib/agents/onboarding-processor';
import { createClient } from '@/lib/supabase';
import type { OnboardingAnswers } from '@/lib/types/onboarding';

// Maps primary_industry to the 3-level niche_funnel taxonomy used in the profile page
const INDUSTRY_TO_NICHE_FUNNEL: Record<string, { category: string; subcategory: string; microniche: string }> = {
  'Fertility & Hormones':     { category: "Health & Wellness", subcategory: "Women's Health",  microniche: "Fertility & Conception" },
  'Nutrition & Dietetics':    { category: "Health & Wellness", subcategory: "Nutrition",        microniche: "" },
  'Mental Health & Wellness': { category: "Health & Wellness", subcategory: "Mental Health",    microniche: "" },
  'Fitness & Movement':       { category: "Health & Wellness", subcategory: "Fitness",          microniche: "" },
  'Sleep Health':             { category: "Health & Wellness", subcategory: "Mental Health",    microniche: "Sleep Optimization" },
  'Skin & Beauty':            { category: "Health & Wellness", subcategory: "Holistic Health",  microniche: "" },
  'Weight Management':        { category: "Health & Wellness", subcategory: "Nutrition",        microniche: "Weight Management" },
  'Holistic Health':          { category: "Health & Wellness", subcategory: "Holistic Health",  microniche: "" },
  "Women's Health":           { category: "Health & Wellness", subcategory: "Women's Health",   microniche: "" },
  'Gut Health':               { category: "Health & Wellness", subcategory: "Nutrition",        microniche: "Gut Health" },
  'Chronic Disease':          { category: "Health & Wellness", subcategory: "Holistic Health",  microniche: "" },
  'Stress & Burnout':         { category: "Health & Wellness", subcategory: "Mental Health",    microniche: "Burnout Recovery" },
  'Mindfulness':              { category: "Health & Wellness", subcategory: "Mental Health",    microniche: "Mindfulness & Meditation" },
  'Sexual Health':            { category: "Health & Wellness", subcategory: "Women's Health",   microniche: "" },
  'Aging & Longevity':        { category: "Health & Wellness", subcategory: "Holistic Health",  microniche: "" },
};

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
    // Strategy fields are stored in metadata.strategy
    const updateData: Record<string, any> = {
      metadata: {
        ...(user.metadata || {}),
        // Map niche_tags + primary_industry to industries so NicheTrendsPanel picks them up
        industries: answers.niche_tags?.length
          ? answers.niche_tags
          : answers.primary_industry
          ? [answers.primary_industry]
          : (user.metadata?.industries || []),
        // Auto-populate 3-level niche funnel from primary_industry for the profile page
        ...(answers.primary_industry && INDUSTRY_TO_NICHE_FUNNEL[answers.primary_industry]
          ? { niche_funnel: INDUSTRY_TO_NICHE_FUNNEL[answers.primary_industry] }
          : {}),
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
        onboarding: {
          completed_at: new Date().toISOString(),
          answers,
        },
      },
    };

    // Save Brand Anchor top-level columns
    if (answers.primary_industry) updateData.industry = answers.primary_industry;
    if (answers.brand_bio) updateData.bio = answers.brand_bio;

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
    // Save instagram_username column so the dashboard connection status shows correctly
    if (answers.instagram) {
      const handle = answers.instagram.replace(/^@/, '').trim();
      if (handle) updateData.instagram_username = handle;
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
