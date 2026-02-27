'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Target,
  Instagram,
  Loader2,
  Play,
  ChevronRight,
} from 'lucide-react';
import { generateStrategicInsight } from '@/app/actions/user-trends';
import { createWorkflow } from '@/app/actions/workflows';
import { scrapeUserInstagramTrends } from '@/app/actions/user-trends';
import type { Trend } from '@/lib/types';

interface Props {
  macroTrends: Trend[];
  nicheTrends: Trend[];
  userId: string;
  userIndustries: string[];
}

function momentumBadge(score: number | null) {
  if (!score) return { label: 'Niche', className: 'bg-sage/10 text-sage' };
  if (score >= 75) return { label: 'Rising', className: 'bg-green-100 text-green-700' };
  if (score >= 50) return { label: 'Active', className: 'bg-dusty-rose/20 text-dusty-rose' };
  return { label: 'Niche', className: 'bg-sage/10 text-sage' };
}

function TrendCard({
  trend,
  userId,
}: {
  trend: Trend;
  userId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const momentum = momentumBadge(trend.relevance_score);

  const handleStartWorkflow = async () => {
    // Macro trends are admin-scoped (no user_id); route directly to the lab
    if (trend.layer === 'macro') {
      router.push(`/lab?trend=${encodeURIComponent(trend.title)}`);
      return;
    }
    setLoading(true);
    try {
      const result = await generateStrategicInsight(trend.id, userId);
      if (!result?.id) throw new Error('No insight generated');
      const workflow = await createWorkflow(result.id, 'educational');
      router.push(`/lab/workflow/${workflow.id}`);
    } catch (error: any) {
      alert(error.message || 'Failed to start workflow');
      setLoading(false);
    }
  };

  const relScore = trend.relevance_score ?? 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-warm-border hover:border-sage/30 hover:shadow-soft transition-all group">
      {/* Badges row */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${momentum.className}`}>
          {momentum.label}
        </span>
        {trend.trend_type && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sage/5 text-sage/60">
            {trend.trend_type}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-serif text-sage-700 text-base font-semibold leading-snug mb-1.5 group-hover:text-sage transition-colors">
        {trend.title}
      </h3>

      {/* Description */}
      {trend.description && (
        <p className="text-xs text-sage/60 line-clamp-2 mb-3 leading-relaxed">
          {trend.description}
        </p>
      )}

      {/* Relevance bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-sage/40">Relevance</span>
          <span className="text-xs font-semibold text-sage/60">{relScore}%</span>
        </div>
        <div className="h-1 bg-sage/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sage to-dusty-rose rounded-full transition-all"
            style={{ width: `${relScore}%` }}
          />
        </div>
      </div>

      {/* Start Workflow */}
      <button
        onClick={handleStartWorkflow}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-sage to-dusty-rose text-cream text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Creating workflow…
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5" />
            Start Workflow
          </>
        )}
      </button>
    </div>
  );
}

export function DiscoveryPanel({ macroTrends, nicheTrends, userId, userIndustries }: Props) {
  const [activeTab, setActiveTab] = useState<'niche' | 'macro'>('niche');
  const [isScraping, setIsScraping] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState(userIndustries[0] || '');
  const [localNicheTrends, setLocalNicheTrends] = useState(nicheTrends);

  const handleScrape = async () => {
    setIsScraping(true);
    try {
      await scrapeUserInstagramTrends(userId, selectedIndustry);
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setIsScraping(false);
    }
  };

  const displayTrends = activeTab === 'niche' ? localNicheTrends : macroTrends;

  return (
    <div className="flex flex-col h-full">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-sage">Trend Discovery</h2>

        {/* Toggle */}
        <div className="flex items-center gap-1 p-1 bg-sage/5 rounded-2xl">
          <button
            onClick={() => setActiveTab('niche')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'niche'
                ? 'bg-white text-sage shadow-soft'
                : 'text-sage/50 hover:text-sage'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Niche Trends
          </button>
          <button
            onClick={() => setActiveTab('macro')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'macro'
                ? 'bg-white text-sage shadow-soft'
                : 'text-sage/50 hover:text-sage'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Macro Trends
          </button>
        </div>
      </div>

      {/* Niche scrape controls */}
      {activeTab === 'niche' && (
        <div className="mb-5 flex items-center gap-3">
          {userIndustries.length > 1 && (
            <div className="flex gap-1.5 flex-wrap">
              {userIndustries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedIndustry === ind
                      ? 'bg-dusty-rose text-cream'
                      : 'bg-sage/10 text-sage/60 hover:bg-sage/20'
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleScrape}
            disabled={isScraping || !selectedIndustry}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isScraping ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Instagram className="w-3.5 h-3.5" />
            )}
            {isScraping ? 'Scraping…' : `Scrape ${selectedIndustry || 'Trends'}`}
          </button>
        </div>
      )}

      {/* Trend cards grid */}
      {displayTrends.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
          {activeTab === 'niche' ? (
            <Target className="w-12 h-12 text-sage/20 mb-4" />
          ) : (
            <TrendingUp className="w-12 h-12 text-sage/20 mb-4" />
          )}
          <p className="text-sage/50 font-medium mb-1">No {activeTab} trends yet</p>
          <p className="text-xs text-sage/40">
            {activeTab === 'niche'
              ? 'Click "Scrape Trends" above to discover industry trends'
              : 'Macro trends are updated by the admin team'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-4">
          {displayTrends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}
