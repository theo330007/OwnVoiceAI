# OwnVoiceAI - Quick Setup Guide

## ✅ What's Already Done

Your OwnVoiceAI MVP is **fully built** and ready to use! Here's what's included:

### Core Features
- ✨ **OwnVoice AI Lab** - Chat interface with streaming AI validation
- 📊 **Dashboard** - Macro trends, niche trends, and strategic insights
- 🔧 **Admin Panels** - Manual trend and knowledge base management
- 🎨 **Boutique Design** - Sage, cream, and dusty rose color palette

### Tech Stack
- Next.js 14 with App Router
- Tailwind CSS with custom design system
- Supabase (PostgreSQL + pgvector)
- Gemini 2.5 Flash (AI agent with function calling)

## 🚀 Next Steps to Launch

### 1. Run Database Migrations

Go to your Supabase project SQL Editor and run:

```sql
-- Copy and paste from: supabase/migrations/001_initial_schema.sql
```

### 2. Add Sample Data (Optional but Recommended)

Run the sample data SQL in Supabase SQL Editor:

```sql
-- Copy and paste from: data/sample-data.sql
```

This gives you 5 macro trends and 6 niche trends to start with.

### 3. Add Knowledge Base Entries

Since embeddings need to be generated, use the admin panel:

1. Go to [http://localhost:3000/admin/knowledge](http://localhost:3000/admin/knowledge)
2. Add 3-5 scientific articles using the examples in `data/sample-data.sql`
3. Each entry will automatically generate embeddings via Gemini

### 4. Test the AI Validation

1. Go to [http://localhost:3000/lab](http://localhost:3000/lab)
2. Try a content idea like:
   - "Instagram reel: 5 ways omega-3s support fertility"
   - "Blog post: The gut-brain connection and mental health"
3. Watch the AI analyze trends and find scientific anchors!

## 📁 Key Files

### Frontend
- `app/page.tsx` - Homepage
- `app/dashboard/page.tsx` - Main dashboard
- `app/lab/page.tsx` - AI validation chat
- `components/ui/` - Reusable UI components

### Backend
- `lib/agents/validation-agent.ts` - AI agent with function calling
- `lib/services/gemini.service.ts` - Gemini API integration
- `lib/services/vector.service.ts` - Vector search
- `app/api/validate/route.ts` - Streaming API endpoint

### Database
- `supabase/migrations/001_initial_schema.sql` - Complete schema
- `data/sample-data.sql` - Sample trends

## 🎯 Features Ready to Use

### 1. OwnVoice AI Lab
- Real-time streaming AI responses
- Function calling (searches trends + knowledge base)
- Structured output with:
  - Relevance score (1-100)
  - Trend alignment (macro + niche)
  - Scientific anchors with credibility score
  - 3 refined hook variations
- Copy-to-clipboard for hooks

### 2. Dashboard
- View macro trends
- View niche trends
- Strategic insights panel
- One-click navigation to AI Lab

### 3. Admin Panels
- Add/manage trends manually
- Add/manage knowledge base with auto-embedding
- Bulk data entry ready

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Routes

- `/` - Homepage
- `/dashboard` - Main dashboard
- `/lab` - OwnVoice AI Lab (chat)
- `/admin/trends` - Manage trends
- `/admin/knowledge` - Manage knowledge base

## 💡 Tips

1. **Add 5-10 knowledge base entries** for best results
2. **Use specific content ideas** when testing the AI Lab
3. **Check Supabase logs** if you encounter any database errors
4. **The AI agent calls two functions**:
   - `get_latest_trends` - Fetches current trends
   - `search_knowledge_base` - Semantic search via pgvector

## 🚧 Phase 2 Enhancements (Future)

- Automated trend scraping with Firecrawl
- Inngest workflows for 3-layer reporting
- Multi-tenant architecture with auth
- Content calendar and team collaboration

## 🎨 Design Tokens

Colors are defined in `tailwind.config.ts`:
- **Sage**: `#556B2F` (primary)
- **Cream**: `#FAF9F6` (background)
- **Dusty Rose**: `#D4A373` (accent)

Fonts:
- **Serif**: Playfair Display (headers)
- **Sans**: Inter (body text)

---

**Your MVP is ready!** 🎉

Start by running the database migrations, adding sample data, and testing the AI Lab.
