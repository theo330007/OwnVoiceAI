-- Add users table for user management
-- This is a simple user profile system (no auth yet - can add Supabase Auth later)

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  business_name TEXT,
  industry TEXT, -- e.g., 'fertility', 'nutrition', 'holistic wellness'
  avatar_url TEXT,
  bio TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}', -- {instagram: '', tiktok: '', etc}
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created ON users(created_at DESC);

-- Add user_id to existing tables (making them nullable for backward compatibility)
ALTER TABLE validations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_validations_user ON validations(user_id);

-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT
  u.id,
  u.name,
  u.email,
  u.created_at,
  COUNT(DISTINCT v.id) as total_validations,
  MAX(v.created_at) as last_validation_at,
  AVG(v.relevance_score) as avg_relevance_score
FROM users u
LEFT JOIN validations v ON u.id = v.user_id
GROUP BY u.id, u.name, u.email, u.created_at;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a default admin user for testing
INSERT INTO users (name, email, business_name, industry, bio, subscription_tier) VALUES
('Admin User', 'admin@ownvoiceai.com', 'OwnVoice AI', 'wellness', 'Platform administrator', 'enterprise')
ON CONFLICT (email) DO NOTHING;

-- Insert some sample users for testing
INSERT INTO users (name, email, business_name, industry, bio, subscription_tier) VALUES
('Sarah Johnson', 'sarah@example.com', 'Fertile Ground Wellness', 'fertility', 'Fertility coach helping women optimize their reproductive health through nutrition and lifestyle.', 'pro'),
('Maya Patel', 'maya@example.com', 'Holistic Harmony', 'holistic wellness', 'Integrative health practitioner specializing in gut health and hormonal balance.', 'pro'),
('Emma Chen', 'emma@example.com', 'Nourished Living', 'nutrition', 'Registered dietitian focused on personalized nutrition and functional medicine.', 'free')
ON CONFLICT (email) DO NOTHING;

COMMIT;
