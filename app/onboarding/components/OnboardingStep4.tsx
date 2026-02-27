'use client';

import { Plus, X } from 'lucide-react';
import type { OnboardingStepProps, ContentPillar } from '@/lib/types/onboarding';

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

  const pillars: ContentPillar[] = data.content_pillars || [{ title: '', description: '' }];

  const updatePillar = (index: number, field: keyof ContentPillar, value: string) => {
    const updated = pillars.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    onChange({ content_pillars: updated });
  };

  const addPillar = () => {
    if (pillars.length < 5) {
      onChange({ content_pillars: [...pillars, { title: '', description: '' }] });
    }
  };

  const removePillar = (index: number) => {
    if (pillars.length > 1) {
      onChange({ content_pillars: pillars.filter((_, i) => i !== index) });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white rounded-3xl shadow-soft p-8">
        <h2 className="font-serif text-3xl text-sage mb-2">Content DNA</h2>
        <p className="text-sage/60 mb-8">Define your brand voice, content style, and pillars.</p>

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

          {/* Content Pillars */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-sage">
                Content Pillars
              </label>
              <span className="text-xs text-sage/40">{pillars.length} / 5</span>
            </div>
            <p className="text-xs text-sage/50 mb-3">
              The recurring themes your content is built around. Add 3–5 pillars.
            </p>

            <div className="space-y-3">
              {pillars.map((pillar, idx) => (
                <div key={idx} className="p-4 bg-sage/[0.03] rounded-2xl border border-sage/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-dusty-rose/15 text-dusty-rose text-xs font-semibold rounded-full flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={pillar.title}
                      onChange={(e) => updatePillar(idx, 'title', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all text-sm font-medium"
                      placeholder="Pillar title (e.g. Gut Health Basics)"
                    />
                    {pillars.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePillar(idx)}
                        className="text-sage/30 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={pillar.description}
                    onChange={(e) => updatePillar(idx, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none text-sm"
                    placeholder="One sentence describing what this pillar covers..."
                  />
                </div>
              ))}
            </div>

            {pillars.length < 5 && (
              <button
                type="button"
                onClick={addPillar}
                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-sage/25 text-sage/50 hover:border-sage/40 hover:text-sage/70 transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                Add pillar
              </button>
            )}
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
