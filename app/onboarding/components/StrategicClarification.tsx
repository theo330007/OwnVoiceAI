'use client';

import { useRouter } from 'next/navigation';
import { Package, Users, Target, Newspaper, Globe, ArrowRight, Sparkles, Layers, MessageSquare } from 'lucide-react';
import type { StrategicProfile } from '@/lib/agents/onboarding-processor';

interface Props {
  profile: StrategicProfile;
}

const OBJECTIVE_COLORS: Record<string, string> = {
  'Visibility': 'bg-sage/10 text-sage border border-sage/20',
  'Connection': 'bg-dusty-rose/10 text-dusty-rose border border-dusty-rose/20',
  'Conversion': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Education & Authority': 'bg-blue-50 text-blue-700 border border-blue-200',
};

export default function StrategicClarification({ profile }: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-dusty-rose/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-dusty-rose" />
          </div>
          <h1 className="font-serif text-4xl text-sage mb-2">Your Brand Anchor</h1>
          <p className="text-sage/60 text-lg">
            Here&apos;s how our AI understands your brand. Review and launch when ready.
          </p>
        </div>

        {/* Strategic Clarification cards */}
        <div className="space-y-4 mb-8">

          {/* Offer */}
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-sage/10 rounded-xl flex items-center justify-center">
                <Package className="w-4 h-4 text-sage" />
              </div>
              <h2 className="font-semibold text-sage text-sm uppercase tracking-wider">Offer</h2>
            </div>
            <p className="text-sage leading-relaxed mb-3">{profile.offering}</p>
            {profile.offer_types?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.offer_types.map((t, i) => (
                  <span key={i} className="px-3 py-1 bg-sage/[0.08] text-sage text-xs font-medium rounded-full border border-sage/15">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Target */}
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-dusty-rose/10 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 text-dusty-rose" />
              </div>
              <h2 className="font-semibold text-sage text-sm uppercase tracking-wider">Target Audience</h2>
            </div>
            <p className="text-sage leading-relaxed">{profile.target_audience}</p>
            {profile.transformation && (
              <p className="mt-3 text-sm text-sage/60 border-l-2 border-dusty-rose/30 pl-3 italic">
                Promise: {profile.transformation}
              </p>
            )}
          </div>

          {/* Positioning */}
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-sage/10 rounded-xl flex items-center justify-center">
                <Target className="w-4 h-4 text-sage" />
              </div>
              <h2 className="font-semibold text-sage text-sm uppercase tracking-wider">Positioning</h2>
            </div>
            {profile.niche && (
              <span className="inline-block mb-3 px-3 py-1 bg-dusty-rose/10 text-dusty-rose text-xs font-semibold rounded-full">
                {profile.niche}
              </span>
            )}
            <p className="text-sage leading-relaxed">{profile.positioning}</p>
          </div>

          {/* Current News */}
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-sage/10 rounded-xl flex items-center justify-center">
                <Newspaper className="w-4 h-4 text-sage" />
              </div>
              <h2 className="font-semibold text-sage text-sm uppercase tracking-wider">Current News & Trends</h2>
            </div>
            <p className="text-sage leading-relaxed">{profile.hot_news}</p>
          </div>

          {/* Competition & Inspirations */}
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-dusty-rose/10 rounded-xl flex items-center justify-center">
                <Globe className="w-4 h-4 text-dusty-rose" />
              </div>
              <h2 className="font-semibold text-sage text-sm uppercase tracking-wider">Competition & Inspirations</h2>
            </div>
            {profile.competitors?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.competitors.map((c, i) => (
                  <span key={i} className="px-3 py-1.5 bg-sage/[0.08] text-sage text-sm font-medium rounded-xl border border-sage/15">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sage/40 italic text-sm">No competitors identified</p>
            )}
          </div>
        </div>

        {/* ── Editorial Positioning ── */}
        <div className="flex items-center gap-3 mt-10 mb-5">
          <h2 className="font-serif text-2xl text-sage">Editorial Positioning</h2>
          <span className="px-2.5 py-0.5 bg-dusty-rose/10 text-dusty-rose text-[10px] font-semibold rounded-full uppercase tracking-wider">
            AI-identified
          </span>
        </div>

        <div className="space-y-4 mb-8">

          {/* Content Pillars */}
          {profile.content_pillars?.length > 0 && (
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-sage/10 rounded-xl flex items-center justify-center">
                    <Layers className="w-4 h-4 text-sage" />
                  </div>
                  <h2 className="font-semibold text-sage text-sm uppercase tracking-wider">Content Pillars</h2>
                </div>
                <span className="text-xs text-sage/40 font-medium">{profile.content_pillars.length} pillars</span>
              </div>
              <div className="space-y-3">
                {profile.content_pillars.map((p, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-5 h-5 mt-0.5 bg-dusty-rose/15 text-dusty-rose text-xs font-semibold rounded-full flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-sage">{p.title}</p>
                      {p.description && (
                        <p className="text-xs text-sage/55 mt-0.5 leading-relaxed">{p.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verbal Territory */}
          {profile.verbal_territory && (
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-dusty-rose/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-dusty-rose" />
                </div>
                <h2 className="font-semibold text-sage text-sm uppercase tracking-wider">Verbal Territory</h2>
              </div>

              <div className="space-y-4">
                {profile.verbal_territory.tone && (
                  <div>
                    <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-1">Tone</p>
                    <p className="text-sage italic font-medium">{profile.verbal_territory.tone}</p>
                  </div>
                )}
                {profile.verbal_territory.style && (
                  <div>
                    <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-1">Style</p>
                    <p className="text-sage leading-relaxed">{profile.verbal_territory.style}</p>
                  </div>
                )}
                {profile.verbal_territory.preferred_vocabulary?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-2">Use →</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.verbal_territory.preferred_vocabulary.map((w, i) => (
                        <span key={i} className="px-3 py-1 bg-sage/10 text-sage text-xs font-medium rounded-full">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.verbal_territory.words_to_avoid?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-2">Avoid →</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.verbal_territory.words_to_avoid.map((w, i) => (
                        <span key={i} className="px-3 py-1 bg-dusty-rose/10 text-dusty-rose text-xs font-medium rounded-full line-through decoration-dusty-rose/50">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Post Objectives */}
          {profile.post_objectives?.length > 0 && (
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-sage/10 rounded-xl flex items-center justify-center">
                  <Target className="w-4 h-4 text-sage" />
                </div>
                <h2 className="font-semibold text-sage text-sm uppercase tracking-wider">Post Objectives</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {profile.post_objectives.map((obj, i) => (
                  <span
                    key={i}
                    className={`px-4 py-2 rounded-2xl text-sm font-medium ${OBJECTIVE_COLORS[obj] || 'bg-sage/10 text-sage border border-sage/20'}`}
                  >
                    {obj}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-3 bg-sage hover:bg-sage/90 text-cream font-semibold px-10 py-4 rounded-2xl transition-all shadow-md hover:shadow-lg text-lg"
          >
            Launch Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-3 text-xs text-sage/40">
            You can always refine your profile in Settings
          </p>
        </div>
      </div>
    </div>
  );
}
