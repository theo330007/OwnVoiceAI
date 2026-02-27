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

const CONTENT_TYPES = [
  { key: 'educational', label: 'Edu', icon: BookOpen },
  { key: 'behind_the_scenes', label: 'BTS', icon: Camera },
  { key: 'promotional', label: 'Promo', icon: Megaphone },
  { key: 'interactive', label: 'Live', icon: Users2 },
] as const;

type ContentTypeKey = typeof CONTENT_TYPES[number]['key'];

export function StrategyPanel({ insights = [], userId }: Props) {
  const router = useRouter();
  const [startingWorkflow, setStartingWorkflow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, ContentTypeKey>>({});

  const getActiveTab = (insightId: string): ContentTypeKey =>
    activeTab[insightId] ?? 'educational';

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
            <h3 className="font-semibold text-sage mb-3">Generate Content Ideas</h3>
            <p className="text-sm text-sage/70 leading-relaxed mb-4">
              Click "Generate Strategic Insight" on any niche trend to get AI-powered
              content ideas across 4 content types.
            </p>
          </div>
          <div className="pt-6 border-t border-sage/10">
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
        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
          {insights.map((insight) => {
            const tab = getActiveTab(insight.id);
            const content = insight.content_ideas[tab];
            const TabIcon = CONTENT_TYPES.find((t) => t.key === tab)!.icon;

            return (
              <div
                key={insight.id}
                className="bg-white rounded-2xl p-4 border border-sage/10 shadow-soft"
              >
                {/* Trend title */}
                <div className="flex items-start gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-dusty-rose flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sage text-sm leading-snug line-clamp-2">
                      {insight.trend_title}
                    </h3>
                    <p className="text-xs text-sage/40 mt-0.5">
                      {new Date(insight.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Tab selector */}
                <div className="flex gap-1 mb-3 p-1 bg-sage/5 rounded-xl">
                  {CONTENT_TYPES.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab((prev) => ({ ...prev, [insight.id]: key }))}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        tab === key
                          ? 'bg-white text-sage shadow-sm'
                          : 'text-sage/50 hover:text-sage/80'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Active tab content */}
                <div className="space-y-2 text-sm mb-3">
                  <p className="text-sage italic leading-relaxed line-clamp-2">
                    "{content.hook}"
                  </p>
                  <p className="text-sage/70 leading-relaxed line-clamp-2 text-xs">
                    {content.concept}
                  </p>
                  <p className="text-dusty-rose font-medium text-xs">{content.cta}</p>
                </div>

                {/* Start Workflow */}
                <Button
                  onClick={() => handleStartWorkflow(insight.id, tab as any)}
                  disabled={startingWorkflow === `${insight.id}-${tab}`}
                  size="sm"
                  className="w-full bg-gradient-to-r from-sage to-dusty-rose hover:from-sage/90 hover:to-dusty-rose/90 text-white text-xs py-1.5 h-8"
                >
                  {startingWorkflow === `${insight.id}-${tab}` ? (
                    'Starting...'
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1.5" />
                      Start Workflow
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-4 mt-4 border-t border-sage/10">
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
