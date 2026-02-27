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
  niche_tags: string[];  // industry/niche tags that drive trend scraping

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
  content_pillars: ContentPillar[];  // 3–5 content pillars

  // Step 5: Story
  personal_story: string;
  legitimating_experience: string;
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
  niche_tags: [],
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
};
