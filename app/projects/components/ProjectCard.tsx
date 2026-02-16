'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Project } from '@/app/actions/projects';
import {
  BookOpen,
  Camera,
  Megaphone,
  Users2,
  ExternalLink,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
  Archive,
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
    bgColor: 'bg-blue-100',
  },
  behind_the_scenes: {
    label: 'Behind-the-Scenes',
    icon: Camera,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  promotional: {
    label: 'Promotional',
    icon: Megaphone,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  interactive: {
    label: 'Interactive',
    icon: Users2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
};

const PHASE_CONFIG = {
  ideation: { label: 'Ideation', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  drafting: { label: 'Drafting', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  editing: { label: 'Editing', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  ready: { label: 'Ready', color: 'text-green-600', bgColor: 'bg-green-100' },
  published: { label: 'Published', color: 'text-sage', bgColor: 'bg-sage/10' },
};

export function ProjectCard({ project }: Props) {
  const contentTypeConfig = CONTENT_TYPE_CONFIG[project.content_type];
  const phaseConfig = PHASE_CONFIG[project.current_phase];
  const ContentTypeIcon = contentTypeConfig.icon;

  const statusIcon =
    project.status === 'completed' ? (
      <CheckCircle2 className="w-4 h-4 text-green-600" />
    ) : project.status === 'archived' ? (
      <Archive className="w-4 h-4 text-sage/60" />
    ) : (
      <Clock className="w-4 h-4 text-dusty-rose" />
    );

  return (
    <Card className="bg-white rounded-3xl shadow-soft p-6 border border-sage/10 hover:shadow-soft-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`${contentTypeConfig.bgColor} p-3 rounded-xl`}>
          <ContentTypeIcon className={`w-5 h-5 ${contentTypeConfig.color}`} />
        </div>
        <div className="flex items-center gap-2">
          {statusIcon}
          <span className="text-xs text-sage/60 capitalize">{project.status.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Title & Trend */}
      <div className="mb-4">
        <h3 className="font-semibold text-sage mb-1 line-clamp-2">{project.title}</h3>
        {project.trend_title && (
          <p className="text-xs text-sage/50 line-clamp-1">Based on: {project.trend_title}</p>
        )}
      </div>

      {/* Content Type & Phase */}
      <div className="flex gap-2 mb-4">
        <span className={`px-3 py-1 ${contentTypeConfig.bgColor} ${contentTypeConfig.color} text-xs rounded-full font-medium`}>
          {contentTypeConfig.label}
        </span>
        <span className={`px-3 py-1 ${phaseConfig.bgColor} ${phaseConfig.color} text-xs rounded-full font-medium`}>
          {phaseConfig.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-sage/60">Progress</span>
          <span className="text-xs font-medium text-sage">{project.completion_percentage}%</span>
        </div>
        <div className="w-full bg-sage/10 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-sage to-dusty-rose h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.completion_percentage}%` }}
          />
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 mb-4 text-xs text-sage/60">
        {project.notes_count > 0 && (
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span>{project.notes_count} notes</span>
          </div>
        )}
        {project.scheduled_date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(project.scheduled_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {project.workflow_id && (
          <Button
            asChild
            size="sm"
            className="w-full bg-gradient-to-r from-sage to-dusty-rose hover:from-sage/90 hover:to-dusty-rose/90 text-white"
          >
            <Link href={`/lab/workflow/${project.workflow_id}`}>
              <ExternalLink className="w-3 h-3 mr-2" />
              Open Workflow
            </Link>
          </Button>
        )}
      </div>

      {/* Footer - Created Date */}
      <div className="mt-4 pt-4 border-t border-sage/10">
        <p className="text-xs text-sage/40">
          Created {new Date(project.created_at).toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
}
