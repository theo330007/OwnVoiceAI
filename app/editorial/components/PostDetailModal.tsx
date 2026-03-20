'use client';

import { useState, useEffect } from 'react';
import {
  X, Loader2, BookOpen, TrendingUp, ShoppingBag, Trash2, Copy, CheckCircle2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PostStatus = 'new' | 'draft' | 'validated' | 'complete';

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
  quick_post_id?: string;
  status?: PostStatus;
  source?: string;
  // Lab-generated extras
  lab_hooks?: string[];
  lab_credibility_score?: number | null;
  lab_key_findings?: string | null;
  lab_trend_alignment?: string[];
  lab_relevance_score?: number | null;
}

interface PostDetailModalProps {
  post: PostSlot;
  weekIdx: number;
  postIdx: number;
  dateStr: string;
  nicheContext: string;
  onClose: () => void;
  onStatusChange: (weekIdx: number, postIdx: number, status: PostStatus, quickPostId?: string) => void;
  onDelete?: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CONTENT_TYPE_STYLES = {
  Value:     { bg: 'bg-sage/10',       text: 'text-sage',       icon: BookOpen },
  Authority: { bg: 'bg-blue-50',       text: 'text-blue-700',   icon: TrendingUp },
  Sales:     { bg: 'bg-dusty-rose/10', text: 'text-dusty-rose', icon: ShoppingBag },
};

export const STATUS_CONFIG: Record<PostStatus, { label: string; dot: string; badge: string; text: string }> = {
  new:       { label: 'New',       dot: 'bg-blue-400',   badge: 'bg-blue-50 border-blue-200',   text: 'text-blue-700' },
  draft:     { label: 'Draft',     dot: 'bg-amber-400',  badge: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  validated: { label: 'Validated', dot: 'bg-green-500',  badge: 'bg-green-50 border-green-200', text: 'text-green-700' },
  complete:  { label: 'Complete',  dot: 'bg-sage',        badge: 'bg-sage/10 border-sage/20',    text: 'text-sage' },
};

const FORMAT_GUIDE: Record<string, { description: string; tips: string[] }> = {
  Reel: {
    description: 'Short-form vertical video (15–60s)',
    tips: [
      'Strong visual hook in the first 2 seconds',
      'Add captions for silent viewing',
      'End with a clear CTA or a loop that rewards rewatching',
    ],
  },
  Carousel: {
    description: 'Swipeable slides (5–10)',
    tips: [
      'Slide 1 = your hook — make it impossible to scroll past',
      'One insight per slide, no more',
      'Last slide = CTA or save prompt',
    ],
  },
  Story: {
    description: 'Ephemeral vertical content (24h)',
    tips: [
      'Use polls or questions to boost engagement',
      'Keep copy under 5 words per frame',
      'Link out to a longer-form piece or offer',
    ],
  },
  'Static Post': {
    description: 'Single image or graphic',
    tips: [
      'Make the visual self-explanatory at a glance',
      'Caption under 3 lines before "more"',
      'Strong first sentence is the hook — treat it like a headline',
    ],
  },
  Live: {
    description: 'Real-time broadcast',
    tips: [
      'Announce 24 hours before to prime your audience',
      'Prepare a 5-point outline — improvise within it',
      'Reserve the last 10 minutes for live Q&A',
    ],
  },
  Newsletter: {
    description: 'Long-form email or Substack',
    tips: [
      'Subject line = curiosity gap — leave one question unanswered',
      'One big idea, explored deeply',
      'Plain text often converts better than designed HTML',
    ],
  },
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function PostDetailModal({
  post,
  weekIdx,
  postIdx,
  dateStr,
  nicheContext,
  onClose,
  onStatusChange,
  onDelete,
}: PostDetailModalProps) {
  const [angles, setAngles] = useState<string[] | null>(null);
  const [loadingAngles, setLoadingAngles] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localStatus, setLocalStatus] = useState<PostStatus>(post.status ?? 'new');
  const [copiedHook, setCopiedHook] = useState<string | null>(null);

  const isLabPost = post.source === 'lab' && (post.lab_hooks?.length ?? 0) > 0;

  const copyHook = async (hook: string) => {
    await navigator.clipboard.writeText(hook);
    setCopiedHook(hook);
    setTimeout(() => setCopiedHook(null), 2000);
  };

  const typeStyle = CONTENT_TYPE_STYLES[post.contentType] ?? CONTENT_TYPE_STYLES.Value;
  const TypeIcon = typeStyle.icon;
  const guide = FORMAT_GUIDE[post.format];

  const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const handleStatusClick = (s: PostStatus) => {
    setLocalStatus(s);
    onStatusChange(weekIdx, postIdx, s, post.quick_post_id);
  };

  // Fetch AI talking points on mount (skip for Lab posts — they already have rich data)
  useEffect(() => {
    if (isLabPost) { setLoadingAngles(false); return; }
    let cancelled = false;
    async function fetchAngles() {
      try {
        const res = await fetch('/api/editorial/post-brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: post.topic,
            hook: post.hook,
            pillar: post.pillar,
            contentType: post.contentType,
            format: post.format,
            nicheContext,
          }),
        });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        if (!cancelled) setAngles(data.angles ?? null);
      } catch {
        if (!cancelled) setAngles(null);
      } finally {
        if (!cancelled) setLoadingAngles(false);
      }
    }
    fetchAngles();
    return () => { cancelled = true; };
  }, [post.topic, post.hook, post.pillar, post.contentType, post.format, nicheContext]);

  // Escape key to close
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

  async function handleDelete() {
    if (!onDelete) return;
    setIsDeleting(true);
    onDelete();
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl shadow-soft-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">

          {/* Sticky header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-sage/8 px-6 pt-5 pb-4 rounded-t-3xl z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-xs text-sage/40 font-medium">{formattedDate}</span>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${typeStyle.bg} ${typeStyle.text}`}>
                    <TypeIcon className="w-3 h-3" />
                    {post.contentType}
                  </span>
                  <span className="px-2.5 py-1 bg-sage/8 border border-sage/10 rounded-xl text-xs text-sage/70 font-medium truncate max-w-[140px]">
                    {post.pillar}
                  </span>
                  <span className="px-2.5 py-1 border border-sage/10 rounded-xl text-xs text-sage/50">
                    {post.format}
                  </span>
                  {post.event_tag && (
                    <span className="px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                      {post.event_tag}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sage/30 hover:text-sage/60 hover:bg-sage/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status selector */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-sage/40 font-semibold uppercase tracking-wider shrink-0">Status</span>
              <div className="flex gap-1.5 flex-wrap">
                {(Object.entries(STATUS_CONFIG) as [PostStatus, typeof STATUS_CONFIG[PostStatus]][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusClick(key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      localStatus === key
                        ? `${cfg.badge} ${cfg.text}`
                        : 'bg-white border-sage/10 text-sage/30 hover:border-sage/25 hover:text-sage/50'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${localStatus === key ? cfg.dot : 'bg-sage/20'}`} />
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-6">

            {/* Topic + Hook */}
            <div>
              <h2 className="font-serif text-2xl text-sage leading-snug mb-2">{post.topic}</h2>
              <p className="text-sm text-sage/55 italic leading-relaxed">"{post.hook}"</p>
            </div>

            {/* Format guide */}
            {guide && (
              <div className="p-4 bg-sage/[0.04] border border-sage/10 rounded-2xl">
                <p className="text-[11px] text-sage/40 font-semibold uppercase tracking-wider mb-1">
                  Format guide · {post.format}
                </p>
                <p className="text-xs text-sage/60 mb-3">{guide.description}</p>
                <ul className="space-y-1.5">
                  {guide.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-sage/70">
                      <span className="w-4 h-4 flex items-center justify-center rounded-full bg-sage/10 text-sage text-[9px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lab Insights OR AI Talking Points */}
            {isLabPost ? (
              <div className="space-y-4">
                {/* Refined Hooks */}
                {post.lab_hooks && post.lab_hooks.length > 0 && (
                  <div className="p-4 bg-dusty-rose/[0.04] border border-dusty-rose/10 rounded-2xl">
                    <p className="text-[11px] text-dusty-rose/60 font-semibold uppercase tracking-wider mb-3">
                      Validated Hooks · click to copy
                    </p>
                    <ul className="space-y-2">
                      {post.lab_hooks.map((hook, i) => (
                        <li key={i}>
                          <button
                            onClick={() => copyHook(hook)}
                            className="w-full text-left flex items-start gap-2.5 p-2 rounded-xl hover:bg-dusty-rose/5 transition-colors group"
                          >
                            <span className="text-dusty-rose font-bold shrink-0 mt-0.5">→</span>
                            <span className="text-sm text-sage/80 flex-1 group-hover:text-sage">{hook}</span>
                            {copiedHook === hook
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                              : <Copy className="w-3.5 h-3.5 text-sage/20 group-hover:text-sage/40 shrink-0 mt-0.5" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Scientific Anchor */}
                {(post.lab_key_findings || post.lab_credibility_score) && (
                  <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] text-blue-600 font-semibold uppercase tracking-wider">Scientific Anchor</p>
                      {post.lab_credibility_score && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                          Credibility {post.lab_credibility_score}/100
                        </span>
                      )}
                    </div>
                    {post.lab_key_findings && (
                      <p className="text-xs text-sage/70 leading-relaxed">{post.lab_key_findings}</p>
                    )}
                  </div>
                )}
                {/* Trend Alignment */}
                {post.lab_trend_alignment && post.lab_trend_alignment.length > 0 && (
                  <div className="p-4 bg-sage/[0.04] border border-sage/10 rounded-2xl">
                    <p className="text-[11px] text-sage/50 font-semibold uppercase tracking-wider mb-2">Trend Alignment</p>
                    <div className="flex flex-wrap gap-1.5">
                      {post.lab_trend_alignment.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 bg-sage/10 text-sage/70 text-xs rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-dusty-rose/[0.04] border border-dusty-rose/10 rounded-2xl">
                <p className="text-[11px] text-dusty-rose/60 font-semibold uppercase tracking-wider mb-3">
                  AI Talking Points
                </p>
                {loadingAngles ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-4 bg-dusty-rose/10 rounded animate-pulse" style={{ width: `${70 + i * 8}%` }} />
                    ))}
                  </div>
                ) : angles && angles.length > 0 ? (
                  <ul className="space-y-2.5">
                    {angles.map((angle, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-sage/75">
                        <span className="text-dusty-rose font-bold shrink-0 mt-0.5">→</span>
                        {angle}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}

          </div>

          {/* Footer */}
          {onDelete && (
            <div className="px-6 pb-6 border-t border-sage/8 pt-4">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete idea
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
