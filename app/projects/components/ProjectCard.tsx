'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/app/actions/projects';
import { createWorkflowFromProject } from '@/app/actions/workflows';
import {
  BookOpen,
  Camera,
  Megaphone,
  Users2,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
  Archive,
  Play,
  Sparkles,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  project: Project & { notes_count: number };
}

const CONTENT_TYPE_CONFIG = {
  educational: {
    label: 'Educational',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  behind_the_scenes: {
    label: 'Behind the Scenes',
    icon: Camera,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  promotional: {
    label: 'Promotional',
    icon: Megaphone,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  interactive: {
    label: 'Interactive',
    icon: Users2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
};

const PHASE_CONFIG = {
  ideation:  { label: 'Ideation',  color: 'text-blue-600',   bgColor: 'bg-blue-50' },
  drafting:  { label: 'Drafting',  color: 'text-purple-600', bgColor: 'bg-purple-50' },
  editing:   { label: 'Editing',   color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ready:     { label: 'Ready',     color: 'text-green-600',  bgColor: 'bg-green-50' },
  published: { label: 'Published', color: 'text-sage',       bgColor: 'bg-sage/10' },
};

export function ProjectCard({ project }: Props) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  const contentTypeConfig = CONTENT_TYPE_CONFIG[project.content_type];
  const phaseConfig = PHASE_CONFIG[project.current_phase];
  const ContentTypeIcon = contentTypeConfig.icon;

  const statusIcon =
    project.status === 'completed' ? (
      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
    ) : project.status === 'archived' ? (
      <Archive className="w-3.5 h-3.5 text-sage/40 flex-shrink-0" />
    ) : (
      <Clock className="w-3.5 h-3.5 text-dusty-rose flex-shrink-0" />
    );

  const handleStart = async () => {
    setStarting(true);
    try {
      const workflow = await createWorkflowFromProject(project.id);
      router.push(`/lab/workflow/${workflow.id}`);
    } catch {
      setStarting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-sage/10 hover:border-sage/25 hover:shadow-soft transition-all flex flex-col">
      {/* Header row: icon + title + status */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`${contentTypeConfig.bgColor} p-2 rounded-xl flex-shrink-0`}>
          <ContentTypeIcon className={`w-4 h-4 ${contentTypeConfig.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sage text-sm leading-snug line-clamp-2 mb-0.5">
            {project.title}
          </h3>
          {project.trend_title && (
            <p className="text-[11px] text-sage/40 truncate">{project.trend_title}</p>
          )}
        </div>
        {statusIcon}
      </div>

      {/* Phase + content type badges */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${phaseConfig.bgColor} ${phaseConfig.color}`}>
          {phaseConfig.label}
        </span>
        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${contentTypeConfig.bgColor} ${contentTypeConfig.color}`}>
          {contentTypeConfig.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-sage/40">Progress</span>
          <span className="text-[10px] font-semibold text-sage/50">{project.completion_percentage}%</span>
        </div>
        <div className="w-full bg-sage/8 rounded-full h-1">
          <div
            className="bg-gradient-to-r from-sage to-dusty-rose h-1 rounded-full transition-all duration-300"
            style={{ width: `${project.completion_percentage}%` }}
          />
        </div>
      </div>

      {/* CTA button */}
      <div className="mt-auto mb-3">
        {project.workflow_id ? (
          <Link
            href={`/lab/workflow/${project.workflow_id}`}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-gradient-to-r from-sage to-dusty-rose hover:opacity-90 text-cream text-xs font-semibold rounded-xl transition-opacity"
          >
            <Play className="w-3 h-3" />
            Open Workflow
          </Link>
        ) : (
          <button
            onClick={handleStart}
            disabled={starting}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-sage/8 hover:bg-sage/15 text-sage text-xs font-semibold rounded-xl transition-colors border border-sage/15 disabled:opacity-50"
          >
            {starting ? (
              <><Loader2 className="w-3 h-3 animate-spin" />Starting…</>
            ) : (
              <><Sparkles className="w-3 h-3" />Start Workflow</>
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-2.5 border-t border-sage/8 text-[10px] text-sage/30">
        {project.notes_count > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {project.notes_count} note{project.notes_count > 1 ? 's' : ''}
          </span>
        )}
        {project.scheduled_date && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(project.scheduled_date).toLocaleDateString()}
          </span>
        )}
        <span className="ml-auto">
          {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
