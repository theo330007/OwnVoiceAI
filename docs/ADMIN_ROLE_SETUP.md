# Admin Role System Setup Guide

## Overview

A complete admin role system has been implemented for OwnVoiceAI. This system allows you to control access to administrative features like trend management and knowledge base curation.

## What's Been Implemented

### 1. Database Schema
- Added `role` column to `users` table (values: 'user' | 'admin')
- Created index on role column for performance
- Migration file: `supabase/migrations/002_add_user_roles.sql`

### 2. Type System
- Added `UserRole` type ('user' | 'admin')
- Updated `User` interface to include role field
- Updated `CreateUserInput` and `UpdateUserInput` interfaces

### 3. Authentication & Guards
- Created `lib/admin-guard.ts` with utility functions:
  - `requireAdmin()` - Server Action that redirects non-admins
  - `isAdmin()` - Checks if current user is admin
  - `hasRole()` - Checks if user has specific role
- Admin layout (`app/admin/layout.tsx`) protects all `/admin` routes

### 4. User Interface
- Navbar now shows "Admin" link only for admin users
- Admin dropdown menu item in user profile menu
- Admin panel accessible at `/admin/trends`

### 5. Signup Process
- New users automatically assigned 'user' role by default
- Role field included in user profile creation

## Setup Instructions

### Step 1: Run Database Migration

You need to apply the migration to add the role column to your Supabase database.

**Option A: Using Supabase CLI (Recommended)**
```bash
supabase db push
```

**Option B: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/002_add_user_roles.sql`
4. Run the SQL

**Option C: Manual SQL Execution**
Run this SQL in your Supabase SQL Editor:

```sql
-- Add role column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
CHECK (role IN ('user', 'admin'));

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have 'user' role if NULL
UPDATE users SET role = 'user' WHERE role IS NULL;
```

### Step 2: Set Your Account as Admin

After running the migration, you need to promote your account to admin.

**Important:** Replace `theo@gmail.com` with your actual email address.

Run this SQL in Supabase SQL Editor:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'theo@gmail.com';
```

To verify it worked:
```sql
SELECT id, email, name, role FROM users WHERE email = 'theo@gmail.com';
```

You should see `role` set to `'admin'`.

### Step 3: Test the Admin System

1. **Logout and login again** to refresh your session with the new role
2. After logging in, you should see:
   - "Admin" link in the main navigation bar (with shield icon)
   - "Admin Panel" option in your user dropdown menu
3. Click on "Admin" or "Admin Panel" to access `/admin/trends`
4. You should be able to add trends successfully

### Step 4: Verify Non-Admin Users Cannot Access Admin

1. Create a test user account (or have someone else try)
2. They should NOT see the Admin links
3. If they try to navigate to `/admin/trends` directly, they'll be redirected to `/dashboard`

## How It Works

### Route Protection

All routes under `/admin/*` are protected by the `app/admin/layout.tsx` file, which calls `requireAdmin()`:

```typescript
// app/admin/layout.tsx
export default async function AdminLayout({ children }) {
  await requireAdmin(); // ✅ Blocks non-admins
  return <>{children}</>;
}
```

### Conditional UI Rendering

The Navbar checks user role to show/hide admin links:

```typescript
{user.role === 'admin' && (
  <Link href="/admin/trends">Admin</Link>
)}
```

### Server Actions

Admin-only Server Actions can use `requireAdmin()`:

```typescript
export async function someAdminAction() {
  await requireAdmin(); // ✅ Only admins can call this
  // ... admin logic
}
```

## Admin Features

### Current Admin Features

1. **Trend Management** (`/admin/trends`)
   - Add macro and niche trends
   - Set trend type, title, description
   - Add keywords for matching
   - Set relevance scores
   - Add source URLs

### Future Admin Features (To Be Built)

2. **Knowledge Base Management** (`/admin/knowledge`)
   - Add scientific articles
   - Manage embeddings
   - Curate research sources

3. **User Management** (`/admin/users`)
   - View all users
   - Promote/demote admin roles
   - View user statistics

## Troubleshooting

### "I don't see the Admin link"

1. Verify your user has admin role:
   ```sql
   SELECT role FROM users WHERE email = 'your@email.com';
   ```
2. If it shows 'user', run the UPDATE command from Step 2
3. Logout and login again

### "I get redirected to dashboard when accessing /admin"

- Your account is not set as admin
- Run the UPDATE SQL from Step 2
- Make sure to logout and login after updating

### "Migration fails: column already exists"

- The migration is idempotent (safe to run multiple times)
- If you see this error, the column already exists - this is OK
- Just skip to Step 2 to set your admin role

## Security Notes

- Admin role is checked on both client (UI visibility) and server (route protection)
- Direct URL access to admin routes is blocked for non-admins
- Server Actions that require admin role verify it server-side
- Session must be refreshed after role changes (logout/login)

## Next Steps

After setup, you can:
1. Add macro and niche trends via the Admin Panel
2. Test the validation system with real trend data
3. Build additional admin features as needed

---

**Questions or Issues?**

If you encounter any issues during setup, check:
1. Supabase connection is working
2. Migration was applied successfully
3. Your email matches exactly in the UPDATE command
4. You logged out and back in after setting admin role
