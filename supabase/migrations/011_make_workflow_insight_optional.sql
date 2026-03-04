-- Allow workflows to be created directly from projects (without a strategic insight)
ALTER TABLE content_workflows
  ALTER COLUMN strategic_insight_id DROP NOT NULL;
