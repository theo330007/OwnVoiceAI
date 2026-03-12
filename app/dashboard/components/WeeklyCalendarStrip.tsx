'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { PostDetailModal } from '@/app/editorial/components/PostDetailModal';
import type { Project } from '@/app/actions/projects';

// ─── Types ────────────────────────────────────────────────────────────────────

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
}

interface WeekPlan { posts: PostSlot[]; }

interface EditorialPlan {
  start_date?: string;
  weeks: WeekPlan[];
}

interface Props {
  existingPlan: EditorialPlan | null;
  nicheContext: string;
  projects: Project[];
}

// ─── Styles / helpers ─────────────────────────────────────────────────────────

const TYPE_STYLE: Record<string, { bg: string; text: string }> = {
  Value:     { bg: 'bg-sage/10',       text: 'text-sage' },
  Authority: { bg: 'bg-blue-50',       text: 'text-blue-700' },
  Sales:     { bg: 'bg-dusty-rose/10', text: 'text-dusty-rose' },
};

const DAY_SHORT  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_OFFSET: Record<string, number> = {
  Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6,
};

function parseLocalDate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function localDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function getWeekMonday(date: Date) {
  const d = new Date(date);
  const dow = d.getDay();
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  d.setHours(0, 0, 0, 0);
  return d;
}
function buildDatePostMap(plan: EditorialPlan) {
  const map = new Map<string, { post: PostSlot; weekIdx: number; postIdx: number }[]>();
  if (!plan.start_date) return map;
  plan.weeks.forEach((week, wi) => {
    week.posts.forEach((post, pi) => {
      const base = parseLocalDate(plan.start_date!);
      base.setDate(base.getDate() + wi * 7 + (DAY_OFFSET[post.day] ?? 0));
      const key = localDateStr(base);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ post, weekIdx: wi, postIdx: pi });
    });
  });
  return map;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WeeklyCalendarStrip({ existingPlan, nicheContext, projects }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [weekOffset, setWeekOffset] = useState(0);

  const monday = getWeekMonday(today);
  monday.setDate(monday.getDate() + weekOffset * 7);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const sunday = weekDays[6];
  const weekLabel = (() => {
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === -1) return 'Last Week';
    if (weekOffset === 1) return 'Next Week';
    return `${fmt(monday)} – ${fmt(sunday)}`;
  })();

  const datePostMap = existingPlan ? buildDatePostMap(existingPlan) : new Map<string, { post: PostSlot; weekIdx: number; postIdx: number }[]>();
  const weekHasPosts = weekDays.some(day => (datePostMap.get(localDateStr(day)) ?? []).length > 0);

  const [modalPost, setModalPost] = useState<{
    post: PostSlot; weekIdx: number; postIdx: number; dateStr: string;
  } | null>(null);

  const handleLinkProject = async (weekIdx: number, postIdx: number, projectId: string | null) => {
    if (!existingPlan) return;
    const updated = {
      ...existingPlan,
      weeks: existingPlan.weeks.map((w, wi) =>
        wi !== weekIdx ? w : {
          ...w,
          posts: w.posts.map((p, pi) => pi !== postIdx ? p : { ...p, project_id: projectId }),
        }
      ),
    };
    try {
      await fetch('/api/editorial/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: updated }),
      });
    } catch {}
  };

  return (
    <>
      {/* Calendar card */}
      <div className="bg-white border border-warm-border rounded-2xl shadow-soft overflow-hidden">
        {/* Header — matches InstagramAnalyticsStrip style */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-sage/[0.06]">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-sage/40" />
            <span className="text-sm font-semibold text-sage">{weekLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset(o => o - 1)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-sage/40 hover:text-sage hover:bg-sage/5 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="text-[10px] font-medium text-sage/40 hover:text-sage transition-colors px-1"
              >
                Today
              </button>
            )}
            <button
              onClick={() => setWeekOffset(o => o + 1)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-sage/40 hover:text-sage hover:bg-sage/5 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <Link
              href="/editorial"
              className="flex items-center gap-1 text-[11px] text-dusty-rose hover:text-dusty-rose/70 transition-colors ml-1"
            >
              Full calendar <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {weekHasPosts ? (
          <div className="grid grid-cols-7 divide-x divide-sage/[0.08]">
            {weekDays.map((day) => {
              const isToday = day.getTime() === today.getTime();
              const isPast  = day.getTime() < today.getTime();
              const key     = localDateStr(day);
              const entries = datePostMap.get(key) ?? [];

              return (
                <div key={key} className={`flex flex-col${isPast ? ' opacity-40' : ''}`}>
                  {/* Day header */}
                  <div className={`px-1 py-2 text-center border-b border-sage/[0.08] ${isToday ? 'bg-sage' : 'bg-sage/[0.02]'}`}>
                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${isToday ? 'text-cream/70' : 'text-sage/40'}`}>
                      {DAY_SHORT[day.getDay()]}
                    </p>
                    <p className={`text-sm font-bold leading-none mt-0.5 ${isToday ? 'text-cream' : 'text-sage'}`}>
                      {day.getDate()}
                    </p>
                  </div>

                  {/* Post tiles — flex-1 so all columns match the tallest */}
                  <div className="flex flex-col gap-1.5 p-2 flex-1">
                    {entries.length === 0 ? (
                      <span className="text-[10px] text-sage/20 text-center block mt-4">—</span>
                    ) : (
                      entries.slice(0, 4).map(({ post, weekIdx, postIdx }, pi) => {
                        const s = TYPE_STYLE[post.contentType] ?? TYPE_STYLE.Value;
                        return (
                          <button
                            key={pi}
                            onClick={() => setModalPost({ post, weekIdx, postIdx, dateStr: key })}
                            className={`w-full text-left px-2.5 py-2 rounded-lg ${s.bg} ${s.text} hover:opacity-70 transition-opacity`}
                          >
                            <p className="text-[11px] font-medium leading-snug line-clamp-3 mb-1">
                              {post.event_tag ? `${post.event_tag.split(' ')[0]} ` : ''}{post.topic}
                            </p>
                            <p className="text-[9px] opacity-60 font-medium uppercase tracking-wide">
                              {post.contentType} · {post.format}
                            </p>
                          </button>
                        );
                      })
                    )}
                    {entries.length > 4 && (
                      <span className="text-[10px] text-sage/30 pl-1">+{entries.length - 4} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="relative mb-5">
              <span className="absolute inset-0 rounded-full bg-dusty-rose/25 animate-ping" />
              <div className="relative w-12 h-12 rounded-full bg-dusty-rose/10 flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-dusty-rose" />
              </div>
            </div>
            <p className="text-sm font-semibold text-sage mb-1.5">Nothing planned this week</p>
            <p className="text-xs text-sage/50 text-center mb-6 max-w-[260px] leading-relaxed">
              Don't have a content plan yet? Get started here and let OwnVoice guide you.
            </p>
            <Link
              href="/editorial?openSettings=1"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-dusty-rose hover:bg-dusty-rose/90 text-cream text-sm font-medium rounded-2xl transition-all shadow-sm hover:shadow-md"
            >
              <CalendarDays className="w-4 h-4" />
              Get started
            </Link>
          </div>
        )}
      </div>

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
    </>
  );
}
