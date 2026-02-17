export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  business_name: string | null;
  industry: string | null;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
  social_links: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  };
  persona: string | null;
  niche: string | null;
  positioning: string | null;
  offering: string | null;
  competitors: string[];
  hot_news: string | null;
  creator_face_url: string | null;
  creator_voice_url: string | null;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: string;
  name: string;
  email: string;
  created_at: string;
  total_validations: number;
  last_validation_at: string | null;
  avg_relevance_score: number | null;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role?: UserRole;
  business_name?: string;
  industry?: string;
  bio?: string;
  persona?: string;
  niche?: string;
  positioning?: string;
  offering?: string;
  competitors?: string[];
  hot_news?: string;
  subscription_tier?: 'free' | 'pro' | 'enterprise';
}

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  business_name?: string;
  industry?: string;
  avatar_url?: string;
  bio?: string;
  website_url?: string;
  social_links?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  };
  persona?: string;
  niche?: string;
  positioning?: string;
  offering?: string;
  competitors?: string[];
  hot_news?: string;
  creator_face_url?: string;
  creator_voice_url?: string;
  subscription_tier?: 'free' | 'pro' | 'enterprise';
  is_active?: boolean;
  metadata?: Record<string, any>;
}
