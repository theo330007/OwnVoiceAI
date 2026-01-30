'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Activity, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface Props {
  validations: any[];
}

export function ValidationDetails({ validations }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Card className="bg-white rounded-3xl shadow-soft p-6">
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-5 h-5 text-sage" />
        <h3 className="font-serif text-xl text-sage">Recent Validations</h3>
      </div>

      <div className="space-y-3">
        {validations.length === 0 ? (
          <p className="text-sm text-sage/50 text-center py-8">
            No validations yet
          </p>
        ) : (
          validations.map((validation) => {
            const isExpanded = expandedId === validation.id;
            const trendAlignment = validation.trend_alignment;
            const scientificAnchor = validation.scientific_anchor;
            const refinedHooks = validation.refined_hooks;

            return (
              <div
                key={validation.id}
                className="border border-sage/10 rounded-2xl overflow-hidden"
              >
                {/* Header - Always Visible */}
                <button
                  onClick={() => toggleExpand(validation.id)}
                  className="w-full p-4 bg-sage/5 hover:bg-sage/10 transition-colors text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-sage line-clamp-2 mb-2">
                        {validation.user_query}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-sage/60">
                        <span>{formatDate(validation.created_at)}</span>
                        {validation.relevance_score && (
                          <span className="px-2 py-0.5 bg-dusty-rose/20 text-dusty-rose rounded-full font-semibold">
                            {validation.relevance_score}/100
                          </span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-sage/50 flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-sage/50 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 space-y-4 bg-white">
                    {/* Trend Alignment */}
                    {trendAlignment && (
                      <div>
                        <h4 className="text-sm font-semibold text-sage mb-2">
                          Trend Alignment
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {trendAlignment.macro_trends?.length > 0 && (
                            <div>
                              <p className="text-xs text-sage/60 mb-1 uppercase tracking-wide">
                                Macro
                              </p>
                              <ul className="space-y-1">
                                {trendAlignment.macro_trends.map(
                                  (trend: string, idx: number) => (
                                    <li
                                      key={idx}
                                      className="text-xs text-sage bg-sage/5 px-2 py-1 rounded"
                                    >
                                      {trend}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                          {trendAlignment.niche_trends?.length > 0 && (
                            <div>
                              <p className="text-xs text-sage/60 mb-1 uppercase tracking-wide">
                                Niche
                              </p>
                              <ul className="space-y-1">
                                {trendAlignment.niche_trends.map(
                                  (trend: string, idx: number) => (
                                    <li
                                      key={idx}
                                      className="text-xs text-sage bg-dusty-rose/5 px-2 py-1 rounded"
                                    >
                                      {trend}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                        {trendAlignment.alignment_reasoning && (
                          <p className="text-sm text-sage/70 mt-2">
                            {trendAlignment.alignment_reasoning}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Scientific Anchor */}
                    {scientificAnchor && (
                      <div>
                        <h4 className="text-sm font-semibold text-sage mb-2">
                          Scientific Anchor
                        </h4>
                        {scientificAnchor.key_findings && (
                          <p className="text-sm text-sage/70 mb-2">
                            {scientificAnchor.key_findings}
                          </p>
                        )}
                        {scientificAnchor.sources?.length > 0 && (
                          <div className="space-y-1">
                            {scientificAnchor.sources.map(
                              (source: any, idx: number) => (
                                <a
                                  key={idx}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-sage/60 hover:text-sage transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {source.title}
                                </a>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Refined Hooks */}
                    {refinedHooks && Array.isArray(refinedHooks) && (
                      <div>
                        <h4 className="text-sm font-semibold text-sage mb-2">
                          Hook Variations
                        </h4>
                        <div className="space-y-2">
                          {refinedHooks.map((hook: string, idx: number) => (
                            <div
                              key={idx}
                              className="p-3 bg-sage/5 rounded-xl text-sm text-sage"
                            >
                              <span className="text-xs text-dusty-rose font-semibold mr-2">
                                #{idx + 1}
                              </span>
                              {hook}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {validations.length > 5 && (
        <p className="text-xs text-sage/50 text-center mt-4">
          Showing {Math.min(5, validations.length)} of {validations.length}{' '}
          validations
        </p>
      )}
    </Card>
  );
}
