-- Add strategic profile fields for creator positioning
-- These fields help the AI understand the creator's brand for better content generation

ALTER TABLE users ADD COLUMN IF NOT EXISTS persona TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS niche TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS positioning TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS offering TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS competitors TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS hot_news TEXT;
