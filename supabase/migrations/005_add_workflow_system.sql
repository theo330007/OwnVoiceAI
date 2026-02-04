-- Content Workflows table
CREATE TABLE content_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strategic_insight_id UUID NOT NULL REFERENCES strategic_insights(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('educational', 'behind_the_scenes', 'promotional', 'interactive')),
  project_name TEXT NOT NULL,
  current_phase INTEGER DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 4),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  phase_data JSONB DEFAULT '{}', -- Stores data for each phase
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflows_user ON content_workflows(user_id);
CREATE INDEX idx_workflows_insight ON content_workflows(strategic_insight_id);
CREATE INDEX idx_workflows_status ON content_workflows(status);
CREATE INDEX idx_workflows_created ON content_workflows(created_at DESC);

-- Workflow Assets table
CREATE TABLE workflow_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES content_workflows(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL, -- 'script', 'visual_board', 'hook_variation', 'production_sheet'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_assets_workflow ON workflow_assets(workflow_id);
CREATE INDEX idx_workflow_assets_type ON workflow_assets(asset_type);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  specs JSONB DEFAULT '{}', -- Product specifications, features, etc.
  price TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_created ON products(created_at DESC);

-- Case Studies table
CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client_name TEXT,
  description TEXT,
  results TEXT, -- Outcomes, metrics, testimonials
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_case_studies_user ON case_studies(user_id);
CREATE INDEX idx_case_studies_created ON case_studies(created_at DESC);

-- Add brand settings to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_style_prompt TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_voice_tone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_voice_vocabulary TEXT[];

-- Content Calendar table (placeholder for Phase 4)
CREATE TABLE content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES content_workflows(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  scheduled_date DATE,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_production', 'published', 'cancelled')),
  platform TEXT, -- 'instagram', 'tiktok', 'youtube', etc.
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_user ON content_calendar(user_id);
CREATE INDEX idx_calendar_date ON content_calendar(scheduled_date);
CREATE INDEX idx_calendar_status ON content_calendar(status);
