'use client';

import { Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ValidationResult as Result } from '@/lib/types';

export function ValidationResult({ result }: { result: Result }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyHook = async (hook: string, index: number) => {
    await navigator.clipboard.writeText(hook);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="max-w-3xl p-8 bg-cream/50 rounded-3xl shadow-soft-lg border border-sage/5">
      {/* Relevance Score */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-2xl text-sage">Relevance Score</h3>
          <div className="text-4xl font-bold text-dusty-rose">
            {result.relevance_score}/100
          </div>
        </div>
        <div className="w-full bg-sage/10 rounded-full h-3">
          <div
            className="bg-dusty-rose h-3 rounded-full transition-all duration-500"
            style={{ width: `${result.relevance_score}%` }}
          />
        </div>
      </div>

      {/* Trend Alignment */}
      <div className="mb-8">
        <h3 className="font-serif text-xl text-sage mb-4">Trend Alignment</h3>
        <p className="text-sage/80 mb-4 leading-relaxed">
          {result.trend_alignment.alignment_reasoning}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sage/70 text-sm mb-2 uppercase tracking-wide">
              Macro Trends
            </h4>
            <ul className="space-y-2">
              {result.trend_alignment.macro_trends.length > 0 ? (
                result.trend_alignment.macro_trends.map((trend, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-dusty-rose mt-1 flex-shrink-0" />
                    <span className="text-sm text-sage">{trend}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-sage/50">No macro trends matched</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sage/70 text-sm mb-2 uppercase tracking-wide">
              Niche Trends
            </h4>
            <ul className="space-y-2">
              {result.trend_alignment.niche_trends.length > 0 ? (
                result.trend_alignment.niche_trends.map((trend, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-dusty-rose mt-1 flex-shrink-0" />
                    <span className="text-sm text-sage">{trend}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-sage/50">No niche trends matched</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Scientific Anchor */}
      <div className="mb-8">
        <h3 className="font-serif text-xl text-sage mb-4">Scientific Anchor</h3>
        <div className="bg-white p-6 rounded-2xl border border-sage/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-sage/70 uppercase tracking-wide">
              Credibility Score
            </span>
            <span className="text-lg font-bold text-dusty-rose">
              {result.scientific_anchor.credibility_score}/100
            </span>
          </div>
          <p className="text-sage/80 mb-4 leading-relaxed">
            {result.scientific_anchor.key_findings}
          </p>
          {result.scientific_anchor.sources &&
            result.scientific_anchor.sources.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-sage/70 uppercase tracking-wide mb-2">
                  Sources
                </p>
                {result.scientific_anchor.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-sage/60 hover:text-sage transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span>{source.title}</span>
                  </a>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Refined Hooks */}
      <div>
        <h3 className="font-serif text-xl text-sage mb-4">
          Refined Hook Variations
        </h3>
        <div className="space-y-4">
          {result.refined_hooks.map((hook, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl flex justify-between items-start gap-4 border border-sage/10"
            >
              <div className="flex-1">
                <span className="text-xs font-semibold text-dusty-rose mb-2 block uppercase tracking-wide">
                  Variation {idx + 1}
                </span>
                <p className="text-sage leading-relaxed">{hook}</p>
              </div>
              <Button
                onClick={() => copyHook(hook, idx)}
                variant="ghost"
                size="sm"
                className="text-sage hover:bg-sage/10 flex-shrink-0"
              >
                {copiedIndex === idx ? (
                  <CheckCircle className="w-5 h-5 text-dusty-rose" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      {result.additional_notes && (
        <div className="mt-8 p-6 bg-sage/5 rounded-2xl border border-sage/10">
          <h4 className="font-semibold text-sage mb-2">Additional Insights</h4>
          <p className="text-sage/80 text-sm leading-relaxed">
            {result.additional_notes}
          </p>
        </div>
      )}
    </Card>
  );
}
