'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, Plus, BookOpen, TrendingUp, ShoppingBag } from 'lucide-react';

// ─── Types (mirrored from EditorialCalendar) ──────────────────────────────────

interface DayRoutine {
  day: string;
  pillar: string;
  vibe: string;
}

interface PostSlot {
  day: string;
  pillar: string;
  contentType: 'Value' | 'Authority' | 'Sales';
  objective: string;
  format: string;
  topic: string;
  hook: string;
  project_id?: string | null;
  event_tag?: string;
  is_suggestion?: boolean;
  trend_id?: string;
}

interface EditorialPlan {
  start_date?: string;
  weeks: { week: number; theme: string; posts: PostSlot[] }[];
}

interface CreatePostModalProps {
  date: Date;
  plan: EditorialPlan;
  routine: DayRoutine[];
  pillars: { title: string; description: string }[];
  mix: { value: number; authority: number; sales: number };
  activeMixPreset: string | null;
  nicheContext: string;
  onClose: () => void;
  onSave: (post: PostSlot, date: Date) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const FORMATS = ['Reel', 'Carousel', 'Story', 'Static Post', 'Live', 'Newsletter'];
const OBJECTIVES = ['Visibility', 'Connection', 'Conversion', 'Education & Authority'];

const CONTENT_TYPE_CONFIG = {
  Value:     { icon: BookOpen,   bg: 'bg-sage/10',       text: 'text-sage',       activeBg: 'bg-sage',       activeText: 'text-cream' },
  Authority: { icon: TrendingUp, bg: 'bg-blue-50',       text: 'text-blue-700',   activeBg: 'bg-blue-600',   activeText: 'text-white' },
  Sales:     { icon: ShoppingBag,bg: 'bg-dusty-rose/10', text: 'text-dusty-rose', activeBg: 'bg-dusty-rose', activeText: 'text-white' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dominantType(mix: { value: number; authority: number; sales: number }): 'Value' | 'Authority' | 'Sales' {
  const max = Math.max(mix.value, mix.authority, mix.sales);
  if (max === mix.value) return 'Value';
  if (max === mix.authority) return 'Authority';
  return 'Sales';
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CreatePostModal({
  date,
  plan,
  routine,
  pillars,
  mix,
  activeMixPreset,
  nicheContext,
  onClose,
  onSave,
}: CreatePostModalProps) {
  const dayName = DAY_NAMES[date.getDay()];
  const routineEntry = routine.find(r => r.day === dayName);
  const suggestedPillar = routineEntry?.pillar ?? pillars[0]?.title ?? 'General';
  const suggestedType = dominantType(mix);

  const [pillar, setPillar] = useState(suggestedPillar);
  const [contentType, setContentType] = useState<'Value' | 'Authority' | 'Sales'>(suggestedType);
  const [format, setFormat] = useState('Reel');
  const [objective, setObjective] = useState('Visibility');
  const [topic, setTopic] = useState('');
  const [hook, setHook] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [outsidePlan, setOutsidePlan] = useState(false);

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  // Check if date is within the 4-week plan range
  useEffect(() => {
    if (!plan.start_date) { setOutsidePlan(true); return; }
    const startMs = new Date(plan.start_date).getTime();
    const diffDays = Math.floor((date.getTime() - startMs) / 86400_000);
    const weekIdx = Math.floor(diffDays / 7);
    if (weekIdx < 0 || weekIdx >= plan.weeks.length) setOutsidePlan(true);
  }, [date, plan]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/editorial/quick-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pillar, contentType, format, objective, nicheContext, dayOfWeek: dayName }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setTopic(data.topic ?? '');
      setHook(data.hook ?? '');
    } catch (err) {
      console.error('Quick post generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSave() {
    if (!topic.trim()) return;
    const post: PostSlot = {
      day: dayName,
      pillar,
      contentType,
      objective,
      format,
      topic: topic.trim(),
      hook: hook.trim(),
    };
    onSave(post, date);
  }

  const allPillarOptions = [
    ...pillars.map(p => p.title),
    ...(pillars.some(p => p.title === 'General') ? [] : ['General']),
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl shadow-soft-lg max-w-lg w-full max-h-[90vh] overflow-y-auto pointer-events-auto">

          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-sage/8 px-6 pt-5 pb-4 rounded-t-3xl z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Plus className="w-4 h-4 text-sage" />
                <span className="font-serif text-lg text-sage">New Post</span>
              </div>
              <span className="text-xs text-sage/45">{formattedDate}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sage/30 hover:text-sage/60 hover:bg-sage/5 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {outsidePlan ? (
              <div className="text-center py-6">
                <p className="text-sage/60 text-sm mb-1">This date is outside your current 4-week plan.</p>
                <p className="text-sage/40 text-xs">Navigate back to a planned month, or regenerate to extend.</p>
              </div>
            ) : (
              <div className="space-y-5">

                {/* Pillar */}
                <div>
                  <label className="block text-[11px] font-semibold text-sage/50 uppercase tracking-wider mb-1.5">
                    Pillar
                    {routineEntry && (
                      <span className="ml-2 text-[10px] font-normal text-sage/35 normal-case tracking-normal">
                        From your {dayName} routine
                      </span>
                    )}
                  </label>
                  <select
                    value={pillar}
                    onChange={e => setPillar(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-2xl border border-sage/20 bg-white text-sage focus:outline-none focus:border-sage/50 transition-colors"
                  >
                    {allPillarOptions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Content type */}
                <div>
                  <label className="block text-[11px] font-semibold text-sage/50 uppercase tracking-wider mb-1.5">
                    Content Type
                    {activeMixPreset && (
                      <span className="ml-2 text-[10px] font-normal text-sage/35 normal-case tracking-normal">
                        Based on your {activeMixPreset} mix
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    {(['Value', 'Authority', 'Sales'] as const).map(type => {
                      const cfg = CONTENT_TYPE_CONFIG[type];
                      const Icon = cfg.icon;
                      const isActive = contentType === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setContentType(type)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-semibold border transition-all ${
                            isActive
                              ? `${cfg.activeBg} ${cfg.activeText} border-transparent shadow-sm`
                              : `${cfg.bg} ${cfg.text} border-transparent hover:opacity-80`
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Format + Objective */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-sage/50 uppercase tracking-wider mb-1.5">Format</label>
                    <select
                      value={format}
                      onChange={e => setFormat(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-2xl border border-sage/20 bg-white text-sage focus:outline-none focus:border-sage/50"
                    >
                      {FORMATS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-sage/50 uppercase tracking-wider mb-1.5">Objective</label>
                    <select
                      value={objective}
                      onChange={e => setObjective(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-2xl border border-sage/20 bg-white text-sage focus:outline-none focus:border-sage/50"
                    >
                      {OBJECTIVES.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                {/* Topic */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-sage/50 uppercase tracking-wider">Topic</label>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex items-center gap-1.5 px-3 py-1 bg-dusty-rose/10 hover:bg-dusty-rose/20 text-dusty-rose text-[11px] font-semibold rounded-xl transition-colors disabled:opacity-60"
                    >
                      {isGenerating
                        ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                        : <><Sparkles className="w-3 h-3" /> Generate with AI</>
                      }
                    </button>
                  </div>
                  <textarea
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    rows={2}
                    placeholder="e.g. 3 signs your morning routine is sabotaging your energy"
                    className="w-full px-3 py-2.5 text-sm rounded-2xl border border-sage/20 bg-white text-sage placeholder-sage/30 focus:outline-none focus:border-sage/50 resize-none"
                  />
                </div>

                {/* Hook */}
                <div>
                  <label className="block text-[11px] font-semibold text-sage/50 uppercase tracking-wider mb-1.5">
                    Hook <span className="text-sage/30 font-normal normal-case tracking-normal">— opening line</span>
                  </label>
                  <textarea
                    value={hook}
                    onChange={e => setHook(e.target.value)}
                    rows={2}
                    placeholder="e.g. Nobody talks about this but..."
                    className="w-full px-3 py-2.5 text-sm rounded-2xl border border-sage/20 bg-white text-sage placeholder-sage/30 focus:outline-none focus:border-sage/50 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!outsidePlan && (
            <div className="px-6 pb-6">
              <button
                onClick={handleSave}
                disabled={!topic.trim()}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-sage to-sage/80 hover:from-sage/90 hover:to-sage/70 text-cream text-sm font-semibold rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add to Calendar
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
