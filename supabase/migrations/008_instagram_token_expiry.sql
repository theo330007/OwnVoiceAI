-- Add token expiry tracking for Instagram OAuth tokens
ALTER TABLE users
ADD COLUMN IF NOT EXISTS instagram_token_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN users.instagram_token_expires_at IS 'Expiry date of the stored Instagram long-lived access token (~60 days)';
