'use client';

import type { OnboardingStepProps } from '@/lib/types/onboarding';

const FORMAT_OPTIONS = [
  'Face-cam educational',
  'Carousel / slides',
  'Reels / short-form video',
  'Stories',
  'Storytelling / transformation',
  'Live sessions',
];

export default function OnboardingStep4({ data, onChange, onNext, onBack, onSkip }: OnboardingStepProps) {
  const toggleFormat = (format: string) => {
    const current = data.preferred_format || [];
    if (current.includes(format)) {
      onChange({ preferred_format: current.filter((f) => f !== format) });
    } else {
      onChange({ preferred_format: [...current, format] });
    }
  };

  const updateBrandWord = (index: number, value: string) => {
    const words = [...(data.brand_words || ['', '', ''])];
    words[index] = value;
    onChange({ brand_words: words });
  };

  const updateInspirationAccount = (index: number, value: string) => {
    const accounts = [...(data.inspiration_accounts || ['', '', ''])];
    accounts[index] = value;
    onChange({ inspiration_accounts: accounts });
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white rounded-3xl shadow-soft p-8">
        <h2 className="font-serif text-3xl text-sage mb-2">Content DNA</h2>
        <p className="text-sage/60 mb-8">Define your brand voice and content style.</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-sage mb-1.5">Desired tone</label>
            <input
              type="text"
              value={data.desired_tone}
              onChange={(e) => onChange({ desired_tone: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
              placeholder="e.g. Expert, warm, sometimes provocative, science-backed..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-3">3 words that describe your brand</label>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="text"
                  value={data.brand_words?.[i] || ''}
                  onChange={(e) => updateBrandWord(i, e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
                  placeholder={`Word ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-3">3 accounts you admire (Instagram)</label>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="text"
                  value={data.inspiration_accounts?.[i] || ''}
                  onChange={(e) => updateInspirationAccount(i, e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
                  placeholder={`@account${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-3">Preferred content formats</label>
            <div className="flex flex-wrap gap-2">
              {FORMAT_OPTIONS.map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => toggleFormat(format)}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                    data.preferred_format?.includes(format)
                      ? 'bg-sage text-cream'
                      : 'bg-sage/10 text-sage hover:bg-sage/20'
                  }`}
                >
                  {format}
                </button>
              ))}
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
              className="bg-sage hover:bg-sage/90 text-cream font-medium px-8 py-3 rounded-2xl transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
