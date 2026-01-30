-- Add role column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
CHECK (role IN ('user', 'admin'));

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have 'user' role if NULL
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Optional: Set first user as admin (you can modify the email)
-- UPDATE users SET role = 'admin' WHERE email = 'theo@gmail.com';
