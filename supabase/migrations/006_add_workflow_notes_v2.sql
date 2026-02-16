-- Add workflow_id to collaboration_notes table to support workflow notes
ALTER TABLE collaboration_notes
ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES content_workflows(id) ON DELETE CASCADE;

-- Make project_id nullable since we can have either project or workflow notes
DO $$
BEGIN
  ALTER TABLE collaboration_notes ALTER COLUMN project_id DROP NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing constraint if it exists, then recreate it
ALTER TABLE collaboration_notes
DROP CONSTRAINT IF EXISTS collaboration_notes_reference_check;

-- Add check constraint to ensure either project_id or workflow_id is set
ALTER TABLE collaboration_notes
ADD CONSTRAINT collaboration_notes_reference_check
CHECK (
  (project_id IS NOT NULL AND workflow_id IS NULL) OR
  (project_id IS NULL AND workflow_id IS NOT NULL)
);

-- Create index for workflow notes queries
CREATE INDEX IF NOT EXISTS idx_collaboration_notes_workflow_id ON collaboration_notes(workflow_id);

-- Add created_by_user column to track if note was created by user (vs admin)
ALTER TABLE collaboration_notes
ADD COLUMN IF NOT EXISTS created_by_user BOOLEAN DEFAULT FALSE;

-- Add comments
DO $$
BEGIN
  COMMENT ON COLUMN collaboration_notes.workflow_id IS 'Reference to content workflow (mutually exclusive with project_id)';
  COMMENT ON COLUMN collaboration_notes.created_by_user IS 'True if created by the user, false if created by admin';
EXCEPTION
  WHEN others THEN NULL;
END $$;
