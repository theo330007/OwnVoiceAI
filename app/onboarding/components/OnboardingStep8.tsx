'use client';

import type { OnboardingStepProps } from '@/lib/types/onboarding';

const VOICE_KEYWORDS = [
  'Minimalist',
  'Scientific',
  'Empathetic',
  'Playful',
  'Authoritative',
  'Conversational',
  'Inspiring',
  'Educational',
  'Raw & Honest',
  'Polished',
  'Nurturing',
  'Bold',
];

export default function OnboardingStep8({ data, onChange, onNext, onBack, onSkip }: OnboardingStepProps) {
  const selectedKeywords = data.voice_keywords || [];

  const toggleKeyword = (kw: string) => {
    if (selectedKeywords.includes(kw)) {
      onChange({ voice_keywords: selectedKeywords.filter((k) => k !== kw) });
    } else {
      onChange({ voice_keywords: [...selectedKeywords, kw] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white rounded-3xl shadow-soft p-8">
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 bg-dusty-rose/10 rounded-full">
          <span className="text-xs font-semibold text-dusty-rose uppercase tracking-wider">Brand Anchor</span>
        </div>
        <h2 className="font-serif text-3xl text-sage mb-2 mt-2">Brand Voice</h2>
        <p className="text-sage/60 mb-8">
          Tell us who you are in a sentence or two, and pick the words that best describe how you communicate.
          Our AI will use this to keep every piece of content sounding like <em>you</em>.
        </p>

        <div className="space-y-6">
          {/* Short bio */}
          <div>
            <label className="block text-sm font-medium text-sage mb-1.5">
              Short bio <span className="text-sage/40 font-normal">(1–2 sentences)</span>
            </label>
            <textarea
              value={data.brand_bio || ''}
              onChange={(e) => onChange({ brand_bio: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none"
              placeholder="e.g. I'm a certified nutritionist helping busy moms heal their gut and reclaim their energy through simple, science-backed habits."
            />
          </div>

          {/* Voice keywords */}
          <div>
            <label className="block text-sm font-medium text-sage mb-1.5">
              Voice keywords <span className="text-sage/40 font-normal">(pick all that fit)</span>
            </label>
            <div className="flex flex-wrap gap-2 mt-3">
              {VOICE_KEYWORDS.map((kw) => {
                const isSelected = selectedKeywords.includes(kw);
                return (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => toggleKeyword(kw)}
                    className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-sage text-cream'
                        : 'bg-sage/10 text-sage hover:bg-sage/20'
                    }`}
                  >
                    {kw}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-10">
          <button
            onClick={onSkip}
            className="text-sage/50 hover:text-sage/70 text-sm transition-colors"
          >
            Skip for now
          </button>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="border border-sage/20 hover:border-sage/40 text-sage font-medium px-6 py-3 rounded-2xl transition-colors"
            >
              Back
            </button>
            <button
              onClick={onNext}
              className="bg-dusty-rose hover:bg-dusty-rose/90 text-cream font-medium px-8 py-3 rounded-2xl transition-colors"
            >
              Complete Profile →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
