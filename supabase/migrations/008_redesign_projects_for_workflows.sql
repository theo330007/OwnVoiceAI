-- Drop old project schema (not being used)
DROP TABLE IF EXISTS project_collaborators CASCADE;
DROP TABLE IF EXISTS saved_content_ideas CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP FUNCTION IF EXISTS update_projects_updated_at CASCADE;

-- New projects table optimized for workflow tracking
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Workflow relationship
  workflow_id UUID REFERENCES content_workflows(id) ON DELETE CASCADE,
  strategic_insight_id UUID REFERENCES strategic_insights(id) ON DELETE SET NULL,

  -- Project metadata
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL, -- 'educational', 'behind_the_scenes', 'promotional', 'interactive'
  trend_title TEXT, -- Cached from strategic insight

  -- Progress tracking
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
  current_phase TEXT DEFAULT 'ideation', -- 'ideation', 'drafting', 'editing', 'ready', 'published'
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),

  -- Content artifacts
  hook TEXT,
  concept TEXT,
  cta TEXT,
  final_content TEXT,
  media_urls TEXT[],

  -- Publishing details
  scheduled_date TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  published_url TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_workflow_id ON projects(workflow_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_content_type ON projects(content_type);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();

-- Project notes (for tracking progress, ideas, feedback)
CREATE TABLE project_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  note_type TEXT NOT NULL DEFAULT 'general', -- 'general', 'feedback', 'revision', 'idea'
  content TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_notes_project ON project_notes(project_id);
CREATE INDEX idx_project_notes_created_at ON project_notes(created_at DESC);

-- RPC: Get user projects with counts
CREATE OR REPLACE FUNCTION get_user_projects(
  p_user_id UUID,
  p_status TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  content_type text,
  trend_title text,
  status text,
  current_phase text,
  completion_percentage integer,
  workflow_id uuid,
  strategic_insight_id uuid,
  notes_count bigint,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.content_type,
    p.trend_title,
    p.status,
    p.current_phase,
    p.completion_percentage,
    p.workflow_id,
    p.strategic_insight_id,
    COUNT(pn.id) as notes_count,
    p.created_at,
    p.updated_at
  FROM projects p
  LEFT JOIN project_notes pn ON pn.project_id = p.id
  WHERE p.user_id = p_user_id
    AND (p_status IS NULL OR p.status = p_status)
  GROUP BY p.id
  ORDER BY p.created_at DESC
  LIMIT limit_count;
END;
$$;

-- RPC: Get project stats by user
CREATE OR REPLACE FUNCTION get_user_project_stats(
  p_user_id UUID
)
RETURNS TABLE (
  total_projects bigint,
  in_progress_projects bigint,
  completed_projects bigint,
  avg_completion_percentage numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_projects,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_projects,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_projects,
    AVG(completion_percentage) as avg_completion_percentage
  FROM projects
  WHERE user_id = p_user_id;
END;
$$;
