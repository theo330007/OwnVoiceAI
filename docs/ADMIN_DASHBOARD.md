# Admin Dashboard - Documentation

## Overview

The Admin Dashboard is the central command center for OwnVoiceAI administrators. It provides a comprehensive overview of platform metrics, quick access to management tools, and configuration options.

## Access

**Route:** `/admin/dashboard`

**Direct Link from Homepage:** Click "Open Admin Dashboard" button in the Admin Portal section

## Dashboard Sections

### 1. KPI Cards (Key Performance Indicators)

Six metric cards displayed at the top of the dashboard:

#### Total Users
- **Icon:** Users
- **Metric:** Count of all registered users
- **Trend:** Month-over-month growth percentage
- **Color:** Sage

#### Active Users
- **Icon:** Activity
- **Metric:** Users who have performed at least one validation
- **Trend:** Active user growth rate
- **Color:** Dusty Rose

#### Total Validations
- **Icon:** Bar Chart
- **Metric:** Cumulative content validations across all users
- **Trend:** Validation volume growth
- **Color:** Sage

#### Average Relevance
- **Icon:** Star
- **Metric:** Platform-wide average relevance score (1-100)
- **Trend:** Quality score trend
- **Color:** Dusty Rose

#### Total Trends
- **Icon:** Trending Up
- **Metric:** Combined macro and niche trends in database
- **Trend:** Content database growth
- **Color:** Sage

#### Knowledge Base
- **Icon:** Book Open
- **Metric:** Number of scientific articles with embeddings
- **Trend:** Research library expansion
- **Color:** Dusty Rose

### 2. Quick Actions

Fast access cards to common admin tasks:

#### Manage Users
- Navigate to user management portal
- View, edit, create user accounts
- **Route:** `/admin/users`

#### Add Trends
- Add new macro or niche wellness trends
- **Route:** `/admin/trends`

#### Add Knowledge
- Upload scientific articles to knowledge base
- Automatic embedding generation
- **Route:** `/admin/knowledge`

#### View Dashboard
- Access public-facing trends dashboard
- **Route:** `/dashboard`

#### AI Lab
- Test the content validation agent
- Try example queries
- **Route:** `/lab`

#### Analytics *(Coming Soon)*
- Advanced platform analytics
- User engagement metrics
- Content performance tracking

### 3. Platform Configuration

Comprehensive settings management organized by category:

#### General Settings
- **Platform Name:** OwnVoice AI
- **Tagline:** Boutique Wellness Content Strategy
- **Support Email:** Contact email for support

#### Features
- **User Registration:** Toggle self-registration (currently disabled)
- **AI Validation:** Enable/disable validation agent
- **Trend Scraping:** Manual vs. automated trend collection

#### Notifications
- **Email Notifications:** User email alerts
- **Daily Reports:** Automated admin reports
- **User Activity Alerts:** Real-time activity notifications

#### Security
- **Two-Factor Auth:** Enhanced security (coming soon)
- **Session Timeout:** Auto-logout duration
- **Password Policy:** Strength requirements

#### API Integrations
Status of external service connections:
- **Gemini API:** ✅ Connected
- **Supabase:** ✅ Connected
- **Firecrawl:** ⚠️ Not Configured

#### Design System
Color palette reference:
- **Sage:** #556B2F (Primary brand color)
- **Cream:** #FAF9F6 (Background color)
- **Dusty Rose:** #D4A373 (Accent color)

### 4. Recent Activity Feed

Real-time activity stream showing:

- **User Actions:** Recent validations by users
- **Timestamps:** Relative time (e.g., "2h ago", "3d ago")
- **Metrics:** Number of validations, average scores
- **User Info:** Name and activity count

**Display:** Last 8 activities, sorted by most recent

### 5. System Health

Real-time status monitoring of critical systems:

#### API Status
- **Status:** ✅ Operational
- **Details:** All systems operational
- **Icon:** Server

#### Database
- **Status:** ✅ Operational
- **Details:** Total record count (trends + knowledge)
- **Icon:** Database

#### AI Agent
- **Status:** ✅ Operational
- **Details:** Gemini 2.0 Flash active
- **Icon:** Zap

#### Vector Search
- **Status:** ✅ Operational / ⚠️ Warning
- **Details:** Embedding count or warning if empty
- **Icon:** Check Circle
- **Note:** Shows warning if no knowledge base entries exist

**Overall Status Banner:**
- Green banner: "All systems operational"
- Displayed when all services are healthy

## Features & Capabilities

### Real-time Metrics
- All KPIs update on page refresh
- Data pulled directly from database
- Calculated dynamically from user stats and content

### Responsive Design
- Mobile-friendly layout
- Grid adapts to screen size
- Touch-optimized for tablets

### Boutique Wellness Aesthetic
- Sage, cream, and dusty rose color scheme
- Soft shadows and rounded-3xl borders
- Playfair Display serif for headers
- Inter sans-serif for body text

### Quick Navigation
- Breadcrumb navigation
- Direct links to all admin sections
- Back to home link

## Technical Implementation

### Data Sources

```typescript
// Fetched on page load
const [userStats, macroTrends, nicheTrends, knowledge] = await Promise.all([
  getUserStats(),           // User activity aggregates
  getTrendsByLayer('macro'), // Macro trends
  getTrendsByLayer('niche'), // Niche trends
  getAllKnowledge(),        // Knowledge base articles
]);
```

### Calculated Metrics

```typescript
const totalUsers = userStats.length;
const activeUsers = userStats.filter(u => u.total_validations > 0).length;
const totalValidations = userStats.reduce((sum, u) => sum + u.total_validations, 0);
const avgRelevanceScore = Math.round(
  userStats.reduce((sum, u) => sum + (u.avg_relevance_score || 0), 0) / userStats.length
);
const totalTrends = macroTrends.length + nicheTrends.length;
const knowledgeBaseSize = knowledge.length;
```

### Components

- **KPICards** - Metric display grid
- **QuickActions** - Action card grid with links
- **RecentActivity** - Activity feed with user stats
- **SystemHealth** - Service status monitoring
- **PlatformSettings** - Configuration display (read-only for now)

## Future Enhancements

### Phase 2: Analytics
- [ ] User growth charts
- [ ] Validation trends over time
- [ ] Popular topics analysis
- [ ] Engagement heatmaps

### Phase 3: Configuration
- [ ] Editable platform settings
- [ ] Email template customization
- [ ] Feature flag management
- [ ] API key management interface

### Phase 4: Advanced Features
- [ ] Real-time notifications
- [ ] Webhook configuration
- [ ] Export data to CSV
- [ ] Scheduled reports
- [ ] Audit log viewer

## Best Practices

### When to Use Admin Dashboard

1. **Daily Check-in:** Review KPIs and recent activity
2. **User Management:** Quick access to user portal
3. **System Monitoring:** Check health status
4. **Content Management:** Navigate to trends/knowledge sections
5. **Configuration Review:** Verify API connections and settings

### Workflow Tips

1. Start with KPI overview to understand platform state
2. Check System Health for any warnings
3. Review Recent Activity for user engagement
4. Use Quick Actions for common tasks
5. Reference Platform Settings for configuration details

### Performance Considerations

- Dashboard loads all data server-side
- Efficient database queries via user_stats view
- Minimal client-side JavaScript
- Fast page loads with Next.js optimization

## Troubleshooting

### KPIs Showing Zero
- Ensure database migrations are run
- Check that sample users and trends are seeded
- Verify Supabase connection

### System Health Warnings
- **Vector Search Warning:** Add knowledge base entries at `/admin/knowledge`
- **API Status Issues:** Check environment variables
- **Database Errors:** Verify Supabase credentials

### Recent Activity Empty
- Users need to perform validations in AI Lab
- Check that validations table has records
- Verify user_id is set on validation records

### Quick Actions Not Working
- Check that routes exist
- Verify navigation links
- Ensure pages are created

## Related Files

### Main Dashboard
- `app/admin/dashboard/page.tsx` - Main dashboard page
- `app/admin/dashboard/components/KPICards.tsx` - Metrics cards
- `app/admin/dashboard/components/QuickActions.tsx` - Action grid
- `app/admin/dashboard/components/RecentActivity.tsx` - Activity feed
- `app/admin/dashboard/components/SystemHealth.tsx` - Health monitoring
- `app/admin/dashboard/components/PlatformSettings.tsx` - Configuration display

### Related Actions
- `app/actions/users.ts` - User data fetching
- `app/actions/trends.ts` - Trends data fetching
- `app/actions/knowledge.ts` - Knowledge base data fetching

## Screenshots & Examples

### Example KPI Values
```
Total Users: 4
Active Users: 3
Total Validations: 12
Avg. Relevance: 78
Total Trends: 11
Knowledge Base: 5
```

### Example Activity Entry
```
Sarah Johnson validated content
2h ago • 8 validations • Avg: 82
```

### Example System Status
```
✅ API Status - All systems operational
✅ Database - 16 records
✅ AI Agent - Gemini 2.0 Flash active
✅ Vector Search - 5 embeddings
```

## Support

For issues with the admin dashboard:
1. Check this documentation
2. Verify all migrations are run
3. Check browser console for errors
4. Review Supabase logs
5. Ensure environment variables are set

---

**Last Updated:** January 2026
**Version:** 1.0.0 (MVP)
