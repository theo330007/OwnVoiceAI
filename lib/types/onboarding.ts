export interface ContentPillar {
  title: string;
  description: string;
}

export interface OnboardingAnswers {
  // Step 1: Identity & Context
  first_name: string;
  last_name: string;
  business_name: string;
  website: string;
  instagram: string;
  tiktok: string;
  country: string;
  target_market: string; // geographic/language market, e.g. "International English-speaking"
  primary_industry: string[]; // one or more industries, drives terminology + trend feed
  industry_specifics: string; // free-text specificity within the chosen industries

  // Step 2: Offer & Business Model
  offer_type: string[];
  offer_description: string;

  // Step 3: Strategic Positioning
  problem_solved: string;
  target_audience: string;
  transformation: string;
  differentiation: string;

  // Step 4: Content DNA
  desired_tone: string;
  brand_words: string[];
  inspiration_accounts: string[];
  preferred_format: string[];

  // Step 5: Story
  personal_story: string;
  legitimating_experience: string;

  // Step 6: Brand Anchor — Content Pillars
  content_pillars: ContentPillar[];  // 3–5 content pillars

  // Step 7: Brand Anchor — Brand Voice
  brand_bio: string;
  voice_keywords: string[];
}

export interface OnboardingStepProps {
  data: OnboardingAnswers;
  onChange: (updates: Partial<OnboardingAnswers>) => void;
  onNext: () => void;
  onBack?: () => void;
  onSkip: () => void;
}

export const EMPTY_ONBOARDING: OnboardingAnswers = {
  first_name: '',
  last_name: '',
  business_name: '',
  website: '',
  instagram: '',
  tiktok: '',
  country: '',
  target_market: '',
  primary_industry: [],
  industry_specifics: '',
  offer_type: [],
  offer_description: '',
  problem_solved: '',
  target_audience: '',
  transformation: '',
  differentiation: '',
  desired_tone: '',
  brand_words: ['', '', ''],
  inspiration_accounts: ['', '', ''],
  preferred_format: [],
  content_pillars: [{ title: '', description: '' }],
  personal_story: '',
  legitimating_experience: '',
  brand_bio: '',
  voice_keywords: [],
};
