'use client';

import { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  Users,
  Globe,
  Lightbulb,
  Instagram,
  ExternalLink,
  Copy,
  CheckCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Trend } from '@/lib/types';

interface Props {
  trend: Trend | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TrendDetailModal({ trend, isOpen, onClose }: Props) {
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const copyKeyword = async (keyword: string) => {
    await navigator.clipboard.writeText(keyword);
    setCopiedKeyword(keyword);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  if (!isOpen || !trend) return null;

  // Parse metadata for additional details
  const examples = trend.metadata?.examples || [];
  const keyPlayers = trend.metadata?.key_players || [];
  const momentum = trend.metadata?.momentum || 'Unknown';
  const geographicFocus = trend.metadata?.geographic_focus || [];
  const actionableInsight = trend.metadata?.actionable_insight || '';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-cream rounded-3xl shadow-soft-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-cream border-b border-sage/10 px-8 py-6 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-dusty-rose/20 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-dusty-rose" />
                </div>
                <span className="px-3 py-1 bg-sage/10 text-sage text-xs font-semibold rounded-full uppercase tracking-wide">
                  {trend.trend_type}
                </span>
                {trend.relevance_score && (
                  <span className="px-3 py-1 bg-dusty-rose/20 text-dusty-rose text-xs font-bold rounded-full">
                    {trend.relevance_score} / 100
                  </span>
                )}
              </div>
              <h2 className="font-serif text-3xl text-sage mb-2">
                {trend.title}
              </h2>
              {trend.description && (
                <p className="text-sage/80 leading-relaxed">
                  {trend.description}
                </p>
              )}
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-sage hover:bg-sage/10 -mr-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              {momentum && (
                <Card className="bg-white rounded-2xl shadow-soft p-4 border border-sage/5">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-dusty-rose" />
                    <div>
                      <p className="text-xs text-sage/60 uppercase tracking-wide font-semibold">
                        Momentum
                      </p>
                      <p className="text-sage font-bold">{momentum}</p>
                    </div>
                  </div>
                </Card>
              )}

              {trend.layer && (
                <Card className="bg-white rounded-2xl shadow-soft p-4 border border-sage/5">
                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-sage/60 uppercase tracking-wide font-semibold">
                        Layer
                      </p>
                      <p className="text-sage font-bold capitalize">
                        {trend.layer}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {geographicFocus.length > 0 && (
                <Card className="bg-white rounded-2xl shadow-soft p-4 border border-sage/5">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-sage" />
                    <div>
                      <p className="text-xs text-sage/60 uppercase tracking-wide font-semibold">
                        Geographic
                      </p>
                      <p className="text-sage font-bold">
                        {geographicFocus.join(', ')}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Keywords */}
            {trend.keywords && trend.keywords.length > 0 && (
              <div>
                <h3 className="font-serif text-xl text-sage mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-dusty-rose rounded-full" />
                  Related Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trend.keywords.map((keyword, idx) => (
                    <button
                      key={idx}
                      onClick={() => copyKeyword(`#${keyword}`)}
                      className="group px-4 py-2 bg-white border border-sage/10 rounded-full hover:border-dusty-rose transition-all flex items-center gap-2"
                    >
                      <span className="text-sage">#{keyword}</span>
                      {copiedKeyword === `#${keyword}` ? (
                        <CheckCircle className="w-3 h-3 text-dusty-rose" />
                      ) : (
                        <Copy className="w-3 h-3 text-sage/40 group-hover:text-dusty-rose" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Examples from Instagram */}
            {examples.length > 0 && (
              <div>
                <h3 className="font-serif text-xl text-sage mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-dusty-rose rounded-full" />
                  Real Examples from Instagram
                </h3>
                <div className="space-y-4">
                  {examples.map((example: any, idx: number) => (
                    <Card
                      key={idx}
                      className="bg-white rounded-2xl shadow-soft p-5 border border-sage/5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Instagram className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-sage">
                              {example.source || 'Instagram'}
                            </p>
                            {example.engagement && (
                              <span
                                className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                  example.engagement.toLowerCase() === 'high'
                                    ? 'bg-green-100 text-green-700'
                                    : example.engagement.toLowerCase() ===
                                      'medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {example.engagement} Engagement
                              </span>
                            )}
                          </div>
                          <p className="text-sage/80 leading-relaxed">
                            {example.content}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Key Players */}
            {keyPlayers.length > 0 && (
              <div>
                <h3 className="font-serif text-xl text-sage mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-dusty-rose rounded-full" />
                  Key Players & Influencers
                </h3>
                <div className="flex flex-wrap gap-3">
                  {keyPlayers.map((player: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-sage/10 rounded-full"
                    >
                      <Users className="w-4 h-4 text-dusty-rose" />
                      <span className="text-sage font-medium">{player}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Insight */}
            {actionableInsight && (
              <div>
                <h3 className="font-serif text-xl text-sage mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-dusty-rose rounded-full" />
                  How to Leverage This Trend
                </h3>
                <Card className="bg-gradient-to-br from-dusty-rose/10 to-sage/5 rounded-2xl p-6 border border-dusty-rose/20">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-dusty-rose/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-5 h-5 text-dusty-rose" />
                    </div>
                    <p className="text-sage leading-relaxed flex-1 pt-1">
                      {actionableInsight}
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {/* Source Link */}
            {trend.source_url && (
              <div className="pt-4 border-t border-sage/10">
                <a
                  href={trend.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-dusty-rose hover:text-dusty-rose/80 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    View Original Source
                  </span>
                </a>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-sage/40 text-center pt-2">
              Added on {new Date(trend.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
