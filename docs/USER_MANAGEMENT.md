# User Management - Admin Portal Documentation

## Overview

The User Management system allows administrators to manage user profiles, track activity, and monitor engagement metrics for the OwnVoiceAI platform.

## Features

### ✅ User Profile Management
- Create, read, update, and delete user accounts
- Manage user details (name, email, business info, industry)
- Set subscription tiers (Free, Pro, Enterprise)
- Activate/deactivate user accounts

### 📊 Activity Tracking
- View total validations per user
- Track average relevance scores
- Monitor last active timestamps
- View recent validation history

### 🎯 User Metrics
- Real-time statistics dashboard
- User engagement analytics
- Subscription tier distribution
- Activity trends

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  business_name TEXT,
  industry TEXT,
  avatar_url TEXT,
  bio TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### User Stats View

```sql
CREATE VIEW user_stats AS
SELECT
  u.id,
  u.name,
  u.email,
  u.created_at,
  COUNT(DISTINCT v.id) as total_validations,
  MAX(v.created_at) as last_validation_at,
  AVG(v.relevance_score) as avg_relevance_score
FROM users u
LEFT JOIN validations v ON u.id = v.user_id
GROUP BY u.id, u.name, u.email, u.created_at;
```

## Routes

### Admin Routes

- **`/admin/users`** - User management dashboard
  - Lists all users with stats
  - Shows total users, active users, validations
  - Search and filter capabilities

- **`/admin/users/new`** - Create new user
  - Form to add new user profile
  - Set initial subscription tier
  - Specify industry and business info

- **`/admin/users/[id]`** - User detail & edit
  - View user profile
  - Edit user information
  - View activity history
  - Toggle account status
  - Delete user account

## User Fields

### Required Fields
- **Name**: User's full name
- **Email**: Unique email address (used for login when auth is added)

### Optional Fields
- **Business Name**: Name of their wellness business
- **Industry**: Wellness niche (fertility, nutrition, etc.)
- **Bio**: User description
- **Website URL**: Personal or business website
- **Social Links**: Instagram, TikTok, YouTube, LinkedIn
- **Subscription Tier**: free | pro | enterprise
- **Status**: Active or inactive

## Subscription Tiers

### Free Tier
- Basic access to platform
- Limited validations per month
- Access to trends

### Pro Tier
- Unlimited validations
- Priority support
- Advanced analytics

### Enterprise Tier
- Custom integrations
- White-label options
- Dedicated support
- API access

## API Actions

### Server Actions

```typescript
// Get all users
const users = await getAllUsers();

// Get user statistics
const stats = await getUserStats();

// Get single user
const user = await getUserById(id);

// Create user
const newUser = await createUser({
  email: 'user@example.com',
  name: 'John Doe',
  business_name: 'Wellness Co',
  industry: 'fertility',
  subscription_tier: 'pro',
});

// Update user
const updated = await updateUser(userId, {
  name: 'Jane Doe',
  subscription_tier: 'enterprise',
});

// Toggle user status
await toggleUserStatus(userId, false); // Deactivate

// Delete user
await deleteUser(userId);

// Get user validations
const validations = await getUserValidations(userId);
```

## Sample Users

The migration includes 4 sample users:

1. **Admin User** (admin@ownvoiceai.com) - Enterprise tier
2. **Sarah Johnson** (sarah@example.com) - Fertility coach, Pro tier
3. **Maya Patel** (maya@example.com) - Holistic practitioner, Pro tier
4. **Emma Chen** (emma@example.com) - Nutritionist, Free tier

## Future Enhancements

### Phase 2
- [ ] Supabase Auth integration
- [ ] User self-registration
- [ ] Email verification
- [ ] Password reset flow
- [ ] OAuth providers (Google, etc.)

### Phase 3
- [ ] Role-based access control (Admin, User, Editor)
- [ ] Team/organization support
- [ ] Usage quotas per tier
- [ ] Billing integration
- [ ] User notifications

### Phase 4
- [ ] User analytics dashboard
- [ ] Export user data
- [ ] Bulk user operations
- [ ] Advanced filtering and search
- [ ] User segmentation

## Security Considerations

### Current State (MVP)
- No authentication (single admin instance)
- Direct database access via Supabase
- Server Actions with revalidation

### When Adding Auth
1. Implement Row Level Security (RLS) in Supabase
2. Add authentication middleware
3. Protect admin routes
4. Add CSRF protection
5. Implement rate limiting
6. Add audit logging

## Usage Examples

### Creating a New User

1. Navigate to `/admin/users`
2. Click "Add New User"
3. Fill in required fields (name, email)
4. Optionally add business info, industry, bio
5. Select subscription tier
6. Click "Create User"

### Editing a User Profile

1. Navigate to `/admin/users`
2. Click the eye icon on any user row
3. Update fields as needed
4. Click "Save Changes"

### Viewing User Activity

1. Navigate to `/admin/users/[id]`
2. Check the "Activity Stats" card on the right
3. View total validations and average scores
4. Scroll through recent activity

### Deactivating a User

1. Navigate to `/admin/users/[id]`
2. In the "Account Status" section, click "Deactivate"
3. User will no longer be able to access the platform (when auth is added)

## Troubleshooting

### User Not Appearing in List
- Check if migration `002_add_users_table.sql` was run
- Verify user was created successfully (check Supabase dashboard)
- Refresh the page

### Cannot Delete User
- Check if user has associated validations
- Foreign key constraints will cascade delete
- Ensure you have permission

### Stats Not Updating
- Stats are calculated in real-time from the `user_stats` view
- Refresh the page to see latest data
- Check if validations have `user_id` set

## Related Files

### Database
- `supabase/migrations/002_add_users_table.sql` - Schema migration
- `lib/types/user.ts` - TypeScript types

### Server Actions
- `app/actions/users.ts` - User CRUD operations

### Components
- `app/admin/users/page.tsx` - Main user list
- `app/admin/users/components/UsersTable.tsx` - Users table
- `app/admin/users/[id]/page.tsx` - User detail
- `app/admin/users/[id]/components/UserProfileForm.tsx` - Edit form
- `app/admin/users/[id]/components/UserActivity.tsx` - Activity view
- `app/admin/users/new/page.tsx` - Create user form

## Support

For questions or issues with user management:
1. Check this documentation
2. Review the database schema
3. Check Supabase logs
4. Inspect browser console for errors
