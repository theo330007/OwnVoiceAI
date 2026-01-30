-- Projects table for user content strategy workflows
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),

  -- Selected trends for this project
  selected_trends UUID[] DEFAULT '{}',

  -- Content ideas and validation results
  content_ideas JSONB DEFAULT '[]',
  validation_results JSONB DEFAULT '[]',

  -- Workflow metadata
  current_step TEXT DEFAULT 'setup', -- setup, research, planning, execution, review
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

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

-- Project collaborators (for future multi-user support)
CREATE TABLE project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_collaborators_project ON project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user ON project_collaborators(user_id);

-- Saved content ideas (users can save content ideas from trends)
CREATE TABLE saved_content_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  trend_id UUID REFERENCES trends(id) ON DELETE SET NULL,

  -- Content idea details
  title TEXT NOT NULL,
  description TEXT,
  hook TEXT,
  content_format TEXT, -- Reel, Carousel, Story, etc.
  notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_ideas_user ON saved_content_ideas(user_id);
CREATE INDEX idx_saved_ideas_project ON saved_content_ideas(project_id);
CREATE INDEX idx_saved_ideas_trend ON saved_content_ideas(trend_id);

-- Trigger for saved_content_ideas updated_at
CREATE TRIGGER saved_content_ideas_updated_at
  BEFORE UPDATE ON saved_content_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();
