'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Target,
  Instagram,
  Loader2,
  Play,
  Sparkles,
  BookOpen,
  Camera,
  Megaphone,
  Users2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';
import { IdeasPanel } from './IdeasPanel';
import { generateStrategicInsight, scrapeUserInstagramTrends } from '@/app/actions/user-trends';
import { createWorkflow } from '@/app/actions/workflows';
import { TrendDetailModal } from '@/components/TrendDetailModal';
import type { Trend } from '@/lib/types';

interface Props {
  macroTrends: Trend[];
  nicheTrends: Trend[];
  userId: string;
  userIndustries: string[];
  strategicInsights: any[];
  pillars: { title: string; description: string }[];
  strategy: Record<string, any>;
}

const CONTENT_TYPES = [
  { key: 'educational', label: 'Edu', icon: BookOpen },
  { key: 'behind_the_scenes', label: 'BTS', icon: Camera },
  { key: 'promotional', label: 'Promo', icon: Megaphone },
  { key: 'interactive', label: 'Live', icon: Users2 },
] as const;

type ContentTypeKey = (typeof CONTENT_TYPES)[number]['key'];

function momentumBadge(score: number | null) {
  if (!score) return { label: 'Niche', className: 'bg-sage/10 text-sage' };
  if (score >= 75) return { label: 'Rising', className: 'bg-green-100 text-green-700' };
  if (score >= 50) return { label: 'Active', className: 'bg-dusty-rose/20 text-dusty-rose' };
  return { label: 'Niche', className: 'bg-sage/10 text-sage' };
}

// --- InsightTabView ---
function InsightTabView({
  insight,
  userId,
}: {
  insight: any;
  userId: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ContentTypeKey>('educational');
  const [startingWorkflow, setStartingWorkflow] = useState(false);

  const content = insight.content_ideas?.[activeTab];

  const handleStartWorkflow = async () => {
    setStartingWorkflow(true);
    try {
      const workflow = await createWorkflow(insight.id, activeTab);
      router.push(`/lab/workflow/${workflow.id}`);
    } catch (error: any) {
      alert(error.message || 'Failed to start workflow');
      setStartingWorkflow(false);
    }
  };

  return (
    <div>
      {/* Label */}
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles className="w-3 h-3 text-dusty-rose" />
        <p className="text-xs font-semibold text-dusty-rose uppercase tracking-wide">
          AI Strategic Insight
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 mb-3 p-1 bg-sage/5 rounded-xl">
        {CONTENT_TYPES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab(key);
            }}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === key
                ? 'bg-white text-sage shadow-sm'
                : 'text-sage/50 hover:text-sage/80'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {content ? (
        <div className="space-y-2 text-sm mb-3">
          <p className="text-sage italic leading-relaxed line-clamp-2">"{content.hook}"</p>
          <p className="text-sage/60 leading-relaxed text-xs line-clamp-2">{content.concept}</p>
          <p className="text-dusty-rose font-medium text-xs">{content.cta}</p>
        </div>
      ) : (
        <p className="text-xs text-sage/40 mb-3">No content for this type.</p>
      )}

      {/* Start Workflow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleStartWorkflow();
        }}
        disabled={startingWorkflow}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-sage to-dusty-rose text-cream text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {startingWorkflow ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Starting…
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

// --- GenerateInsightButton ---
function GenerateInsightButton({
  trend,
  userId,
  onGenerated,
}: {
  trend: Trend;
  userId: string;
  onGenerated: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await generateStrategicInsight(trend.id, userId);
      onGenerated();
    } catch (error: any) {
      alert(error.message || 'Failed to generate insight');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <p className="text-xs text-sage/50 text-center">
        No insight yet for this trend.
      </p>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sage to-dusty-rose text-cream text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" />
            Generate Insight
          </>
        )}
      </button>
    </div>
  );
}

// --- TrendCard ---
function TrendCard({
  trend,
  userId,
  existingInsight,
  isSelected,
  onSelect,
  onInsightGenerated,
  onOpenModal,
}: {
  trend: Trend;
  userId: string;
  existingInsight: any | null;
  isSelected: boolean;
  onSelect: () => void;
  onInsightGenerated: () => void;
  onOpenModal: () => void;
}) {
  const router = useRouter();
  const momentum = momentumBadge(trend.relevance_score);
  const relScore = trend.relevance_score ?? 0;
  const isMacro = trend.layer === 'macro';

  const handleCardClick = () => {
    onOpenModal();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
        isMacro
          ? 'border-warm-border hover:border-sage/30 hover:shadow-soft'
          : isSelected
          ? 'border-sage ring-2 ring-sage/20 shadow-soft'
          : 'border-warm-border hover:border-sage/30 hover:shadow-soft'
      }`}
    >
      {/* Badges row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${momentum.className}`}>
            {momentum.label}
          </span>
          {trend.trend_type && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sage/5 text-sage/60">
              {trend.trend_type}
            </span>
          )}
        </div>
        {!isMacro && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              isSelected
                ? 'bg-sage text-cream'
                : 'bg-sage/10 text-sage/60 hover:bg-sage/20 hover:text-sage'
            }`}
          >
            {isSelected ? 'Hide' : 'Insight'}
            {isSelected ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Title */}
      <h3 className="font-serif text-sage text-base font-semibold leading-snug mb-1.5">
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

      {/* Macro: Open in Lab button */}
      {isMacro && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/lab?trend=${encodeURIComponent(trend.title)}`);
          }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-sage to-dusty-rose text-cream text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Play className="w-3.5 h-3.5" />
          Open in Lab
        </button>
      )}

      {/* Niche: expanded insight section */}
      {isSelected && !isMacro && (
        <div
          className="border-t border-warm-border mt-1 pt-4"
          onClick={(e) => e.stopPropagation()}
        >
          {existingInsight ? (
            <InsightTabView insight={existingInsight} userId={userId} />
          ) : (
            <GenerateInsightButton
              trend={trend}
              userId={userId}
              onGenerated={onInsightGenerated}
            />
          )}
        </div>
      )}
    </div>
  );
}

// --- DiscoveryPanel ---
export function DiscoveryPanel({
  macroTrends,
  nicheTrends,
  userId,
  userIndustries,
  strategicInsights,
  pillars,
  strategy,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ideas' | 'niche' | 'macro'>('ideas');
  const [isScraping, setIsScraping] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState(userIndustries[0] || '');
  const [localNicheTrends, setLocalNicheTrends] = useState(nicheTrends);
  const [selectedTrendId, setSelectedTrendId] = useState<string | null>(null);
  const [modalTrend, setModalTrend] = useState<Trend | null>(null);

  const handleScrape = async () => {
    setIsScraping(true);
    try {
      await scrapeUserInstagramTrends(userId, selectedIndustry);
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setIsScraping(false);
    }
  };

  const filteredNicheTrends = selectedIndustry
    ? localNicheTrends.filter(
        (t) => !t.metadata?.industry || t.metadata.industry === selectedIndustry
      )
    : localNicheTrends;

  const displayTrends = activeTab === 'niche' ? filteredNicheTrends : macroTrends;

  return (
    <div className="flex flex-col h-full">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl text-sage">Content Discovery</h2>
          <p className="text-xs text-sage/50 mt-0.5">
            Generate ideas for your pillars, or explore what's trending in your niche
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-1 p-1 bg-sage/5 rounded-2xl">
          <button
            onClick={() => setActiveTab('ideas')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'ideas'
                ? 'bg-white text-sage shadow-soft'
                : 'text-sage/50 hover:text-sage'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Idea Generation
          </button>
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

      {/* Ideas tab */}
      {activeTab === 'ideas' && (
        <IdeasPanel userId={userId} pillars={pillars} strategy={strategy} />
      )}

      {/* Niche scrape controls */}
      {activeTab === 'niche' && (
        <div className="mb-5 flex items-center gap-3">
          {userIndustries.length > 1 && (
            <div className="flex gap-1.5 flex-wrap">
              {userIndustries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry((prev) => (prev === ind ? '' : ind))}
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

      {/* Trend cards grid (niche + macro only) */}
      {activeTab !== 'ideas' && (displayTrends.length === 0 ? (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-4 items-start">
          {displayTrends.map((trend) => {
            const existingInsight =
              strategicInsights.find((i) => i.trend_id === trend.id) ?? null;
            return (
              <TrendCard
                key={trend.id}
                trend={trend}
                userId={userId}
                existingInsight={existingInsight}
                isSelected={selectedTrendId === trend.id}
                onSelect={() =>
                  setSelectedTrendId((prev) => (prev === trend.id ? null : trend.id))
                }
                onInsightGenerated={() => router.refresh()}
                onOpenModal={() => setModalTrend(trend)}
              />
            );
          })}
        </div>
      ))}

      {/* Macro trend detail modal */}
      <TrendDetailModal
        trend={modalTrend}
        isOpen={modalTrend !== null}
        onClose={() => setModalTrend(null)}
      />
    </div>
  );
}
