'use client';

import { useState, useRef, useEffect } from 'react';
import {
  CalendarDays, Loader2, RefreshCcw, Sparkles, BookOpen, TrendingUp,
  ShoppingBag, ChevronLeft, ChevronRight, FolderOpen, X, ExternalLink, Settings2, Plus,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { Project } from '@/app/actions/projects';
import { PostDetailModal } from './PostDetailModal';
import { CreatePostModal } from './CreatePostModal';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DayRoutine {
  day: string;
  pillar: string;
  vibe: string;
}

interface TrendItem {
  id: string;
  title: string;
  description: string;
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
  start_date?: string;
  routine?: DayRoutine[];
}

interface Props {
  userId: string;
  pillars: { title: string; description: string }[];
  objectives: string[];
  nicheContext: string;
  existingPlan: EditorialPlan | null;
  projects: Project[];
  recentTrends: TrendItem[];
  hideControls?: boolean;
  initialMonth?: { year: number; month: number };
  openSettings?: boolean;
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

const CADENCE_DAYS: Record<number, string[]> = {
  3: ['Monday', 'Wednesday', 'Friday'],
  4: ['Monday', 'Tuesday', 'Thursday', 'Saturday'],
  5: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'],
  7: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};

const CONTENT_TYPE_STYLES: Record<string, { bg: string; text: string; chip: string; icon: LucideIcon }> = {
  Value:     { bg: 'bg-sage/10',       text: 'text-sage',       chip: 'bg-sage/10 text-sage hover:bg-sage/20',                      icon: BookOpen },
  Authority: { bg: 'bg-blue-50',       text: 'text-blue-700',   chip: 'bg-blue-50 text-blue-700 hover:bg-blue-100',                  icon: TrendingUp },
  Sales:     { bg: 'bg-dusty-rose/10', text: 'text-dusty-rose', chip: 'bg-dusty-rose/10 text-dusty-rose hover:bg-dusty-rose/20',     icon: ShoppingBag },
};

const MACRO_EVENTS = [
  { name: "New Year's Day",            emoji: '🎊', month: 1,  day: 1  },
  { name: "Valentine's Day",           emoji: '💌', month: 2,  day: 14 },
  { name: "International Women's Day", emoji: '💜', month: 3,  day: 8  },
  { name: 'Earth Day',                 emoji: '🌍', month: 4,  day: 22 },
  { name: "Mother's Day",              emoji: '💐', month: 5,  day: 11 },
  { name: "Father's Day",              emoji: '👨', month: 6,  day: 15 },
  { name: 'World Mental Health Day',   emoji: '🧠', month: 10, day: 10 },
  { name: 'Halloween',                 emoji: '🎃', month: 10, day: 31 },
  { name: 'Black Friday',              emoji: '🛍️', month: 11, day: 28 },
  { name: 'Christmas',                 emoji: '🎄', month: 12, day: 25 },
  { name: "New Year's Eve",            emoji: '🥂', month: 12, day: 31 },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const VIBES = ['Educational', 'Growth', 'Community', 'Chill', 'Sales', 'Inspirational'];
const VIBE_CYCLE = ['Growth', 'Educational', 'Community', 'Chill', 'Educational', 'Growth', 'Chill'];
const DAY_OFFSET: Record<string, number> = {
  Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6,
};
const DAY_NAMES_ORDERED = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse a "YYYY-MM-DD" string as a LOCAL date (avoids UTC-midnight timezone shift). */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Format a Date as "YYYY-MM-DD" using LOCAL date parts (not UTC). */
function localDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function suggestRoutine(pillars: { title: string }[], days: string[]): DayRoutine[] {
  return days.map((day, i) => ({
    day,
    pillar: pillars[i % Math.max(pillars.length, 1)]?.title || 'General',
    vibe: VIBE_CYCLE[i % VIBE_CYCLE.length],
  }));
}

function computePostDate(startDate: string, weekIdx: number, dayName: string): Date {
  const base = parseLocalDate(startDate);
  base.setDate(base.getDate() + weekIdx * 7 + (DAY_OFFSET[dayName] ?? 0));
  return base;
}

function findEventsOnDate(date: Date) {
  return MACRO_EVENTS.filter(ev => ev.month - 1 === date.getMonth() && ev.day === date.getDate());
}

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function buildDatePostMap(plan: EditorialPlan) {
  const map = new Map<string, { post: PostSlot; weekIdx: number; postIdx: number }[]>();
  if (!plan.start_date) return map;
  plan.weeks.forEach((week, wi) => {
    week.posts.forEach((post, pi) => {
      const date = computePostDate(plan.start_date!, wi, post.day);
      const key = localDateStr(date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ post, weekIdx: wi, postIdx: pi });
    });
  });
  return map;
}

function mapTrendsToDateMap(trends: TrendItem[], plan: EditorialPlan): Map<string, TrendItem> {
  const result = new Map<string, TrendItem>();
  if (!plan.start_date) return result;
  const count = Math.min(trends.length, plan.weeks.length);
  for (let ti = 0; ti < count; ti++) {
    const firstPost = plan.weeks[ti]?.posts[0];
    if (firstPost) {
      const date = computePostDate(plan.start_date, ti, firstPost.day);
      result.set(localDateStr(date), trends[ti]);
    }
  }
  return result;
}

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
      <div className="flex items-center gap-1.5 mt-3">
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
    <div ref={ref} className="relative mt-3">
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

export function EditorialCalendar({ userId, pillars, objectives, nicheContext, existingPlan, projects, recentTrends, hideControls = false, initialMonth, openSettings = false }: Props) {
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
  const [generatingPost, setGeneratingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'monthly' | 'routine'>('monthly');
  const [viewMonth, setViewMonth] = useState<{ year: number; month: number }>(() => {
    if (initialMonth) return initialMonth;
    const d = existingPlan?.start_date ? parseLocalDate(existingPlan.start_date) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [showControls, setShowControls] = useState(openSettings || !existingPlan);
  const [modalPost, setModalPost] = useState<{
    post: PostSlot; weekIdx: number; postIdx: number; dateStr: string;
  } | null>(null);
  const [routine, setRoutine] = useState<DayRoutine[]>(
    () => existingPlan?.routine ?? suggestRoutine(pillars, CADENCE_DAYS[existingPlan?.cadence ?? 4] ?? [])
  );
  const [dismissedTrends, setDismissedTrends] = useState<Set<string>>(new Set());
  const [newPostDate, setNewPostDate] = useState<Date | null>(null);
  const [dragItem, setDragItem] = useState<{ weekIdx: number; postIdx: number } | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  // Derived values
  const datePostMap = plan
    ? buildDatePostMap(plan)
    : new Map<string, { post: PostSlot; weekIdx: number; postIdx: number }[]>();
  const trendDateMap = plan
    ? mapTrendsToDateMap(recentTrends, plan)
    : new Map<string, TrendItem>();
  const calendarDays = getCalendarDays(viewMonth.year, viewMonth.month);
  const routineChanged = JSON.stringify(routine) !== JSON.stringify(plan?.routine ?? []);
  const monthKey = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}`;
  const monthHasPosts = [...datePostMap.keys()].some(k => k.startsWith(monthKey));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/editorial/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cadence, mix, routine, targetYear: viewMonth.year, targetMonth: viewMonth.month }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate plan');
      setPlan(data.plan);
      setModalPost(null);
      setShowControls(false);
      setViewMode('monthly');
      if (data.plan.start_date) {
        const d = parseLocalDate(data.plan.start_date);
        setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
      }
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
          posts: w.posts.map((p, pIdx) => pIdx !== pi ? p : { ...p, project_id: projectId }),
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

  const handleAddEventPost = async (event: typeof MACRO_EVENTS[0], date: Date) => {
    if (!plan?.start_date || generatingPost) return;
    const startMs = parseLocalDate(plan.start_date).getTime();
    const diffDays = Math.floor((date.getTime() - startMs) / 86400_000);
    const weekIdx = Math.floor(diffDays / 7);
    if (weekIdx < 0 || weekIdx >= plan.weeks.length) return;

    const dayName = DAY_NAMES_ORDERED[date.getDay()];
    setGeneratingPost(true);
    try {
      const res = await fetch('/api/editorial/event-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName: event.name, nicheContext }),
      });
      const data = await res.json();
      if (!res.ok) return;

      const newPost: PostSlot = {
        day: dayName,
        pillar: pillars[0]?.title || 'General',
        contentType: (data.contentType as PostSlot['contentType']) || 'Value',
        objective: data.objective || 'Visibility',
        format: data.format || 'Reel',
        topic: data.topic,
        hook: data.hook,
        event_tag: `${event.emoji} ${event.name}`,
      };
      const updated: EditorialPlan = {
        ...plan,
        weeks: plan.weeks.map((w, wi) =>
          wi !== weekIdx ? w : { ...w, posts: [...w.posts, newPost] }
        ),
      };
      setPlan(updated);
      await fetch('/api/editorial/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: updated }),
      });
    } catch (err) {
      console.error('Event post generation failed:', err);
    } finally {
      setGeneratingPost(false);
    }
  };

  const handleAcceptTrend = async (
    trend: TrendItem,
    weekIdx: number,
    postIdx: number,
    day: string,
  ) => {
    if (!plan || generatingPost) return;
    setGeneratingPost(true);
    try {
      const res = await fetch('/api/editorial/event-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trendTitle: trend.title,
          trendDescription: trend.description,
          nicheContext,
        }),
      });
      const data = await res.json();
      if (!res.ok) return;

      const existing = plan.weeks[weekIdx]?.posts[postIdx];
      const updatedPost: PostSlot = {
        day,
        pillar: existing?.pillar || pillars[0]?.title || 'General',
        contentType: (data.contentType as PostSlot['contentType']) || existing?.contentType || 'Value',
        objective: data.objective || existing?.objective || 'Visibility',
        format: data.format || existing?.format || 'Reel',
        topic: data.topic,
        hook: data.hook,
        project_id: existing?.project_id,
        is_suggestion: true,
        trend_id: trend.id,
      };
      const updated: EditorialPlan = {
        ...plan,
        weeks: plan.weeks.map((w, wi) =>
          wi !== weekIdx ? w : {
            ...w,
            posts: w.posts.map((p, pi) => pi !== postIdx ? p : updatedPost),
          }
        ),
      };
      setPlan(updated);
      setDismissedTrends(s => new Set(s).add(trend.id));
      if (modalPost?.weekIdx === weekIdx && modalPost.postIdx === postIdx) {
        setModalPost(null);
      }
      await fetch('/api/editorial/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: updated }),
      });
    } catch (err) {
      console.error('Trend acceptance failed:', err);
    } finally {
      setGeneratingPost(false);
    }
  };

  const handleSaveNewPost = async (post: PostSlot, date: Date) => {
    if (!plan?.start_date) return;
    const startMs = parseLocalDate(plan.start_date).getTime();
    const diffDays = Math.floor((date.getTime() - startMs) / 86400_000);
    const weekIdx = Math.floor(diffDays / 7);
    if (weekIdx < 0 || weekIdx >= plan.weeks.length) return;

    const updated: EditorialPlan = {
      ...plan,
      weeks: plan.weeks.map((w, wi) =>
        wi !== weekIdx ? w : { ...w, posts: [...w.posts, post] }
      ),
    };
    setPlan(updated);
    setNewPostDate(null);
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

  const handleDropPost = async (targetDate: Date) => {
    if (!dragItem || !plan?.start_date) return;
    const { weekIdx: oldWi, postIdx: oldPi } = dragItem;

    const startMs = parseLocalDate(plan.start_date).getTime();
    const diffDays = Math.floor((targetDate.getTime() - startMs) / 86400_000);
    const newWi = Math.floor(diffDays / 7);
    const newDay = DAY_NAMES_ORDERED[targetDate.getDay()];

    if (newWi < 0 || newWi >= plan.weeks.length) return;
    const movedPost = plan.weeks[oldWi]?.posts[oldPi];
    if (!movedPost) return;
    if (newWi === oldWi && movedPost.day === newDay) return;

    const updatedPost = { ...movedPost, day: newDay };
    const updated: EditorialPlan = {
      ...plan,
      weeks: plan.weeks.map((w, wi) => {
        if (wi === oldWi && wi === newWi) {
          return { ...w, posts: w.posts.map((p, pi) => pi === oldPi ? updatedPost : p) };
        }
        if (wi === oldWi) return { ...w, posts: w.posts.filter((_, pi) => pi !== oldPi) };
        if (wi === newWi) return { ...w, posts: [...w.posts, updatedPost] };
        return w;
      }),
    };

    setPlan(updated);
    setDragItem(null);
    setDragOverDate(null);
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
    <div className="space-y-4">
      {/* Compact top bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Title — dashboard mode only */}
        {hideControls && (
          <h2 className="font-serif text-lg text-sage">My Content Calendar</h2>
        )}

        {/* View toggle — hidden in dashboard mode */}
        {!hideControls && (
          <div className="flex gap-1 p-1 bg-white border border-warm-border rounded-xl shadow-soft">
            {(['monthly', 'routine'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  viewMode === mode ? 'bg-sage text-cream shadow-sm' : 'text-sage/50 hover:text-sage'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        )}

        {/* Current settings summary — editorial page only */}
        {!hideControls && plan && !showControls && (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1.5 bg-white border border-warm-border rounded-xl text-xs text-sage/60 shadow-soft">
              {cadence}×/week
            </span>
            <span className="px-2.5 py-1.5 bg-white border border-warm-border rounded-xl text-xs text-sage/60 shadow-soft">
              {mix.value}% V · {mix.authority}% A · {mix.sales}% S
            </span>
          </div>
        )}

        {!hideControls && (
          <button
            onClick={() => setShowControls(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-warm-border rounded-xl text-xs text-sage/50 hover:text-sage hover:border-sage/30 transition-colors shadow-soft"
          >
            <Settings2 className="w-3.5 h-3.5" />
            {showControls ? 'Hide settings' : 'Settings'}
          </button>
        )}

        {isSaving && (
          <span className="flex items-center gap-1.5 text-[11px] text-sage/40">
            <Loader2 className="w-3 h-3 animate-spin" /> Saving…
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {!hideControls && error && <p className="text-xs text-red-500">{error}</p>}
          {hideControls ? (
            <Link
              href="/editorial"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sage to-sage/80 hover:from-sage/90 hover:to-sage/70 text-cream text-xs font-semibold rounded-xl transition-all shadow-sm"
              title="Adjust cadence, content mix and regenerate your plan on the Editorial page"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Configure &amp; Generate
            </Link>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sage to-sage/80 hover:from-sage/90 hover:to-sage/70 text-cream text-xs font-medium rounded-xl transition-all disabled:opacity-60 shadow-sm"
            >
              {isGenerating ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</>
              ) : plan ? (
                <><RefreshCcw className="w-3.5 h-3.5" /> Generate</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" /> Generate My Month</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded settings panel */}
      {showControls && !hideControls && (
        <div className="bg-white border border-warm-border rounded-3xl p-5 shadow-soft">
          {noPillars && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-2xl">
              <p className="text-sm text-amber-700">
                No content pillars found. Complete your{' '}
                <a href="/onboarding" className="underline font-medium">onboarding</a> or set pillars in{' '}
                <a href="/profile" className="underline font-medium">Settings</a> first.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-semibold text-sage/50 uppercase tracking-wider mb-2">Posting Cadence</p>
              <div className="flex flex-wrap gap-2">
                {CADENCE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setCadence(opt.value); setRoutine(suggestRoutine(pillars, CADENCE_DAYS[opt.value] ?? [])); }}
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
        </div>
      )}

      {/* Routine view */}
      {viewMode === 'routine' && (
        <div className="bg-white border border-warm-border rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs text-sage/50">
              OwnVoice suggested this routine based on your pillars — edit it, then regenerate to apply.
            </p>
            {routineChanged && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="ml-4 flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-sage hover:bg-sage/90 text-cream text-sm font-medium rounded-xl disabled:opacity-60"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Regenerate with this routine</>
                )}
              </button>
            )}
          </div>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${Math.max(routine.length, 1)}, minmax(0, 1fr))` }}
          >
            {routine.map((r, i) => (
              <div key={r.day} className="flex flex-col gap-3 p-4 bg-sage/[0.03] border border-sage/10 rounded-2xl">
                <p className="font-serif text-lg text-sage">{r.day}</p>
                <div>
                  <p className="text-[10px] text-sage/40 uppercase font-semibold mb-1">Pillar</p>
                  <select
                    value={r.pillar}
                    onChange={e => setRoutine(prev => prev.map((x, j) => j === i ? { ...x, pillar: e.target.value } : x))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-sage/20 bg-white text-sage focus:outline-none focus:border-sage"
                  >
                    {pillars.map(p => <option key={p.title} value={p.title}>{p.title}</option>)}
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <p className="text-[10px] text-sage/40 uppercase font-semibold mb-1">Vibe</p>
                  <select
                    value={r.vibe}
                    onChange={e => setRoutine(prev => prev.map((x, j) => j === i ? { ...x, vibe: e.target.value } : x))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-sage/20 bg-white text-sage focus:outline-none focus:border-sage"
                  >
                    {VIBES.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                {plan && (
                  <div className="mt-1 space-y-1">
                    {plan.weeks.map(w => {
                      const p = w.posts.find(post => post.day === r.day);
                      return p ? (
                        <p key={w.week} className="text-[10px] text-sage/40 leading-snug">
                          W{w.week}: {p.topic}
                        </p>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly calendar view */}
      {viewMode === 'monthly' && (
        <div>
          {/* Strategic notes */}
          {plan?.strategic_notes && !hideControls && (
            <div className="mb-5 bg-gradient-to-br from-sage/5 to-dusty-rose/5 border border-sage/10 rounded-3xl p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-dusty-rose flex-shrink-0 mt-0.5" />
                <p className="text-sm text-sage/80 leading-relaxed italic line-clamp-2">{plan.strategic_notes}</p>
              </div>
              <p className="text-[10px] text-sage/30 mt-2">
                Generated {new Date(plan.generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}{plan.cadence}×/week · {plan.mix.value}/{plan.mix.authority}/{plan.mix.sales} mix
              </p>
            </div>
          )}
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewMonth(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 })}
              className="w-9 h-9 rounded-xl border border-sage/15 flex items-center justify-center text-sage/40 hover:text-sage hover:border-sage/30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-serif text-2xl text-sage">
              {MONTH_NAMES[viewMonth.month]} {viewMonth.year}
            </h3>
            <button
              onClick={() => setViewMonth(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 })}
              className="w-9 h-9 rounded-xl border border-sage/15 flex items-center justify-center text-sage/40 hover:text-sage hover:border-sage/30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="bg-white border border-warm-border rounded-3xl overflow-hidden shadow-soft">
            {/* Day-of-week header */}
            <div className="grid grid-cols-7 bg-sage/[0.02] border-b border-sage/8">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                <div
                  key={d}
                  className={`py-3 text-center text-[11px] font-semibold text-sage/40 uppercase tracking-wider ${i < 6 ? 'border-r border-sage/8' : ''}`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Date cells */}
            <div className="grid grid-cols-7">
              {calendarDays.map((date, i) => {
                const isLastInRow = i % 7 === 6;

                if (!date) {
                  return (
                    <div
                      key={`empty-${i}`}
                      className={`min-h-[90px] bg-sage/[0.01] border-b border-sage/8 ${!isLastInRow ? 'border-r border-sage/8' : ''}`}
                    />
                  );
                }

                const dateStr = localDateStr(date);
                const postsOnDate = datePostMap.get(dateStr) || [];
                const macroEvents = findEventsOnDate(date);
                const trendForDate = trendDateMap.get(dateStr);
                const isToday = date.getTime() === today.getTime();
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                return (
                  <div
                    key={dateStr}
                    className={`group min-h-[90px] p-1.5 border-b border-sage/8 ${!isLastInRow ? 'border-r border-sage/8' : ''} ${isWeekend ? 'bg-sage/[0.012]' : ''} ${dragOverDate === dateStr ? 'ring-2 ring-inset ring-sage/30 bg-sage/[0.04]' : ''} transition-colors`}
                    onDragOver={!hideControls && plan ? (e) => { e.preventDefault(); setDragOverDate(dateStr); } : undefined}
                    onDragLeave={!hideControls ? () => setDragOverDate(null) : undefined}
                    onDrop={!hideControls && plan ? (e) => { e.preventDefault(); handleDropPost(date); } : undefined}
                  >
                    {/* Day number */}
                    <div className="mb-1">
                      <span
                        className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday
                            ? 'bg-sage text-cream'
                            : 'text-sage/60'
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>

                    {/* Macro event badges */}
                    {macroEvents.map(ev => (
                      <button
                        key={ev.name}
                        onClick={() => handleAddEventPost(ev, date)}
                        disabled={generatingPost}
                        title={`Generate a ${ev.name} post`}
                        className="w-full text-left flex items-center gap-1 px-1.5 py-0.5 mb-1 bg-amber-50 border border-amber-100 rounded text-[10px] text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                      >
                        {generatingPost
                          ? <Loader2 className="w-2.5 h-2.5 animate-spin shrink-0" />
                          : <span className="shrink-0">{ev.emoji}</span>
                        }
                        <span className="truncate">{ev.name}</span>
                      </button>
                    ))}

                    {/* Post chips */}
                    {postsOnDate.slice(0, 3).map(({ post, weekIdx: wi, postIdx: pi }) => {
                      const style = CONTENT_TYPE_STYLES[post.contentType] ?? CONTENT_TYPE_STYLES.Value;
                      return (
                        <button
                          key={`${wi}-${pi}`}
                          onClick={() => setModalPost({ post, weekIdx: wi, postIdx: pi, dateStr })}
                          draggable={!hideControls}
                          onDragStart={!hideControls ? (e) => {
                            setDragItem({ weekIdx: wi, postIdx: pi });
                            e.dataTransfer.effectAllowed = 'move';
                          } : undefined}
                          onDragEnd={() => { setDragItem(null); setDragOverDate(null); }}
                          className={`w-full text-left px-1.5 py-0.5 mb-0.5 rounded text-[10px] truncate transition-colors ${style.chip} ${!hideControls ? 'cursor-grab active:cursor-grabbing' : ''} ${dragItem?.weekIdx === wi && dragItem?.postIdx === pi ? 'opacity-40' : ''}`}
                        >
                          {post.event_tag ? `${post.event_tag.split(' ')[0]} ` : ''}{post.topic}
                        </button>
                      );
                    })}
                    {postsOnDate.length > 3 && (
                      <span className="text-[9px] text-sage/40 pl-1.5">
                        +{postsOnDate.length - 3} more
                      </span>
                    )}

                    {/* Niche trend suggestion */}
                    {trendForDate && !dismissedTrends.has(trendForDate.id) && (
                      <div className="mt-1 p-1.5 bg-dusty-rose/5 border border-dusty-rose/10 rounded">
                        <div className="flex items-start gap-1 mb-1">
                          <span className="text-[9px] text-dusty-rose font-bold flex-1 leading-tight">
                            ↑ {trendForDate.title}
                          </span>
                          <button
                            onClick={() => setDismissedTrends(s => new Set(s).add(trendForDate.id))}
                            className="text-sage/30 hover:text-sage/60 flex-shrink-0"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        {postsOnDate[0] && (
                          <button
                            onClick={() => handleAcceptTrend(
                              trendForDate,
                              postsOnDate[0].weekIdx,
                              postsOnDate[0].postIdx,
                              postsOnDate[0].post.day,
                            )}
                            disabled={generatingPost}
                            className="text-[9px] text-dusty-rose font-semibold hover:underline disabled:opacity-50"
                          >
                            {generatingPost ? 'Adding…' : 'Add to calendar ✓'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Add post button — visible on cell hover */}
                    {plan && (
                      <button
                        onClick={() => setNewPostDate(date)}
                        title={`Add post on ${dateStr}`}
                        className="mt-0.5 w-full flex items-center justify-center py-0.5 rounded opacity-0 group-hover:opacity-100 text-sage/30 hover:text-sage hover:bg-sage/5 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Empty month CTA */}
          {plan && !monthHasPosts && !isGenerating && (
            <div className="mt-4 text-center p-8 border border-dashed border-sage/20 rounded-3xl">
              <p className="text-sage/50 text-sm mb-3">
                No posts scheduled for {MONTH_NAMES[viewMonth.month]} {viewMonth.year}.
              </p>
              {hideControls ? (
                <Link
                  href={`/editorial?month=${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}&openSettings=1`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage hover:bg-sage/90 text-cream text-sm font-medium rounded-xl transition-colors"
                >
                  <Settings2 className="w-4 h-4" />
                  Configure &amp; generate for {MONTH_NAMES[viewMonth.month]}
                </Link>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage hover:bg-sage/90 text-cream text-sm font-medium rounded-xl transition-colors disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4" />
                  Extend plan to cover this month
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* Empty state */}
      {!plan && !isGenerating && viewMode === 'monthly' && (
        <div className="bg-white border border-warm-border rounded-3xl p-10 shadow-soft text-center">
          <CalendarDays className="w-10 h-10 text-sage/20 mx-auto mb-4" />
          <h3 className="font-serif text-xl text-sage mb-2">No plan yet</h3>
          <p className="text-sm text-sage/50 max-w-sm mx-auto">
            Choose your cadence and content mix above, then hit{' '}
            <strong className="font-semibold text-sage/70">Generate My Month</strong> to get a tailored 4-week editorial calendar.
          </p>
        </div>
      )}

      {/* Post detail modal */}
      {modalPost && (
        <PostDetailModal
          post={modalPost.post}
          weekIdx={modalPost.weekIdx}
          postIdx={modalPost.postIdx}
          dateStr={modalPost.dateStr}
          nicheContext={nicheContext}
          projects={projects}
          onClose={() => setModalPost(null)}
          onLinkProject={handleLinkProject}
        />
      )}

      {/* Create post modal */}
      {newPostDate && plan && (
        <CreatePostModal
          date={newPostDate}
          plan={plan}
          routine={routine}
          pillars={pillars}
          mix={mix}
          activeMixPreset={activeMixPreset}
          nicheContext={nicheContext}
          onClose={() => setNewPostDate(null)}
          onSave={handleSaveNewPost}
        />
      )}
    </div>
  );
}
