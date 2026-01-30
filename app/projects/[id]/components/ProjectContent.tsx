'use client';

import { TrendingUp, Lightbulb, CheckSquare } from 'lucide-react';
import type { Project } from '@/lib/types/project';

interface Props {
  project: Project;
}

export function ProjectContent({ project }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Selected Trends */}
      <div className="bg-white rounded-3xl shadow-soft p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-sage" />
          <h3 className="font-serif text-xl text-sage">Selected Trends</h3>
        </div>

        {project.selected_trends && project.selected_trends.length > 0 ? (
          <div className="space-y-3">
            {project.selected_trends.map((trendId, index) => (
              <div
                key={trendId}
                className="p-4 bg-sage/5 rounded-2xl hover:bg-sage/10 transition-colors"
              >
                <div className="text-sm text-sage/60 mb-1">Trend {index + 1}</div>
                <div className="text-xs text-sage/40 font-mono">{trendId}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sage/50 text-sm">No trends selected yet</p>
            <button className="mt-4 text-sm text-sage hover:text-sage/80 font-medium">
              Browse Trends
            </button>
          </div>
        )}
      </div>

      {/* Content Ideas */}
      <div className="bg-white rounded-3xl shadow-soft p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-5 h-5 text-dusty-rose" />
          <h3 className="font-serif text-xl text-sage">Content Ideas</h3>
        </div>

        {project.content_ideas && project.content_ideas.length > 0 ? (
          <div className="space-y-3">
            {project.content_ideas.map((idea: any, index: number) => (
              <div
                key={index}
                className="p-4 bg-dusty-rose/5 rounded-2xl hover:bg-dusty-rose/10 transition-colors"
              >
                <p className="text-sm text-sage">{idea.title || idea}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sage/50 text-sm">No content ideas yet</p>
            <button className="mt-4 text-sm text-sage hover:text-sage/80 font-medium">
              Generate Ideas
            </button>
          </div>
        )}
      </div>

      {/* Validation Results */}
      <div className="bg-white rounded-3xl shadow-soft p-6">
        <div className="flex items-center gap-3 mb-6">
          <CheckSquare className="w-5 h-5 text-green-600" />
          <h3 className="font-serif text-xl text-sage">Validation Results</h3>
        </div>

        {project.validation_results && project.validation_results.length > 0 ? (
          <div className="space-y-3">
            {project.validation_results.map((result: any, index: number) => (
              <div
                key={index}
                className="p-4 bg-green-50 rounded-2xl border border-green-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-sage">
                    Validation {index + 1}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {result.score || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-sage/60">{result.summary || 'No summary'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sage/50 text-sm">No validations yet</p>
            <button className="mt-4 text-sm text-sage hover:text-sage/80 font-medium">
              Validate Ideas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
