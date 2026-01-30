'use client';

import { Card } from '@/components/ui/card';
import { Lightbulb, TrendingUp, Target } from 'lucide-react';
import type { Trend } from '@/lib/types';

interface Props {
  macroTrends: Trend[];
  nicheTrends: Trend[];
}

export function StrategicInsights({ macroTrends, nicheTrends }: Props) {
  // Calculate insights: find macro trends that align with user's niche trends
  const insights = macroTrends
    .map((macro) => {
      const matchedNiche = nicheTrends.filter((niche) =>
        macro.keywords?.some((mk) => niche.keywords?.includes(mk))
      );

      if (matchedNiche.length === 0) return null;

      return {
        macroTrend: macro,
        matchedNicheTrends: matchedNiche,
        overlapScore: matchedNiche.reduce(
          (score, niche) =>
            score +
            (niche.keywords?.filter((nk) => macro.keywords?.includes(nk)).length || 0),
          0
        ),
      };
    })
    .filter((insight) => insight !== null)
    .sort((a, b) => (b?.overlapScore || 0) - (a?.overlapScore || 0));

  // Calculate content opportunities
  const opportunities = insights.slice(0, 3);

  return (
    <Card className="bg-white rounded-3xl shadow-soft p-6">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-5 h-5 text-dusty-rose" />
        <h3 className="font-serif text-xl text-sage">Strategic Insights</h3>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sage/50 mb-2">No strategic insights yet</p>
          <p className="text-sm text-sage/40">
            Add niche trends to see how they align with macro trends
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Opportunities */}
          <div>
            <h4 className="text-sm font-semibold text-sage/70 uppercase tracking-wide mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Top Content Opportunities
            </h4>
            <div className="space-y-3">
              {opportunities.map((insight, idx) => (
                <div
                  key={insight?.macroTrend.id}
                  className="p-4 bg-gradient-to-br from-dusty-rose/10 to-sage/5 rounded-2xl border border-dusty-rose/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-dusty-rose">
                          #{idx + 1}
                        </span>
                        <h5 className="font-semibold text-sage">
                          {insight?.macroTrend.title}
                        </h5>
                      </div>
                      <p className="text-sm text-sage/70 mb-3">
                        {insight?.macroTrend.description}
                      </p>

                      {/* Matched Niche Trends */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-sage/60 uppercase tracking-wide flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          Matches User's Focus
                        </p>
                        {insight?.matchedNicheTrends.map((niche) => (
                          <div
                            key={niche.id}
                            className="pl-4 border-l-2 border-dusty-rose/30"
                          >
                            <p className="text-sm font-medium text-sage">
                              {niche.title}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {niche.keywords
                                ?.filter((nk) =>
                                  insight?.macroTrend.keywords?.includes(nk)
                                )
                                .map((keyword, kidx) => (
                                  <span
                                    key={kidx}
                                    className="px-2 py-0.5 bg-dusty-rose/30 text-dusty-rose text-xs rounded-full"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="ml-3 px-3 py-1 bg-dusty-rose/20 text-dusty-rose rounded-full text-xs font-bold">
                      {insight?.overlapScore} overlap
                    </div>
                  </div>

                  {/* Content Recommendation */}
                  <div className="mt-3 pt-3 border-t border-sage/10">
                    <p className="text-xs font-semibold text-sage/60 mb-1">
                      Recommended Action
                    </p>
                    <p className="text-sm text-sage">
                      Create content combining "{insight?.macroTrend.title}" with their
                      focus on{' '}
                      {insight?.matchedNicheTrends.map((n) => n.title).join(' and ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Alignments */}
          {insights.length > 3 && (
            <div>
              <h4 className="text-sm font-semibold text-sage/70 uppercase tracking-wide mb-3">
                Additional Alignments ({insights.length - 3})
              </h4>
              <div className="space-y-2">
                {insights.slice(3).map((insight) => (
                  <div
                    key={insight?.macroTrend.id}
                    className="p-3 bg-sage/5 rounded-xl hover:bg-sage/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-sage">
                          {insight?.macroTrend.title}
                        </p>
                        <p className="text-xs text-sage/60">
                          Aligns with {insight?.matchedNicheTrends.length} niche trend
                          {insight?.matchedNicheTrends.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="text-xs text-sage/50">
                        {insight?.overlapScore} overlap
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
