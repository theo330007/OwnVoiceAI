'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles, Loader2, RefreshCcw, Lightbulb, LayoutGrid, Video,
  BookHeart, ShoppingBag, CheckCircle2, CalendarCheck, CalendarPlus, Play,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────────────

interface IdeaItem {
  hook: string;
  concept: string;
  cta: string;
  source_type: string;
  scheduled_date?: string;
  day_name?: string;
  contentType?: 'Value' | 'Authority' | 'Sales';
}

interface IdeaSet {
  carousel: IdeaItem[];
  reel: IdeaItem[];
  storytelling: IdeaItem[];
  sales: IdeaItem[];
  pillar: string;
  angle: string;
  sources: string[];
  total_scheduled?: number;
  first_date?: string;
  last_date?: string;
}

type FormatKey = 'carousel' | 'reel' | 'storytelling' | 'sales';

interface Props {
  userId: string;
  pillars: { title: string; description: string }[];
  strategy: Record<string, any>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_SOURCES = ['Inspiration', 'News', 'Competition', 'Global Trends', 'Niche Trends'];
const DEFAULT_SOURCES = ['Inspiration', 'Niche Trends', 'Global Trends'];

const FORMATS: { key: FormatKey; label: string; count: number; icon: React.ElementType }[] = [
  { key: 'carousel',     label: 'Carousel',   count: 10, icon: LayoutGrid },
  { key: 'reel',         label: 'Reel',        count: 5,  icon: Video },
  { key: 'storytelling', label: 'Story',       count: 3,  icon: BookHeart },
  { key: 'sales',        label: 'Sales',       count: 3,  icon: ShoppingBag },
];

const ANGLE_OPTIONS = [
  { key: 'standard',        label: 'Standard',        badgeBg: '',                         badgeText: '' },
  { key: 'differentiating', label: 'Differentiating',  badgeBg: 'bg-blue-50',               badgeText: 'text-blue-700' },
  { key: 'polarizing',      label: 'Polarizing',       badgeBg: 'bg-dusty-rose/10',         badgeText: 'text-dusty-rose' },
] as const;

const SOURCE_COLORS: Record<string, string> = {
  'Inspiration':    'bg-sage/10 text-sage',
  'News':           'bg-amber-50 text-amber-700',
  'Competition':    'bg-blue-50 text-blue-700',
  'Global Trends':  'bg-purple-50 text-purple-700',
  'Niche Trends':   'bg-dusty-rose/10 text-dusty-rose',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatScheduledDate(date: string): string {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const CONTENT_TYPE_STYLE: Record<string, string> = {
  Value:     'bg-emerald-50 text-emerald-700',
  Authority: 'bg-blue-50 text-blue-700',
  Sales:     'bg-dusty-rose/10 text-dusty-rose',
};

// ─── Idea Card ────────────────────────────────────────────────────────────────

function IdeaCard({
  idea,
  format,
  pillar,
  onAdded,
}: {
  idea: IdeaItem;
  format: FormatKey;
  pillar: string;
  onAdded: () => void;
}) {
  const router = useRouter();
  const [addState, setAddState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const sourceStyle = SOURCE_COLORS[idea.source_type] || 'bg-sage/10 text-sage';
  const ctStyle = idea.contentType ? CONTENT_TYPE_STYLE[idea.contentType] : 'bg-sage/10 text-sage';

  const handleOpenInLab = () => {
    const params = new URLSearchParams({ trend: idea.hook });
    params.set('trendDesc', idea.concept);
    router.push(`/lab?${params.toString()}`);
  };

  const handleAddToCalendar = async () => {
    if (!idea.scheduled_date) return;
    setAddState('loading');
    try {
      const res = await fetch('/api/ideas/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pillar, ideas: [{ ...idea, format }] }),
      });
      if (!res.ok) throw new Error();
      setAddState('done');
      setTimeout(() => onAdded(), 1200); // brief "done" flash then remove
    } catch {
      setAddState('error');
      setTimeout(() => setAddState('idle'), 2000);
    }
  };

  return (
    <div className="bg-white border border-warm-border rounded-2xl p-5 hover:border-sage/30 hover:shadow-soft transition-all flex flex-col">
      {/* Row 1: pillar reminder + content type */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-sage/40 font-medium">{pillar}</span>
        {idea.contentType && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ctStyle}`}>
            {idea.contentType}
          </span>
        )}
      </div>

      {/* Row 2: source + date */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sourceStyle}`}>
          {idea.source_type}
        </span>
        {idea.scheduled_date && (
          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sage/8 text-sage/60">
            <CalendarCheck className="w-3 h-3" />
            {idea.day_name?.slice(0, 3)} · {formatScheduledDate(idea.scheduled_date)}
          </span>
        )}
      </div>

      {/* Content */}
      <h3 className="font-serif font-semibold text-sage text-sm leading-snug mb-1.5">{idea.hook}</h3>
      <p className="text-xs text-sage/60 leading-relaxed line-clamp-2 mb-2">{idea.concept}</p>
      <p className="text-xs text-dusty-rose font-medium mb-3">{idea.cta}</p>

      {/* Open in Lab */}
      <button
        onClick={handleOpenInLab}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 mb-3 rounded-xl bg-gradient-to-r from-sage to-dusty-rose text-cream text-xs font-medium hover:opacity-90 transition-opacity"
      >
        <Play className="w-3 h-3" />
        Open in Lab
      </button>

      {/* Add to Calendar */}
      <div className="mt-auto">
        {addState === 'idle' && (
          <button
            onClick={handleAddToCalendar}
            disabled={!idea.scheduled_date}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-sage/15 bg-sage/5 hover:bg-sage/10 text-sage text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            Add to Calendar
          </button>
        )}
        {addState === 'loading' && (
          <div className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-sage/15 bg-sage/5 text-sage/40 text-xs font-medium">
            <Loader2 className="w-3 h-3 animate-spin" /> Adding…
          </div>
        )}
        {addState === 'done' && (
          <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-green-50 border border-green-100">
            <span className="flex items-center gap-1 text-xs text-sage font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Added · {idea.day_name?.slice(0, 3)} {formatScheduledDate(idea.scheduled_date!)}
            </span>
            <Link
              href="/editorial"
              className="ml-auto text-[11px] text-dusty-rose hover:text-dusty-rose/80 font-medium transition-colors underline"
            >
              View →
            </Link>
          </div>
        )}
        {addState === 'error' && (
          <div className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-100 bg-red-50 text-red-500 text-xs font-medium">
            Failed — try again
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function IdeasPanel({ userId, pillars, strategy }: Props) {
  const [activePillar, setActivePillar] = useState(pillars[0]?.title || '');
  const [angle, setAngle] = useState<'standard' | 'differentiating' | 'polarizing'>('standard');
  const [sources, setSources] = useState<string[]>(DEFAULT_SOURCES);
  const [ideas, setIdeas] = useState<Record<string, IdeaSet>>(() => {
    try {
      const stored = sessionStorage.getItem('ov_ideas');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFormat, setActiveFormat] = useState<FormatKey>('carousel');
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scheduleState, setScheduleState] = useState<'idle' | 'pending' | 'saving' | 'done'>('idle');
  const [scheduleMeta, setScheduleMeta] = useState<{ count: number; first: string; last: string } | null>(null);

  useEffect(() => {
    try { sessionStorage.setItem('ov_ideas', JSON.stringify(ideas)); } catch {}
  }, [ideas]);

  const toggleSource = (s: string) => {
    setSources(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSchedule = async () => {
    const currentIdeasForPillar = ideas[activePillar];
    if (!currentIdeasForPillar) return;
    setScheduleState('saving');
    try {
      const allIdeas = [
        ...currentIdeasForPillar.carousel,
        ...currentIdeasForPillar.reel,
        ...currentIdeasForPillar.storytelling,
        ...currentIdeasForPillar.sales,
      ].filter(i => i.scheduled_date);
      const res = await fetch('/api/ideas/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pillar: activePillar, ideas: allIdeas }),
      });
      if (!res.ok) throw new Error('Failed to schedule');
      setScheduleState('done');
    } catch {
      setScheduleState('pending'); // revert so user can retry
    }
  };

  const handleGenerate = async () => {
    if (!activePillar) return;
    const pillar = pillars.find(p => p.title === activePillar);
    if (!pillar) return;

    setIsGenerating(true);
    setError(null);
    setSourceFilter(null);
    setScheduleState('idle');
    try {
      const res = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pillar, angle, sources }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate ideas');
      setIdeas(prev => ({ ...prev, [activePillar]: { ...data, pillar: activePillar, angle, sources } }));
      setActiveFormat('carousel');
      if (data.total_scheduled && data.first_date && data.last_date) {
        setScheduleMeta({ count: data.total_scheduled, first: data.first_date, last: data.last_date });
        setScheduleState('pending');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate ideas');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentIdeas = ideas[activePillar];
  const formatItems: IdeaItem[] = currentIdeas ? currentIdeas[activeFormat] : [];
  const filteredItems = sourceFilter
    ? formatItems.filter(i => i.source_type === sourceFilter)
    : formatItems;

  const allSourceTypes = currentIdeas
    ? [...new Set(
        [...currentIdeas.carousel, ...currentIdeas.reel, ...currentIdeas.storytelling, ...currentIdeas.sales]
          .map(i => i.source_type)
      )]
    : [];

  if (pillars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Lightbulb className="w-12 h-12 text-sage/20 mb-4" />
        <p className="font-medium text-sage/60 mb-1">No content pillars yet</p>
        <p className="text-xs text-sage/40 mb-4">
          Complete your onboarding or set your pillars in Settings to unlock Idea Generation.
        </p>
        <Link
          href="/profile"
          className="text-xs text-dusty-rose underline hover:text-dusty-rose/80 transition-colors"
        >
          Go to Settings →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* C — Generate button */}
      <div className="flex items-center gap-3">
        {error && <p className="text-xs text-red-500 flex-1">{error}</p>}
        <div className="flex-1" />
        {currentIdeas ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-sage/40">
              {Object.values(ideas).filter(Boolean).length}/{pillars.length} pillars generated
            </span>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-sage/10 hover:bg-sage/20 text-sage text-sm font-medium rounded-xl transition-all disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              Regenerate
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sage to-sage/80 hover:from-sage/90 hover:to-sage/70 text-cream text-sm font-medium rounded-xl transition-all disabled:opacity-60 shadow-sm"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating 21 ideas…</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Ideas</>
            )}
          </button>
        )}
      </div>

      {/* Calendar scheduling banner */}
      {scheduleMeta && scheduleState === 'pending' && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <CalendarCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 flex-1">
            <span className="font-semibold">{scheduleMeta.count} ideas</span> ready — scheduled from{' '}
            <span className="font-semibold">{formatScheduledDate(scheduleMeta.first)}</span> to{' '}
            <span className="font-semibold">{formatScheduledDate(scheduleMeta.last)}</span>.
            Add them to your editorial calendar?
          </p>
          <button
            onClick={handleSchedule}
            className="shrink-0 px-3 py-1.5 bg-sage text-cream text-xs font-semibold rounded-lg hover:bg-sage/90 transition-colors"
          >
            Add to Calendar
          </button>
          <button
            onClick={() => setScheduleState('idle')}
            className="shrink-0 text-amber-400 hover:text-amber-600 transition-colors text-xs"
          >
            ✕
          </button>
        </div>
      )}
      {scheduleState === 'saving' && (
        <div className="flex items-center gap-2 px-4 py-3 bg-sage/8 border border-sage/15 rounded-2xl">
          <Loader2 className="w-4 h-4 text-sage animate-spin shrink-0" />
          <p className="text-xs text-sage">Adding ideas to your calendar…</p>
        </div>
      )}
      {scheduleState === 'done' && scheduleMeta && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-xs text-green-800 flex-1">
            <span className="font-semibold">{scheduleMeta.count} ideas</span> added to your editorial calendar.
          </p>
          <Link
            href="/editorial"
            className="shrink-0 text-[11px] font-semibold text-dusty-rose hover:text-dusty-rose/80 transition-colors underline"
          >
            View calendar →
          </Link>
        </div>
      )}

      {/* D — Results */}
      {currentIdeas && (
        <div>
          {/* Format tabs */}
          <div className="flex gap-1 p-1 bg-sage/5 rounded-2xl mb-3">
            {FORMATS.map(({ key, label, icon: Icon }) => {
              const actualCount = currentIdeas[key]?.length ?? 0;
              return (
                <button
                  key={key}
                  onClick={() => { setActiveFormat(key); setSourceFilter(null); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeFormat === key
                      ? 'bg-white text-sage shadow-sm'
                      : 'text-sage/40 hover:text-sage/70'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeFormat === key ? 'bg-sage/10 text-sage' : 'bg-sage/5 text-sage/40'
                  }`}>{actualCount}</span>
                </button>
              );
            })}
          </div>

          {/* Source filter chips */}
          {allSourceTypes.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              <span className="text-[10px] text-sage/40 font-semibold uppercase tracking-wider mr-1">Filter:</span>
              <button
                onClick={() => setSourceFilter(null)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                  sourceFilter === null
                    ? 'bg-sage text-cream border-sage'
                    : 'bg-white text-sage/50 border-sage/15 hover:border-sage/30'
                }`}
              >
                All
              </button>
              {allSourceTypes.map(st => (
                <button
                  key={st}
                  onClick={() => setSourceFilter(st === sourceFilter ? null : st)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                    sourceFilter === st
                      ? `${SOURCE_COLORS[st] || 'bg-sage/10 text-sage'} border-transparent shadow-sm`
                      : 'bg-white text-sage/50 border-sage/15 hover:border-sage/30'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}

          {/* Cards grid */}
          {filteredItems.length === 0 ? (
            <p className="text-center text-xs text-sage/40 py-8">No ideas match this filter.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredItems.map((idea, i) => (
                <IdeaCard
                  key={i}
                  idea={idea}
                  format={activeFormat}
                  pillar={activePillar}
                  onAdded={() => {
                    setIdeas(prev => {
                      const set = prev[activePillar];
                      if (!set) return prev;
                      const updated = { ...set, [activeFormat]: set[activeFormat].filter(x => x !== idea) };
                      return { ...prev, [activePillar]: updated };
                    });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
