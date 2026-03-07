'use client';

import { Instagram, Video, FlaskConical, TrendingUp, FolderPlus, MessageSquare, ArrowRight, Sparkles, Lightbulb } from 'lucide-react';
import { EditorialCalendar } from '@/app/editorial/components/EditorialCalendar';
import { HotTopicsWidget, type UserNewsItem } from './HotTopicsWidget';
import { WelcomeBanner } from './WelcomeBanner';
import Link from 'next/link';
import type { Project } from '@/app/actions/projects';

interface TrendItem { id: string; title: string; description: string; }

interface Props {
  user: any;
  instagramConnected: boolean;
  instagramUsername: string | null;
  userNews: UserNewsItem[];
  isFirstVisit: boolean;
  pillars: { title: string; description: string }[];
  objectives: string[];
  nicheContext: string;
  existingPlan: any;
  projects: Project[];
  recentTrends: TrendItem[];
}

function SocialStatusRow({
  instagramConnected,
  instagramUsername,
}: {
  instagramConnected: boolean;
  instagramUsername: string | null;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Link
        href="/integrations/instagram"
        className="flex items-center gap-3 bg-white border border-warm-border rounded-2xl px-4 py-3 hover:border-sage/30 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Instagram className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-sage">Instagram</p>
          <p className="text-xs text-sage/50">
            {instagramConnected ? `@${instagramUsername}` : 'Not connected'}
          </p>
        </div>
      </Link>
      <Link
        href="/integrations"
        className="flex items-center gap-3 bg-white border border-warm-border rounded-2xl px-4 py-3 hover:border-sage/30 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-black to-gray-700 flex items-center justify-center">
          <Video className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-sage">TikTok</p>
          <p className="text-xs text-sage/50">Not connected</p>
        </div>
      </Link>
    </div>
  );
}

function DiscoverCard() {
  return (
    <div className="bg-white border border-warm-border rounded-3xl p-5 shadow-soft">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-dusty-rose/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-dusty-rose" />
        </div>
        <h3 className="font-serif text-base text-sage">Discover</h3>
      </div>

      <p className="text-xs text-sage/60 mb-4 leading-relaxed">
        Explore macro trends, niche signals, and AI-generated content ideas tailored to your brand strategy.
      </p>

      <ul className="space-y-2 mb-4">
        {[
          { icon: TrendingUp,    text: 'Macro & niche trend radar' },
          { icon: Sparkles,      text: 'AI idea generation' },
          { icon: MessageSquare, text: 'Strategic content angles' },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2 text-xs text-sage/70">
            <Icon className="w-3.5 h-3.5 text-sage/40 flex-shrink-0" />
            {text}
          </li>
        ))}
      </ul>

      <Link
        href="/discover"
        className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-dusty-rose hover:bg-dusty-rose/90 text-cream text-sm font-medium rounded-2xl transition-colors"
      >
        Explore Ideas
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function LabCard() {
  return (
    <div className="bg-white border border-warm-border rounded-3xl p-5 shadow-soft">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-dusty-rose/10 flex items-center justify-center flex-shrink-0">
          <FlaskConical className="w-4 h-4 text-dusty-rose" />
        </div>
        <h3 className="font-serif text-base text-sage">OwnVoice Lab</h3>
      </div>

      <p className="text-xs text-sage/60 mb-4 leading-relaxed">
        Your AI-powered content studio. Validate ideas, generate production-ready assets, and launch full content workflows — all grounded in your brand voice.
      </p>

      <ul className="space-y-2 mb-4">
        {[
          { icon: MessageSquare, text: 'Validate ideas with AI analysis' },
          { icon: TrendingUp,    text: 'Ground content in real trends' },
          { icon: FolderPlus,   text: 'Turn ideas into full projects' },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2 text-xs text-sage/70">
            <Icon className="w-3.5 h-3.5 text-sage/40 flex-shrink-0" />
            {text}
          </li>
        ))}
      </ul>

      <Link
        href="/lab"
        className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-dusty-rose hover:bg-dusty-rose/90 text-cream text-sm font-medium rounded-2xl transition-colors"
      >
        Open the Lab
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

export function DashboardShell({
  user,
  instagramConnected,
  instagramUsername,
  userNews,
  isFirstVisit,
  pillars,
  objectives,
  nicheContext,
  existingPlan,
  projects,
  recentTrends,
}: Props) {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Creator';

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-cream">
      <div className="px-8 py-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sage/50 text-sm mb-1">{dateStr}</p>
          <h1 className="font-serif text-4xl text-sage">
            {greeting}, {firstName}
          </h1>
        </div>

        {/* Welcome banner — first-time users only */}
        <WelcomeBanner isFirstVisit={isFirstVisit} userName={firstName} />

        {/* Main 2-column layout */}
        <div className="flex gap-8">
          {/* Left: Editorial Calendar (flex-1) */}
          <div className="flex-1 min-w-0">
            <EditorialCalendar
              userId={user.id}
              pillars={pillars}
              objectives={objectives}
              nicheContext={nicheContext}
              existingPlan={existingPlan}
              projects={projects}
              recentTrends={recentTrends}
              hideControls
            />
          </div>

          {/* Right sidebar (320px) */}
          <div className="w-80 flex-shrink-0 space-y-4">
            <SocialStatusRow
              instagramConnected={instagramConnected}
              instagramUsername={instagramUsername}
            />
            <DiscoverCard />
            <HotTopicsWidget initialUserNews={userNews} />
            <LabCard />
          </div>
        </div>
      </div>
    </div>
  );
}
