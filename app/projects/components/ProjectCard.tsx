'use client';

import Link from 'next/link';
import { Clock, TrendingUp, ChevronRight } from 'lucide-react';
import type { Project } from '@/lib/types/project';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  archived: 'bg-orange-100 text-orange-700',
};

const statusLabels = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
};

const stepLabels = {
  setup: 'Setup',
  research: 'Research',
  planning: 'Planning',
  execution: 'Execution',
  review: 'Review',
};

interface Props {
  project: Project;
}

export function ProjectCard({ project }: Props) {
  const formattedDate = new Date(project.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white rounded-3xl shadow-soft p-6 hover:shadow-soft-lg transition-all cursor-pointer group h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              statusColors[project.status]
            }`}
          >
            {statusLabels[project.status]}
          </span>
          <ChevronRight className="w-5 h-5 text-sage/40 group-hover:text-sage group-hover:translate-x-1 transition-all" />
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl text-sage mb-2 line-clamp-2">
          {project.title}
        </h3>

        {/* Description */}
        {project.description && (
          <p className="text-sage/60 text-sm mb-4 line-clamp-3 flex-grow">
            {project.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="space-y-3 mt-auto pt-4 border-t border-sage/10">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-sage/60">
              <Clock className="w-4 h-4" />
              <span>Current Step</span>
            </div>
            <span className="text-sage font-medium">
              {stepLabels[project.current_step]}
            </span>
          </div>

          {project.selected_trends && project.selected_trends.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-sage/60">
                <TrendingUp className="w-4 h-4" />
                <span>Selected Trends</span>
              </div>
              <span className="text-sage font-medium">
                {project.selected_trends.length}
              </span>
            </div>
          )}

          <div className="text-xs text-sage/50 pt-2">
            Updated {formattedDate}
          </div>
        </div>
      </div>
    </Link>
  );
}
