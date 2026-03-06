'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X, Loader2, ArrowRight, BookOpen, TrendingUp, ShoppingBag, FolderOpen, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createProjectFromIdea } from '@/app/actions/projects';
import { createWorkflowFromProject } from '@/app/actions/workflows';
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
  event_tag?: string;
  is_suggestion?: boolean;
}

interface PostDetailModalProps {
  post: PostSlot;
  weekIdx: number;
  postIdx: number;
  dateStr: string;
  nicheContext: string;
  projects: Project[];
  onClose: () => void;
  onLinkProject: (weekIdx: number, postIdx: number, projectId: string | null) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CONTENT_TYPE_STYLES = {
  Value:     { bg: 'bg-sage/10',       text: 'text-sage',       icon: BookOpen },
  Authority: { bg: 'bg-blue-50',       text: 'text-blue-700',   icon: TrendingUp },
  Sales:     { bg: 'bg-dusty-rose/10', text: 'text-dusty-rose', icon: ShoppingBag },
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

const FORMAT_MAP: Record<string, 'carousel' | 'reel' | 'storytelling' | 'sales'> = {
  Reel: 'reel',
  Carousel: 'carousel',
  Story: 'storytelling',
  'Static Post': 'storytelling',
  Live: 'reel',
  Newsletter: 'reel',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProjectPickerInModal({
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
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1.5 px-3 py-2 bg-sage/8 border border-sage/15 rounded-xl flex-1 min-w-0">
          <FolderOpen className="w-3.5 h-3.5 text-sage/50 shrink-0" />
          <span className="text-xs text-sage font-medium truncate">{linked.title}</span>
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
          className="p-2 rounded-xl text-sage/30 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Unlink project"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 text-xs text-sage/50 border border-dashed border-sage/20 rounded-xl hover:border-sage/40 hover:text-sage/70 transition-colors w-full"
      >
        <FolderOpen className="w-3.5 h-3.5" />
        Link an existing project
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-[60] w-72 bg-white border border-warm-border rounded-2xl shadow-soft overflow-hidden">
          {projects.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-sage/50 mb-2">No projects yet</p>
              <Link href="/projects" className="text-xs text-dusty-rose underline">Create a project →</Link>
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto py-1.5">
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

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function PostDetailModal({
  post,
  weekIdx,
  postIdx,
  dateStr,
  nicheContext,
  projects,
  onClose,
  onLinkProject,
}: PostDetailModalProps) {
  const router = useRouter();
  const [angles, setAngles] = useState<string[] | null>(null);
  const [loadingAngles, setLoadingAngles] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const typeStyle = CONTENT_TYPE_STYLES[post.contentType] ?? CONTENT_TYPE_STYLES.Value;
  const TypeIcon = typeStyle.icon;
  const guide = FORMAT_GUIDE[post.format];

  const formattedDate = new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  // Fetch AI talking points on mount
  useEffect(() => {
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

  async function handleStartWorkflow() {
    setIsCreating(true);
    try {
      const project = await createProjectFromIdea({
        hook: post.hook,
        concept: post.topic,
        cta: '',
        pillar: post.pillar,
        format: FORMAT_MAP[post.format] ?? 'reel',
        source_type: 'editorial_calendar',
      });
      const workflow = await createWorkflowFromProject(project.id);
      router.push(`/lab/workflow/${workflow.id}`);
    } catch (err) {
      console.error('Failed to start workflow:', err);
      setIsCreating(false);
    }
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
                  <span className="px-2.5 py-1 border border-sage/10 rounded-xl text-xs text-sage/50">
                    {post.objective}
                  </span>
                  {post.event_tag && (
                    <span className="px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                      {post.event_tag}
                    </span>
                  )}
                  {post.is_suggestion && (
                    <span className="px-2.5 py-1 bg-dusty-rose/10 border border-dusty-rose/15 rounded-xl text-xs text-dusty-rose">
                      ↑ Trending
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

            {/* AI Talking Points */}
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

            {/* Link project */}
            <div>
              <p className="text-[11px] text-sage/40 font-semibold uppercase tracking-wider mb-2">
                Linked project
              </p>
              <ProjectPickerInModal
                projects={projects}
                linkedProjectId={post.project_id}
                onLink={(id) => onLinkProject(weekIdx, postIdx, id)}
                onUnlink={() => onLinkProject(weekIdx, postIdx, null)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <button
              onClick={handleStartWorkflow}
              disabled={isCreating}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-sage to-sage/80 hover:from-sage/90 hover:to-sage/70 text-cream text-sm font-semibold rounded-2xl transition-all disabled:opacity-60 shadow-sm"
            >
              {isCreating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating workflow…</>
              ) : (
                <>Start Workflow <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
