'use client';

import { Lightbulb, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export function StrategyPanel() {
  return (
    <Card className="bg-gradient-to-br from-sage/5 to-dusty-rose/5 rounded-3xl shadow-soft p-6 border-2 border-sage/10">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-sage" />
        <h2 className="font-serif text-2xl text-sage">Strategic Insights</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-sage mb-3">
            AI-Powered Content Validation
          </h3>
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

        <div className="pt-6 border-t border-sage/10">
          <h4 className="font-semibold text-sage/80 text-sm mb-3">
            Coming Soon: Automated Strategy Generation
          </h4>
          <p className="text-sm text-sage/60 leading-relaxed">
            Layer 3 strategic recommendations will synthesize macro and niche
            trends with scientific anchors to provide personalized content
            strategies. Available in Phase 2 with Inngest automation.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/admin/trends"
            className="text-sm text-sage/60 hover:text-sage transition-colors underline"
          >
            Manage Trends →
          </Link>
        </div>
      </div>
    </Card>
  );
}
