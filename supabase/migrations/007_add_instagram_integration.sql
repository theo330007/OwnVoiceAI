-- Add Instagram OAuth columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS instagram_username TEXT,
ADD COLUMN IF NOT EXISTS instagram_user_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS instagram_access_token TEXT,
ADD COLUMN IF NOT EXISTS instagram_profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_bio TEXT,
ADD COLUMN IF NOT EXISTS instagram_follower_count INTEGER,
ADD COLUMN IF NOT EXISTS instagram_following_count INTEGER,
ADD COLUMN IF NOT EXISTS instagram_posts_count INTEGER,
ADD COLUMN IF NOT EXISTS instagram_connected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS instagram_last_synced_at TIMESTAMPTZ;

-- Create Instagram posts table
CREATE TABLE IF NOT EXISTS instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instagram_post_id TEXT NOT NULL,
  instagram_username TEXT NOT NULL,
  caption TEXT,
  media_type TEXT NOT NULL, -- 'IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'
  media_url TEXT,
  permalink TEXT,
  thumbnail_url TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  engagement_rate FLOAT,
  hashtags TEXT[],
  mentions TEXT[],
  location TEXT,
  is_top_performer BOOLEAN DEFAULT FALSE,
  performance_score FLOAT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, instagram_post_id)
);

CREATE INDEX IF NOT EXISTS idx_instagram_posts_user_id ON instagram_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_timestamp ON instagram_posts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_top_performer ON instagram_posts(user_id, is_top_performer);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_hashtags ON instagram_posts USING GIN(hashtags);

-- Create Instagram insights table (analyzed trends from posts)
CREATE TABLE IF NOT EXISTS instagram_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'content_theme', 'top_hashtag', 'best_posting_time', 'audience_interest'
  title TEXT NOT NULL,
  description TEXT,
  value TEXT,
  metric_value FLOAT,
  frequency INTEGER,
  confidence_score FLOAT,
  supporting_post_ids TEXT[],
  metadata JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instagram_insights_user_id ON instagram_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_insights_type ON instagram_insights(user_id, insight_type);
CREATE INDEX IF NOT EXISTS idx_instagram_insights_generated ON instagram_insights(generated_at DESC);

-- Create Instagram sync log table
CREATE TABLE IF NOT EXISTS instagram_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- 'full', 'incremental', 'manual'
  status TEXT NOT NULL, -- 'started', 'completed', 'failed'
  posts_fetched INTEGER DEFAULT 0,
  insights_generated INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instagram_sync_log_user_id ON instagram_sync_log(user_id, created_at DESC);

-- Function to get user's top performing posts
CREATE OR REPLACE FUNCTION get_top_performing_instagram_posts(
  p_user_id UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  caption text,
  media_type text,
  media_url text,
  permalink text,
  post_timestamp timestamptz,
  like_count integer,
  comment_count integer,
  engagement_rate float,
  hashtags text[],
  performance_score float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ip.id,
    ip.caption,
    ip.media_type,
    ip.media_url,
    ip.permalink,
    ip.timestamp AS post_timestamp,
    ip.like_count,
    ip.comment_count,
    ip.engagement_rate,
    ip.hashtags,
    ip.performance_score
  FROM instagram_posts ip
  WHERE ip.user_id = p_user_id
  ORDER BY ip.performance_score DESC NULLS LAST, ip.engagement_rate DESC NULLS LAST
  LIMIT limit_count;
END;
$$;

-- Function to get user's Instagram insights by type
CREATE OR REPLACE FUNCTION get_instagram_insights_by_type(
  p_user_id UUID,
  p_insight_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  insight_type text,
  title text,
  description text,
  value text,
  metric_value float,
  frequency integer,
  confidence_score float,
  generated_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ii.id,
    ii.insight_type,
    ii.title,
    ii.description,
    ii.value,
    ii.metric_value,
    ii.frequency,
    ii.confidence_score,
    ii.generated_at
  FROM instagram_insights ii
  WHERE ii.user_id = p_user_id
    AND (p_insight_type IS NULL OR ii.insight_type = p_insight_type)
  ORDER BY ii.confidence_score DESC, ii.metric_value DESC;
END;
$$;

COMMENT ON TABLE instagram_posts IS 'Stores scraped Instagram posts for content analysis';
COMMENT ON TABLE instagram_insights IS 'Stores analyzed insights from Instagram content';
COMMENT ON COLUMN instagram_posts.engagement_rate IS 'Calculated as (likes + comments) / follower_count';
COMMENT ON COLUMN instagram_posts.performance_score IS 'Composite score based on engagement, timing, and content type';
