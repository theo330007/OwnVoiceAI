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
  subscription_tier?: 'free' | 'pro' | 'enterprise';
  is_active?: boolean;
}
