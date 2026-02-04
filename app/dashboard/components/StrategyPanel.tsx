'use client';

import { Lightbulb, ArrowRight, BookOpen, Camera, Megaphone, Users2, Sparkles, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createWorkflow } from '@/app/actions/workflows';

interface StrategicInsight {
  id: string;
  trend_title: string;
  content_ideas: {
    educational: { hook: string; concept: string; cta: string };
    behind_the_scenes: { hook: string; concept: string; cta: string };
    promotional: { hook: string; concept: string; cta: string };
    interactive: { hook: string; concept: string; cta: string };
  };
  created_at: string;
}

interface Props {
  insights?: StrategicInsight[];
  userId: string;
}

export function StrategyPanel({ insights = [], userId }: Props) {
  const router = useRouter();
  const [startingWorkflow, setStartingWorkflow] = useState<string | null>(null);
  const contentTypeIcons = {
    educational: BookOpen,
    behind_the_scenes: Camera,
    promotional: Megaphone,
    interactive: Users2,
  };

  const contentTypeLabels = {
    educational: 'Educational',
    behind_the_scenes: 'Behind-the-Scenes',
    promotional: 'Promotional',
    interactive: 'Interactive',
  };

  const handleStartWorkflow = async (
    insightId: string,
    contentType: 'educational' | 'behind_the_scenes' | 'promotional' | 'interactive'
  ) => {
    setStartingWorkflow(`${insightId}-${contentType}`);

    try {
      const workflow = await createWorkflow(insightId, contentType);
      router.push(`/lab/workflow/${workflow.id}`);
    } catch (error: any) {
      alert(error.message || 'Failed to start workflow');
      setStartingWorkflow(null);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-sage/5 to-dusty-rose/5 rounded-3xl shadow-soft p-6 border-2 border-sage/10">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-sage" />
        <h2 className="font-serif text-2xl text-sage">Strategic Insights</h2>
      </div>

      {insights.length === 0 ? (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-sage mb-3">
              Generate Content Ideas
            </h3>
            <p className="text-sm text-sage/70 leading-relaxed mb-4">
              Click "Generate Strategic Insight" on any niche trend to get AI-powered
              content ideas across 4 content types: Educational, Behind-the-Scenes,
              Promotional, and Interactive.
            </p>
          </div>

          <div className="pt-6 border-t border-sage/10">
            <h4 className="font-semibold text-sage/80 text-sm mb-3">
              AI-Powered Content Validation
            </h4>
            <p className="text-sm text-sage/70 leading-relaxed mb-4">
              Get instant validation for your content ideas. Our AI analyzes
              current trends and scientific research to give you data-driven
              recommendations.
            </p>
            <Link
              href="/lab"
              className="inline-flex items-center gap-2 text-dusty-rose hover:text-dusty-rose/80 text-sm font-medium transition-colors"
            >
              Try OwnVoice AI Lab
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="bg-white rounded-2xl p-5 border border-sage/10 shadow-soft"
            >
              {/* Trend Title */}
              <div className="flex items-start gap-2 mb-4 pb-4 border-b border-sage/10">
                <Sparkles className="w-5 h-5 text-dusty-rose flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sage mb-1">
                    {insight.trend_title}
                  </h3>
                  <p className="text-xs text-sage/50">
                    Generated {new Date(insight.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Content Ideas */}
              <div className="space-y-4">
                {Object.entries(insight.content_ideas).map(([type, content]) => {
                  const Icon = contentTypeIcons[type as keyof typeof contentTypeIcons];
                  const label = contentTypeLabels[type as keyof typeof contentTypeLabels];

                  return (
                    <div
                      key={type}
                      className="bg-gradient-to-r from-sage/5 to-dusty-rose/5 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="w-4 h-4 text-dusty-rose" />
                        <h4 className="font-semibold text-sage text-sm uppercase tracking-wide">
                          {label}
                        </h4>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div>
                          <span className="font-medium text-sage/70">Hook:</span>
                          <p className="text-sage leading-relaxed italic">"{content.hook}"</p>
                        </div>
                        <div>
                          <span className="font-medium text-sage/70">Concept:</span>
                          <p className="text-sage/80 leading-relaxed">{content.concept}</p>
                        </div>
                        <div>
                          <span className="font-medium text-sage/70">CTA:</span>
                          <p className="text-dusty-rose font-medium">{content.cta}</p>
                        </div>
                      </div>

                      {/* Start Workflow Button */}
                      <Button
                        onClick={() => handleStartWorkflow(insight.id, type as any)}
                        disabled={startingWorkflow === `${insight.id}-${type}`}
                        size="sm"
                        className="w-full bg-gradient-to-r from-sage to-dusty-rose hover:from-sage/90 hover:to-dusty-rose/90 text-white"
                      >
                        {startingWorkflow === `${insight.id}-${type}` ? (
                          'Starting...'
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-2" />
                            Start Workflow
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-6 mt-6 border-t border-sage/10">
        <Link
          href="/lab"
          className="text-sm text-sage/60 hover:text-sage transition-colors underline"
        >
          Validate More Content Ideas →
        </Link>
      </div>
    </Card>
  );
}
