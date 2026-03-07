'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';

// ─── Types (same shape as EditorialCalendar) ──────────────────────────────────
interface PostSlot { day: string; pillar: string; contentType: 'Value' | 'Authority' | 'Sales'; topic: string; }
interface WeekPlan  { week: number; theme: string; posts: PostSlot[]; }
interface EditorialPlan { start_date?: string; weeks: WeekPlan[]; }

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAY_OFFSET: Record<string, number> = { Monday:0, Tuesday:1, Wednesday:2, Thursday:3, Friday:4, Saturday:5, Sunday:6 };
const CONTENT_TYPE_STYLES: Record<string, { chip: string }> = {
  Value:     { chip: 'bg-sage/10 text-sage' },
  Authority: { chip: 'bg-blue-50 text-blue-700' },
  Sales:     { chip: 'bg-dusty-rose/10 text-dusty-rose' },
};

// ─── Helpers (mirrored from EditorialCalendar) ────────────────────────────────
function parseLocalDate(s: string) { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
function localDateStr(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function computePostDate(startDate: string, wi: number, dayName: string) {
  const b = parseLocalDate(startDate); b.setDate(b.getDate() + wi*7 + (DAY_OFFSET[dayName]??0)); return b;
}
function getCalendarDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year,month,1), last = new Date(year,month+1,0);
  const offset = (first.getDay()+6)%7;
  const days: (Date|null)[] = Array(offset).fill(null);
  for (let d=1; d<=last.getDate(); d++) days.push(new Date(year,month,d));
  while (days.length%7) days.push(null);
  return days;
}
function buildDatePostMap(plan: EditorialPlan): Map<string, PostSlot[]> {
  const map = new Map<string, PostSlot[]>();
  if (!plan.start_date) return map;
  plan.weeks.forEach((w,wi) => w.posts.forEach(p => {
    const key = localDateStr(computePostDate(plan.start_date!, wi, p.day));
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }));
  return map;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function MiniCalendar({ plan }: { plan: EditorialPlan | null }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const days = getCalendarDays(year, month);
  const postMap = plan ? buildDatePostMap(plan) : new Map<string, PostSlot[]>();
  const todayStr = localDateStr(today);

  function prev() { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }
  function next() { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }

  return (
    <div className="bg-white border border-warm-border rounded-3xl shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 border-b border-sage/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-sage/50" />
            <h2 className="font-serif text-xl text-sage">{MONTH_NAMES[month]} {year}</h2>
          </div>
          <p className="text-xs text-sage/50">Your AI-generated 4-week content plan — colour-coded by post type</p>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <button onClick={prev} className="p-1.5 rounded-xl hover:bg-sage/8 transition-colors text-sage/50 hover:text-sage">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={next} className="p-1.5 rounded-xl hover:bg-sage/8 transition-colors text-sage/50 hover:text-sage">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-sage/10">
        {DAY_NAMES.map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold text-sage/40 uppercase tracking-wider">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          if (!date) return <div key={i} className="min-h-[72px] bg-sage/[0.02] border-b border-r border-sage/5" />;
          const key = localDateStr(date);
          const posts = postMap.get(key) ?? [];
          const isToday = key === todayStr;
          return (
            <div
              key={key}
              className={`min-h-[72px] p-1.5 border-b border-r border-sage/5 ${isToday ? 'bg-sage/5' : ''}`}
            >
              <span className={`inline-flex w-5 h-5 items-center justify-center rounded-full text-[11px] font-medium mb-1 ${
                isToday ? 'bg-dusty-rose text-cream' : 'text-sage/50'
              }`}>
                {date.getDate()}
              </span>
              <div className="space-y-0.5">
                {posts.slice(0, 2).map((p, pi) => (
                  <div
                    key={pi}
                    className={`rounded px-1 py-0.5 text-[9px] font-medium truncate ${CONTENT_TYPE_STYLES[p.contentType]?.chip ?? 'bg-sage/10 text-sage'}`}
                    title={p.topic}
                  >
                    {p.contentType}
                  </div>
                ))}
                {posts.length > 2 && (
                  <div className="text-[9px] text-sage/40">+{posts.length - 2}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-sage/10">
        {plan ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] text-sage/50">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-sage/10 inline-block" /> Value</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-50 inline-block border border-blue-100" /> Authority</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-dusty-rose/10 inline-block" /> Sales</span>
            </div>
            <Link
              href="/editorial"
              className="flex items-center gap-1.5 px-4 py-2 bg-sage hover:bg-sage/90 text-cream text-xs font-medium rounded-xl transition-colors"
            >
              View Full Calendar →
            </Link>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-sage/50 mb-3">No editorial plan yet. Generate your AI content plan to get started.</p>
            <Link
              href="/editorial"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-dusty-rose hover:bg-dusty-rose/90 text-cream text-sm font-medium rounded-xl transition-colors"
            >
              Plan My Month →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
