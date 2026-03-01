'use client';

import { useState, useRef, useEffect } from 'react';
import {
  CalendarDays, Loader2, RefreshCcw, Sparkles, BookOpen, TrendingUp,
  ShoppingBag, ChevronLeft, ChevronRight, FolderOpen, X, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import type { Project } from '@/app/actions/projects';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PostSlot {
  day: string;
  pillar: string;
  contentType: 'Value' | 'Authority' | 'Sales';
  objective: string;
  format: string;
  topic: string;
  hook: string;
  project_id?: string | null;
}

interface WeekPlan {
  week: 1 | 2 | 3 | 4;
  theme: string;
  posts: PostSlot[];
}

interface EditorialPlan {
  generated_at: string;
  cadence: number;
  mix: { value: number; authority: number; sales: number };
  weeks: WeekPlan[];
  strategic_notes: string;
}

interface Props {
  userId: string;
  pillars: { title: string; description: string }[];
  objectives: string[];
  nicheContext: string;
  existingPlan: EditorialPlan | null;
  projects: Project[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CADENCE_OPTIONS = [
  { value: 3, label: '3×/week' },
  { value: 4, label: '4×/week' },
  { value: 5, label: '5×/week' },
  { value: 7, label: 'Daily' },
];

const MIX_PRESETS = [
  { label: 'Growth',    description: 'Audience first', value: { value: 70, authority: 20, sales: 10 } },
  { label: 'Balanced',  description: 'Steady engine',  value: { value: 50, authority: 30, sales: 20 } },
  { label: 'Launch',    description: 'Offer push',      value: { value: 35, authority: 25, sales: 40 } },
  { label: 'Authority', description: 'Expert-led',      value: { value: 30, authority: 60, sales: 10 } },
];

const CONTENT_TYPE_STYLES: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  Value:     { bg: 'bg-sage/10',       text: 'text-sage',       icon: BookOpen },
  Authority: { bg: 'bg-blue-50',       text: 'text-blue-700',   icon: TrendingUp },
  Sales:     { bg: 'bg-dusty-rose/10', text: 'text-dusty-rose', icon: ShoppingBag },
};

const WEEK_COLORS = [
  { card: 'border-sage/20',        badge: 'bg-sage/10 text-sage',           tab: 'bg-sage text-cream' },
  { card: 'border-blue-100',       badge: 'bg-blue-50 text-blue-700',       tab: 'bg-blue-600 text-white' },
  { card: 'border-amber-100',      badge: 'bg-amber-50 text-amber-700',     tab: 'bg-amber-500 text-white' },
  { card: 'border-dusty-rose/20',  badge: 'bg-dusty-rose/10 text-dusty-rose', tab: 'bg-dusty-rose text-white' },
];

// ─── Project Picker ───────────────────────────────────────────────────────────

function ProjectPicker({
  projects,
  linkedProjectId,
  onLink,
  onUnlink,
}: {
  projects: Project[];
  linkedProjectId?: string | null;
  onLink: (id: string) => void;
  onUnlink: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const linked = linkedProjectId ? projects.find(p => p.id === linkedProjectId) : null;

  if (linked) {
    return (
      <div className="flex items-center gap-1.5 mt-2">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-sage/8 border border-sage/15 rounded-lg flex-1 min-w-0">
          <FolderOpen className="w-3 h-3 text-sage/50 shrink-0" />
          <span className="text-[11px] text-sage font-medium truncate">{linked.title}</span>
          {linked.workflow_id && (
            <Link
              href={`/lab/workflow/${linked.workflow_id}`}
              className="ml-auto shrink-0 text-sage/40 hover:text-sage transition-colors"
              title="Open workflow"
            >
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
        <button
          onClick={onUnlink}
          className="p-1 rounded-lg text-sage/30 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Unlink project"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative mt-2">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-sage/40 border border-dashed border-sage/20 rounded-lg hover:border-sage/40 hover:text-sage/60 transition-colors w-full"
      >
        <FolderOpen className="w-3 h-3" />
        Link a project
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white border border-warm-border rounded-2xl shadow-soft overflow-hidden">
          {projects.length === 0 ? (
            <div className="p-3 text-center">
              <p className="text-xs text-sage/50 mb-2">No projects yet</p>
              <Link href="/projects" className="text-xs text-dusty-rose underline">Create a project →</Link>
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto py-1.5">
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => { onLink(p.id); setOpen(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-sage/5 transition-colors flex items-start gap-2"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-sage/40 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-sage truncate">{p.title}</p>
                    <p className="text-[10px] text-sage/40 capitalize">{p.current_phase} · {p.content_type.replace('_', ' ')}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EditorialCalendar({ userId, pillars, objectives, nicheContext, existingPlan, projects }: Props) {
  const [cadence, setCadence] = useState(existingPlan?.cadence ?? 4);
  const [mix, setMix] = useState(existingPlan?.mix ?? { value: 50, authority: 30, sales: 20 });
  const [activeMixPreset, setActiveMixPreset] = useState<string | null>(
    existingPlan
      ? (MIX_PRESETS.find(p => JSON.stringify(p.value) === JSON.stringify(existingPlan.mix))?.label ?? null)
      : 'Balanced'
  );
  const [plan, setPlan] = useState<EditorialPlan | null>(existingPlan);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeWeek, setActiveWeek] = useState(0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/editorial/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cadence, mix }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate plan');
      setPlan(data.plan);
      setActiveWeek(0);
    } catch (err: any) {
      setError(err.message || 'Failed to generate plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMixPreset = (preset: typeof MIX_PRESETS[0]) => {
    setMix(preset.value);
    setActiveMixPreset(preset.label);
  };

  const handleLinkProject = async (wi: number, pi: number, projectId: string | null) => {
    if (!plan) return;
    const updated: EditorialPlan = {
      ...plan,
      weeks: plan.weeks.map((w, wIdx) =>
        wIdx !== wi ? w : {
          ...w,
          posts: w.posts.map((p, pIdx) =>
            pIdx !== pi ? p : { ...p, project_id: projectId }
          ),
        }
      ),
    };
    setPlan(updated);
    setIsSaving(true);
    try {
      await fetch('/api/editorial/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: updated }),
      });
    } catch {}
    setIsSaving(false);
  };

  const noPillars = pillars.length === 0;

  return (
    <div className="space-y-6">
      {/* Controls card */}
      <div className="bg-white border border-warm-border rounded-3xl p-6 shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-sage" />
            <h2 className="font-serif text-xl text-sage">Configure Your Month</h2>
          </div>
          {isSaving && (
            <span className="flex items-center gap-1.5 text-[11px] text-sage/40">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving…
            </span>
          )}
        </div>

        {noPillars && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-2xl">
            <p className="text-sm text-amber-700">
              No content pillars found. Complete your{' '}
              <a href="/onboarding" className="underline font-medium">onboarding</a> or set pillars in{' '}
              <a href="/profile" className="underline font-medium">Settings</a> first.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cadence */}
          <div>
            <p className="text-xs font-semibold text-sage/50 uppercase tracking-wider mb-2">Posting Cadence</p>
            <div className="flex flex-wrap gap-2">
              {CADENCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setCadence(opt.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                    cadence === opt.value
                      ? 'bg-sage text-cream border-sage shadow-sm'
                      : 'bg-transparent text-sage/60 border-sage/20 hover:border-sage/40 hover:text-sage'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mix presets */}
          <div>
            <p className="text-xs font-semibold text-sage/50 uppercase tracking-wider mb-2">Content Mix</p>
            <div className="flex flex-wrap gap-2">
              {MIX_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handleMixPreset(preset)}
                  title={`${preset.value.value}% Value · ${preset.value.authority}% Authority · ${preset.value.sales}% Sales`}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                    activeMixPreset === preset.label
                      ? 'bg-dusty-rose text-white border-dusty-rose shadow-sm'
                      : 'bg-transparent text-sage/60 border-sage/20 hover:border-sage/40 hover:text-sage'
                  }`}
                >
                  {preset.label}
                  <span className="ml-1.5 text-[10px] opacity-70">{preset.description}</span>
                </button>
              ))}
            </div>
            {/* Mix bar */}
            <div className="mt-3 flex rounded-full overflow-hidden h-1.5">
              <div className="bg-sage transition-all duration-300" style={{ width: `${mix.value}%` }} />
              <div className="bg-blue-400 transition-all duration-300" style={{ width: `${mix.authority}%` }} />
              <div className="bg-dusty-rose transition-all duration-300" style={{ width: `${mix.sales}%` }} />
            </div>
            <div className="mt-1.5 flex gap-3 text-[10px] text-sage/50">
              <span><span className="inline-block w-1.5 h-1.5 bg-sage rounded-full mr-1 align-middle" />{mix.value}% Value</span>
              <span><span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mr-1 align-middle" />{mix.authority}% Authority</span>
              <span><span className="inline-block w-1.5 h-1.5 bg-dusty-rose rounded-full mr-1 align-middle" />{mix.sales}% Sales</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-sage/10 flex items-center gap-4">
          {error && <p className="text-xs text-red-500 flex-1">{error}</p>}
          <div className="flex-1" />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sage to-sage/80 hover:from-sage/90 hover:to-sage/70 text-cream text-sm font-medium rounded-xl transition-all disabled:opacity-60 shadow-sm"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
            ) : plan ? (
              <><RefreshCcw className="w-4 h-4" /> Regenerate Plan</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate My Month</>
            )}
          </button>
        </div>
      </div>

      {/* Plan — Carousel */}
      {plan && (
        <div>
          {/* Strategic notes */}
          {plan.strategic_notes && (
            <div className="mb-5 bg-gradient-to-br from-sage/5 to-dusty-rose/5 border border-sage/10 rounded-3xl p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-dusty-rose flex-shrink-0 mt-0.5" />
                <p className="text-sm text-sage/80 leading-relaxed italic">{plan.strategic_notes}</p>
              </div>
              <p className="text-[10px] text-sage/30 mt-2">
                Generated {new Date(plan.generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}{plan.cadence}×/week · {plan.mix.value}/{plan.mix.authority}/{plan.mix.sales} mix
              </p>
            </div>
          )}

          {/* Week tabs + nav */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setActiveWeek(w => Math.max(0, w - 1))}
              disabled={activeWeek === 0}
              className="w-8 h-8 rounded-xl border border-sage/15 flex items-center justify-center text-sage/40 hover:text-sage hover:border-sage/30 transition-colors disabled:opacity-20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-2 flex-1">
              {plan.weeks.map((week, wi) => {
                const colors = WEEK_COLORS[wi];
                const isActive = wi === activeWeek;
                return (
                  <button
                    key={week.week}
                    onClick={() => setActiveWeek(wi)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      isActive
                        ? `${colors.tab} border-transparent shadow-sm`
                        : `bg-white ${colors.badge} border-sage/10 hover:border-sage/25`
                    }`}
                  >
                    <span className="block text-[10px] font-bold opacity-70 mb-0.5">WEEK {week.week}</span>
                    <span className="block truncate">{week.theme}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setActiveWeek(w => Math.min(3, w + 1))}
              disabled={activeWeek === 3}
              className="w-8 h-8 rounded-xl border border-sage/15 flex items-center justify-center text-sage/40 hover:text-sage hover:border-sage/30 transition-colors disabled:opacity-20"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Active week card */}
          {plan.weeks[activeWeek] && (() => {
            const week = plan.weeks[activeWeek];
            const colors = WEEK_COLORS[activeWeek];
            return (
              <div className={`bg-white border-2 ${colors.card} rounded-3xl overflow-hidden shadow-soft`}>
                {/* Week header */}
                <div className="px-6 py-4 border-b border-black/5 flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                    Week {week.week} · {week.theme}
                  </span>
                  <span className="ml-auto text-xs text-sage/30">{week.posts.length} posts</span>
                </div>

                {/* Posts */}
                <div className="divide-y divide-sage/5">
                  {week.posts.map((post, pi) => {
                    const typeStyle = CONTENT_TYPE_STYLES[post.contentType] ?? CONTENT_TYPE_STYLES.Value;
                    const TypeIcon = typeStyle.icon;
                    return (
                      <div key={pi} className="px-6 py-5">
                        {/* Top row: day + badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 bg-sage/8 border border-sage/10 rounded-lg text-xs font-semibold text-sage/60">
                            {post.day}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold ${typeStyle.bg} ${typeStyle.text}`}>
                            <TypeIcon className="w-3 h-3" />
                            {post.contentType}
                          </span>
                          <span className="text-xs text-sage/40 font-medium">{post.pillar}</span>
                          <span className="text-[11px] text-sage/30 border border-sage/10 rounded px-1.5 py-0.5">{post.format}</span>
                          <span className="text-[11px] text-sage/30 ml-auto">{post.objective}</span>
                        </div>

                        {/* Topic */}
                        <p className="text-sm font-semibold text-sage leading-snug mb-1.5">{post.topic}</p>

                        {/* Hook */}
                        <p className="text-xs text-sage/50 italic leading-relaxed">"{post.hook}"</p>

                        {/* Project link */}
                        <ProjectPicker
                          projects={projects}
                          linkedProjectId={post.project_id}
                          onLink={(id) => handleLinkProject(activeWeek, pi, id)}
                          onUnlink={() => handleLinkProject(activeWeek, pi, null)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-4">
            {plan.weeks.map((_, wi) => (
              <button
                key={wi}
                onClick={() => setActiveWeek(wi)}
                className={`transition-all rounded-full ${
                  wi === activeWeek ? 'w-5 h-1.5 bg-sage' : 'w-1.5 h-1.5 bg-sage/20'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!plan && !isGenerating && (
        <div className="bg-white border border-warm-border rounded-3xl p-10 shadow-soft text-center">
          <CalendarDays className="w-10 h-10 text-sage/20 mx-auto mb-4" />
          <h3 className="font-serif text-xl text-sage mb-2">No plan yet</h3>
          <p className="text-sm text-sage/50 max-w-sm mx-auto">
            Choose your cadence and content mix above, then hit{' '}
            <strong className="font-semibold text-sage/70">Generate My Month</strong> to get a tailored 4-week editorial calendar.
          </p>
        </div>
      )}
    </div>
  );
}
