-- Add user_id to trends table for user-specific niche trends
ALTER TABLE trends
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Create index for user-specific trend queries
CREATE INDEX IF NOT EXISTS idx_trends_user_id ON trends(user_id);

-- Create collaboration_notes table for admin-user strategy notes
CREATE TABLE IF NOT EXISTS collaboration_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN ('strategy', 'recommendation', 'insight', 'general')),
  title TEXT,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collaboration_notes_project_id ON collaboration_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_notes_user_id ON collaboration_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_notes_created ON collaboration_notes(created_at DESC);

-- Create content_strategy table for planned content
CREATE TABLE IF NOT EXISTS content_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  validation_id UUID REFERENCES validations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'draft', 'ready', 'published')),
  macro_trends UUID[],
  niche_trends UUID[],
  selected_hook TEXT,
  target_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_strategy_user_id ON content_strategy(user_id);
CREATE INDEX IF NOT EXISTS idx_content_strategy_status ON content_strategy(status);
CREATE INDEX IF NOT EXISTS idx_content_strategy_target_date ON content_strategy(target_date);

-- Function to get user's niche trends
CREATE OR REPLACE FUNCTION get_user_niche_trends(
  p_user_id UUID,
  limit_count int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  keywords text[],
  relevance_score integer,
  created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.description,
    t.keywords,
    t.relevance_score,
    t.created_at
  FROM trends t
  WHERE t.layer = 'niche' AND t.user_id = p_user_id
  ORDER BY t.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Function to get strategic insights (macro + user niche trends overlap)
CREATE OR REPLACE FUNCTION get_strategic_insights(
  p_user_id UUID
)
RETURNS TABLE (
  macro_trend_title text,
  macro_trend_keywords text[],
  matched_niche_trends jsonb,
  overlap_score integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mt.title as macro_trend_title,
    mt.keywords as macro_trend_keywords,
    jsonb_agg(
      jsonb_build_object(
        'id', nt.id,
        'title', nt.title,
        'keywords', nt.keywords
      )
    ) as matched_niche_trends,
    COUNT(*)::integer as overlap_score
  FROM trends mt
  CROSS JOIN trends nt
  WHERE mt.layer = 'macro'
    AND nt.layer = 'niche'
    AND nt.user_id = p_user_id
    AND mt.keywords && nt.keywords -- Array overlap operator
  GROUP BY mt.id, mt.title, mt.keywords
  ORDER BY overlap_score DESC;
END;
$$;
