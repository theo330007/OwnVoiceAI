-- Strategic Insights table for user-generated content strategies
CREATE TABLE strategic_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trend_id UUID NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
  trend_title TEXT NOT NULL,
  content_ideas JSONB NOT NULL, -- Contains educational, behind_the_scenes, promotional, interactive
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_strategic_insights_user ON strategic_insights(user_id);
CREATE INDEX idx_strategic_insights_trend ON strategic_insights(trend_id);
CREATE INDEX idx_strategic_insights_created ON strategic_insights(created_at DESC);

-- Add user_id column to trends table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trends' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE trends ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX idx_trends_user ON trends(user_id);
  END IF;
END $$;
