-- Add creator face and voice asset URLs to users table
-- NOTE: You must also create a 'creator-assets' public storage bucket in Supabase Dashboard
--       (Storage > New Bucket > name: "creator-assets", Public: ON)

ALTER TABLE users ADD COLUMN IF NOT EXISTS creator_face_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS creator_voice_url TEXT;
