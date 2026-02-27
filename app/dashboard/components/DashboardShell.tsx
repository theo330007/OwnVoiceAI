'use client';

import { Sparkles, Instagram, Video } from 'lucide-react';
import { DiscoveryPanel } from './DiscoveryPanel';
import { AIRecommendationCard } from './AIRecommendationCard';
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
        href="/profile"
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
        href="/profile"
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
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-sage/50 text-sm mb-1">{dateStr}</p>
            <h1 className="font-serif text-4xl text-sage">
              {greeting}, {firstName}
            </h1>
          </div>
          <Link
            href="/lab"
            className="group flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-sage to-dusty-rose text-cream rounded-2xl shadow-soft-lg hover:opacity-95 transition-all"
          >
            <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold leading-none">OwnVoice Creation Lab</p>
              <p className="text-xs text-cream/70 mt-0.5 leading-none">Create &amp; ideate content</p>
            </div>
          </Link>
        </div>

        {/* Main 2-column layout */}
        <div className="flex gap-8">
          {/* Left: Discovery (flex-1) */}
          <div className="flex-1 min-w-0">
            <DiscoveryPanel
              macroTrends={macroTrends}
              nicheTrends={nicheTrends}
              userId={user.id}
              userIndustries={userIndustries}
            />
          </div>

          {/* Right sidebar (320px) */}
          <div className="w-80 flex-shrink-0 space-y-4">
            <AIRecommendationCard insight={strategicInsights[0] || null} />
            <SocialStatusRow
              instagramConnected={instagramConnected}
              instagramUsername={instagramUsername}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
