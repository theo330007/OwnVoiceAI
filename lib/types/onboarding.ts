export interface OnboardingAnswers {
  // Step 1: Identity & Context
  first_name: string;
  last_name: string;
  business_name: string;
  website: string;
  instagram: string;
  tiktok: string;
  country: string;
  target_market: string;
  years_in_business: string;
  employment_status: 'full-time' | 'transitioning' | '';

  // Step 2: Offer & Business Model
  offer_type: string[];
  offer_description: string;
  average_price: string;

  // Step 3: Strategic Positioning
  problem_solved: string;
  target_audience: string;
  transformation: string;
  differentiation: string;
  core_belief: string;
  opposition: string;

  // Step 4: Content DNA
  desired_tone: string;
  brand_words: string[];
  inspiration_accounts: string[];
  content_boundaries: string;
  preferred_format: string[];

  // Step 5: Bonus / Story
  personal_story: string;
  legitimating_experience: string;
  vision_statement: string;
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
  years_in_business: '',
  employment_status: '',
  offer_type: [],
  offer_description: '',
  average_price: '',
  problem_solved: '',
  target_audience: '',
  transformation: '',
  differentiation: '',
  core_belief: '',
  opposition: '',
  desired_tone: '',
  brand_words: ['', '', ''],
  inspiration_accounts: ['', '', ''],
  content_boundaries: '',
  preferred_format: [],
  personal_story: '',
  legitimating_experience: '',
  vision_statement: '',
};
