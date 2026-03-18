'use client';

import { FlaskConical, TrendingUp, FolderPlus, MessageSquare, ArrowRight, Sparkles, CalendarDays, CheckCircle2 } from 'lucide-react';
import { DiscoveryPanel } from './DiscoveryPanel';
import { WelcomeBanner } from './WelcomeBanner';
import { HotTopicBubble } from './HotTopicBubble';
import Link from 'next/link';
import type { Project } from '@/app/actions/projects';
import type { Trend } from '@/lib/types';

interface Props {
  user: any;
  userNews: any[];
  isFirstVisit: boolean;
  pillars: { title: string; description: string }[];
  nicheContext: string;
  projects: Project[];
  macroTrends: Trend[];
  nicheTrends: Trend[];
  strategicInsights: any[];
  userIndustries: string[];
  strategy: Record<string, any>;
}

// ─── Wizard step cards ────────────────────────────────────────────────────────

function StructureCard() {
  return (
    <div className="bg-white border border-warm-border rounded-3xl p-5 shadow-soft">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-dusty-rose/10 flex items-center justify-center flex-shrink-0">
          <CalendarDays className="w-4 h-4 text-dusty-rose" />
        </div>
        <h3 className="font-serif text-base text-sage">Structure</h3>
      </div>
      <p className="text-xs text-sage/60 mb-4 leading-relaxed">
        Review your editorial calendar, check your content pillars, and know exactly where you stand.
      </p>
      <ul className="space-y-2 mb-4">
        {[
          { icon: CalendarDays, text: 'Weekly editorial calendar' },
          { icon: Sparkles,     text: 'Content pillars & strategy' },
          { icon: CheckCircle2, text: 'Plan & schedule posts' },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2 text-xs text-sage/70">
            <Icon className="w-3.5 h-3.5 text-sage/40 flex-shrink-0" />
            {text}
          </li>
        ))}
      </ul>
      <Link href="/editorial" className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-dusty-rose hover:bg-dusty-rose/90 text-cream text-sm font-medium rounded-2xl transition-colors">
        View Calendar <ArrowRight className="w-3.5 h-3.5" />
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
        Validate ideas, generate production-ready assets, and launch full content workflows grounded in your brand voice.
      </p>
      <ul className="space-y-2 mb-4">
        {[
          { icon: MessageSquare, text: 'Validate ideas with AI analysis' },
          { icon: TrendingUp,    text: 'Ground content in real trends' },
          { icon: FolderPlus,    text: 'Turn ideas into full projects' },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2 text-xs text-sage/70">
            <Icon className="w-3.5 h-3.5 text-sage/40 flex-shrink-0" />
            {text}
          </li>
        ))}
      </ul>
      <Link href="/lab" className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-dusty-rose hover:bg-dusty-rose/90 text-cream text-sm font-medium rounded-2xl transition-colors">
        Open the Lab <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────────

export function DashboardShell({
  user,
  isFirstVisit,
  macroTrends,
  nicheTrends,
  strategicInsights,
  userIndustries,
  strategy,
}: Props) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Creator';

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const wizardSteps = [
    { label: '01', card: <StructureCard /> },
    { label: '02', card: <LabCard /> },
  ];

  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">
      <div className="px-6 py-8">
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
        <div className="flex gap-5">
          {/* Left: Discover / trends panel */}
          <div className="flex-1 min-w-0">
            <DiscoveryPanel
              macroTrends={macroTrends}
              nicheTrends={nicheTrends}
              userId={user.id}
              userIndustries={userIndustries}
              strategicInsights={strategicInsights}
              pillars={strategy.content_pillars || []}
              strategy={strategy}
            />
          </div>

          {/* Right sidebar */}
          <div className="w-64 flex-shrink-0">
            <HotTopicBubble />
            {wizardSteps.map(({ label, card }, i) => (
              <div key={label} className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-6 h-6 rounded-full border border-sage/20 bg-white flex items-center justify-center text-[10px] font-bold text-sage/50 flex-shrink-0 shadow-sm">
                    {label}
                  </div>
                  {i < wizardSteps.length - 1 && (
                    <div className="w-px flex-1 bg-sage/[0.12] mt-2" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-5">
                  {card}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
