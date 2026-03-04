'use client';

import { Instagram, Video } from 'lucide-react';
import { DiscoveryPanel } from './DiscoveryPanel';
import { HotTopicsWidget } from './HotTopicsWidget';
import { WelcomeBanner } from './WelcomeBanner';
import Link from 'next/link';
import type { Trend } from '@/lib/types';

interface Props {
  user: any;
  macroTrends: Trend[];
  nicheTrends: Trend[];
  strategicInsights: any[];
  instagramConnected: boolean;
  instagramUsername: string | null;
  userIndustries: string[];
  hotNews: string;
  strategy: Record<string, any>;
  isFirstVisit: boolean;
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

export function DashboardShell({
  user,
  macroTrends,
  nicheTrends,
  strategicInsights,
  instagramConnected,
  instagramUsername,
  userIndustries,
  hotNews,
  strategy,
  isFirstVisit,
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
          {/* Left: Discovery (flex-1) */}
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

          {/* Right sidebar (320px) */}
          <div className="w-80 flex-shrink-0 space-y-4">
            <SocialStatusRow
              instagramConnected={instagramConnected}
              instagramUsername={instagramUsername}
            />
            <HotTopicsWidget initialHotNews={hotNews} />
          </div>
        </div>
      </div>
    </div>
  );
}
