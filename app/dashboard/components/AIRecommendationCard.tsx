import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface StrategicInsight {
  id: string;
  trend_title: string;
  content_ideas: {
    educational: { hook: string; concept: string; cta: string };
    [key: string]: { hook: string; concept: string; cta: string };
  };
  created_at: string;
}

interface Props {
  insight?: StrategicInsight | null;
}

export function AIRecommendationCard({ insight }: Props) {
  if (!insight) {
    return (
      <div className="bg-sage rounded-3xl p-6 text-cream">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-cream/70" />
          <span className="text-xs font-semibold tracking-widest uppercase text-cream/60">
            AI Recommendation
          </span>
        </div>
        <h3 className="font-serif text-xl mb-3 leading-snug">
          Your strategy is taking shape
        </h3>
        <p className="text-cream/70 text-sm leading-relaxed mb-5">
          Generate a strategic insight from any niche trend to receive personalised content recommendations.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-cream/80 hover:text-cream text-sm font-medium transition-colors"
        >
          Explore trends below
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const hook = insight.content_ideas?.educational?.hook || '';

  return (
    <div className="bg-sage rounded-3xl p-6 text-cream">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-cream/70" />
        <span className="text-xs font-semibold tracking-widest uppercase text-cream/60">
          AI Recommendation
        </span>
      </div>

      <h3 className="font-serif text-xl mb-3 leading-snug line-clamp-2">
        {insight.trend_title}
      </h3>

      {hook && (
        <p className="text-cream/75 text-sm italic leading-relaxed mb-5 line-clamp-3">
          "{hook}"
        </p>
      )}

      <Link
        href="/lab"
        className="inline-flex items-center gap-2 bg-cream/10 hover:bg-cream/20 text-cream px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
      >
        Create Content
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
