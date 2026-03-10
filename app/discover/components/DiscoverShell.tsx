'use client';

import { DiscoveryPanel } from '@/app/dashboard/components/DiscoveryPanel';
import type { Trend } from '@/lib/types';

interface Props {
  user: any;
  macroTrends: Trend[];
  nicheTrends: Trend[];
  strategicInsights: any[];
  userIndustries: string[];
  strategy: Record<string, any>;
}

export function DiscoverShell({ user, macroTrends, nicheTrends, strategicInsights, userIndustries, strategy }: Props) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-sage">Discover</h1>
          <p className="text-sage/50 text-sm mt-1">Trends, signals, and ideas to fuel your content strategy.</p>
        </div>
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
    </div>
  );
}
