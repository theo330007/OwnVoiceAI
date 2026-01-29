# OwnVoice AI

A boutique wellness content strategy platform that validates content ideas using AI-powered trend analysis and scientific research.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide React
- **Backend:** Next.js API Routes (Server Actions)
- **Database:** Supabase (PostgreSQL + pgvector)
- **LLM:** Gemini 2.5 Flash (via Google Generative AI SDK)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Google Gemini API key

### Setup

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd OwnVoiceAI
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**

- Create a new Supabase project at [supabase.com](https://supabase.com)
- Go to Project Settings > API to find your URL and keys
- Run the migration file `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor

4. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

```
OwnVoiceAI/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── lab/               # AI Lab (validation chat)
│   ├── admin/             # Admin panels
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── lib/
│   ├── services/          # Backend services
│   ├── agents/            # AI agents
│   └── types/             # TypeScript types
├── supabase/
│   └── migrations/        # Database migrations
└── scripts/               # Utility scripts
```

## Features

- **OwnVoice AI Lab:** Chat interface to validate content ideas
- **3-Layer Reporting:** Macro trends, niche trends, and strategic recommendations
- **Vector Search:** Scientific knowledge base powered by pgvector
- **Boutique Design:** Elegant wellness aesthetic with sage, cream, and dusty rose colors

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

MIT
