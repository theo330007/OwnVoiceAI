'use client';

import { useState } from 'react';
import {
  Sparkles, Loader2, RefreshCcw, Lightbulb, LayoutGrid, Video,
  BookHeart, ShoppingBag, CheckCircle2, FolderPlus, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { createProjectFromIdea } from '@/app/actions/projects';

// ─── Types ───────────────────────────────────────────────────────────────────

interface IdeaItem {
  hook: string;
  concept: string;
  cta: string;
  source_type: string;
}

interface IdeaSet {
  carousel: IdeaItem[];
  reel: IdeaItem[];
  storytelling: IdeaItem[];
  sales: IdeaItem[];
  pillar: string;
  angle: string;
  sources: string[];
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

// ─── Idea Card ────────────────────────────────────────────────────────────────

function IdeaCard({
  idea,
  angle,
  format,
  pillar,
}: {
  idea: IdeaItem;
  angle: string;
  format: FormatKey;
  pillar: string;
}) {
  const [saveState, setSaveState] = useState<null | 'loading' | { id: string }>(null);
  const sourceStyle = SOURCE_COLORS[idea.source_type] || 'bg-sage/10 text-sage';
  const angleOpt = ANGLE_OPTIONS.find(a => a.key === angle);

  const handleSave = async () => {
    setSaveState('loading');
    try {
      const project = await createProjectFromIdea({
        hook: idea.hook,
        concept: idea.concept,
        cta: idea.cta,
        pillar,
        format,
        source_type: idea.source_type,
      });
      setSaveState({ id: project.id });
    } catch {
      setSaveState(null);
    }
  };

  return (
    <div className="bg-white border border-warm-border rounded-2xl p-4 hover:border-sage/30 hover:shadow-soft transition-all flex flex-col">
      {/* Badges */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sourceStyle}`}>
          {idea.source_type}
        </span>
        {angle !== 'standard' && angleOpt?.badgeBg && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${angleOpt.badgeBg} ${angleOpt.badgeText}`}>
            {angleOpt.label}
          </span>
        )}
      </div>

      {/* Content */}
      <p className="font-semibold text-sage text-sm leading-snug mb-1.5">{idea.hook}</p>
      <p className="text-xs text-sage/60 leading-relaxed line-clamp-2 mb-2">{idea.concept}</p>
      <p className="text-xs text-dusty-rose font-medium mb-3">{idea.cta}</p>

      {/* Save as Project */}
      <div className="mt-auto pt-2 border-t border-sage/8">
        {saveState === null && (
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-[11px] text-sage/50 hover:text-sage font-medium transition-colors group"
          >
            <FolderPlus className="w-3.5 h-3.5 group-hover:text-sage transition-colors" />
            Save as Project
          </button>
        )}
        {saveState === 'loading' && (
          <span className="flex items-center gap-1.5 text-[11px] text-sage/40">
            <Loader2 className="w-3 h-3 animate-spin" /> Saving…
          </span>
        )}
        {saveState !== null && saveState !== 'loading' && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-sage font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Saved to Projects
            </span>
            <Link
              href="/projects"
              className="ml-auto flex items-center gap-1 text-[11px] text-dusty-rose hover:text-dusty-rose/80 font-medium transition-colors"
            >
              Open
              <ExternalLink className="w-3 h-3" />
            </Link>
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
  const [ideas, setIdeas] = useState<Record<string, IdeaSet>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFormat, setActiveFormat] = useState<FormatKey>('carousel');
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSource = (s: string) => {
    setSources(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleGenerate = async () => {
    if (!activePillar || sources.length === 0) return;
    const pillar = pillars.find(p => p.title === activePillar);
    if (!pillar) return;

    setIsGenerating(true);
    setError(null);
    setSourceFilter(null);
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
      {/* A — Pillar selector */}
      <div>
        <p className="text-[10px] font-bold text-sage/40 uppercase tracking-widest mb-2">Content Pillar</p>
        <div className="flex flex-wrap gap-2">
          {pillars.map(p => (
            <button
              key={p.title}
              onClick={() => { setActivePillar(p.title); setSourceFilter(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                activePillar === p.title
                  ? 'bg-sage text-cream border-sage shadow-sm'
                  : 'bg-white text-sage/60 border-sage/15 hover:border-sage/35 hover:text-sage'
              }`}
            >
              {p.title}
              {ideas[p.title] && (
                <CheckCircle2 className="inline-block w-3 h-3 ml-1.5 opacity-70" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* B — Controls */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-sage/3 border border-sage/8 rounded-2xl">
        {/* Angle */}
        <div className="flex-1">
          <p className="text-[10px] font-bold text-sage/40 uppercase tracking-widest mb-2">Angle</p>
          <div className="flex gap-1.5 flex-wrap">
            {ANGLE_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setAngle(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  angle === opt.key
                    ? opt.key === 'standard'
                      ? 'bg-sage text-cream border-sage shadow-sm'
                      : `${opt.badgeBg} ${opt.badgeText} border-transparent shadow-sm`
                    : 'bg-white text-sage/50 border-sage/15 hover:border-sage/30 hover:text-sage'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div className="flex-1">
          <p className="text-[10px] font-bold text-sage/40 uppercase tracking-widest mb-2">Draw from</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_SOURCES.map(s => (
              <button
                key={s}
                onClick={() => toggleSource(s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                  sources.includes(s)
                    ? `${SOURCE_COLORS[s] || 'bg-sage/10 text-sage'} border-transparent`
                    : 'bg-white text-sage/40 border-sage/15 hover:border-sage/30'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

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
              disabled={isGenerating || sources.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-sage/10 hover:bg-sage/20 text-sage text-sm font-medium rounded-xl transition-all disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              Regenerate
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={isGenerating || sources.length === 0}
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

      {/* D — Results */}
      {currentIdeas && (
        <div>
          {/* Format tabs */}
          <div className="flex gap-1 p-1 bg-sage/5 rounded-2xl mb-3">
            {FORMATS.map(({ key, label, count, icon: Icon }) => (
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
                }`}>{count}</span>
              </button>
            ))}
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
                  angle={currentIdeas.angle}
                  format={activeFormat}
                  pillar={activePillar}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
