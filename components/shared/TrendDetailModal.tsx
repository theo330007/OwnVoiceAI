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
  CalendarPlus,
  CheckCircle2,
  Loader2,
  LayoutGrid,
  Video,
  BookHeart,
  ShoppingBag,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Trend } from '@/lib/types';

interface Props {
  trend: Trend | null;
  isOpen: boolean;
  onClose: () => void;
  pillars?: { title: string }[];
}

const SCHEDULE_FORMATS = [
  { key: 'carousel',     label: 'Carousel', icon: LayoutGrid },
  { key: 'reel',         label: 'Reel',     icon: Video },
  { key: 'storytelling', label: 'Story',    icon: BookHeart },
  { key: 'sales',        label: 'Sales',    icon: ShoppingBag },
] as const;

export function TrendDetailModal({ trend, isOpen, onClose, pillars = [] }: Props) {
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const [calFormat, setCalFormat] = useState('carousel');
  const [calPillar, setCalPillar] = useState(pillars[0]?.title || '');
  const [calState, setCalState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [calResult, setCalResult] = useState<{ date: string; day_name: string } | null>(null);

  const handleCalSchedule = async () => {
    if (!trend) return;
    setCalState('loading');
    try {
      const res = await fetch('/api/ideas/schedule-from-trend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trendTitle: trend.title, trendDescription: trend.description, format: calFormat, pillar: calPillar }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCalResult(data);
      setCalState('done');
      setTimeout(() => { setCalState('idle'); setCalResult(null); }, 3000);
    } catch {
      setCalState('error');
      setTimeout(() => setCalState('idle'), 2000);
    }
  };

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
  const contentIdeas = trend.metadata?.content_ideas || [];
  const hookTemplates = trend.metadata?.hook_templates || [];
  const contentFormats = trend.metadata?.content_formats || [];
  const whyItWorks = trend.metadata?.why_it_works || '';

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

            {/* Why It Works */}
            {whyItWorks && (
              <div>
                <h3 className="font-serif text-xl text-sage mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-dusty-rose rounded-full" />
                  🧠 Why This Works
                </h3>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                  <p className="text-sage leading-relaxed italic">
                    "{whyItWorks}"
                  </p>
                </Card>
              </div>
            )}

            {/* Content Ideas for Creators */}
            {contentIdeas.length > 0 && (
              <div>
                <h3 className="font-serif text-xl text-sage mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-dusty-rose rounded-full" />
                  💡 Content Ideas You Can Create RIGHT NOW
                </h3>
                <div className="grid gap-3">
                  {contentIdeas.map((idea: string, idx: number) => (
                    <Card
                      key={idx}
                      className="bg-gradient-to-r from-dusty-rose/5 to-sage/5 rounded-2xl p-5 border border-dusty-rose/20 hover:border-dusty-rose/40 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-dusty-rose text-white rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm group-hover:scale-110 transition-transform">
                          {idx + 1}
                        </div>
                        <p className="text-sage leading-relaxed flex-1 pt-0.5 font-medium">
                          {idea}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Hook Templates */}
            {hookTemplates.length > 0 && (
              <div>
                <h3 className="font-serif text-xl text-sage mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-dusty-rose rounded-full" />
                  🎣 Hook Templates (Click to Copy)
                </h3>
                <div className="space-y-3">
                  {hookTemplates.map((hook: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        navigator.clipboard.writeText(hook);
                        setCopiedKeyword(hook);
                        setTimeout(() => setCopiedKeyword(null), 2000);
                      }}
                      className="w-full text-left bg-white rounded-2xl p-5 border border-sage/10 hover:border-dusty-rose hover:shadow-soft transition-all group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sage leading-relaxed flex-1 font-medium group-hover:text-dusty-rose transition-colors">
                          {hook}
                        </p>
                        {copiedKeyword === hook ? (
                          <CheckCircle className="w-5 h-5 text-dusty-rose flex-shrink-0" />
                        ) : (
                          <Copy className="w-5 h-5 text-sage/40 group-hover:text-dusty-rose flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content Formats */}
            {contentFormats.length > 0 && (
              <div>
                <h3 className="font-serif text-xl text-sage mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-dusty-rose rounded-full" />
                  📱 Best Content Formats
                </h3>
                <div className="flex flex-wrap gap-3">
                  {contentFormats.map((format: string, idx: number) => (
                    <div
                      key={idx}
                      className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold shadow-soft hover:shadow-soft-lg transition-all"
                    >
                      {format}
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
                  ⚡ Quick Win Strategy
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

            {/* Add to Calendar */}
            <div className="border-t border-sage/10 pt-6">
              <h3 className="font-serif text-xl text-sage mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-sage rounded-full" />
                Add to My Calendar
              </h3>
              {calState === 'done' && calResult ? (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-100 rounded-2xl">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="text-sm text-sage font-medium">
                    Added · {calResult.day_name.slice(0, 3)} {new Date(calResult.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-sage/[0.03] border border-sage/10 rounded-2xl space-y-3">
                  {/* Format */}
                  <div className="flex gap-2">
                    {SCHEDULE_FORMATS.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setCalFormat(key)}
                        className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                          calFormat === key ? 'bg-sage text-cream' : 'bg-white text-sage/50 hover:text-sage border border-sage/10'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                  {/* Pillar */}
                  {pillars.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {pillars.map(p => (
                        <button
                          key={p.title}
                          onClick={() => setCalPillar(p.title)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            calPillar === p.title ? 'bg-dusty-rose text-cream' : 'bg-white text-sage/50 border border-sage/15 hover:border-sage/30'
                          }`}
                        >
                          {p.title}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handleCalSchedule}
                    disabled={calState === 'loading'}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-sage text-cream rounded-xl text-sm font-semibold hover:bg-sage/90 transition-colors disabled:opacity-60"
                  >
                    {calState === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
                    {calState === 'loading' ? 'Adding…' : 'Add to Calendar'}
                  </button>
                  {calState === 'error' && <p className="text-xs text-red-500 text-center">Failed — try again</p>}
                </div>
              )}
            </div>

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
