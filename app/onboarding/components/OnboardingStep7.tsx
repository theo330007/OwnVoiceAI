'use client';

import { Plus, X } from 'lucide-react';
import type { OnboardingStepProps, ContentPillar } from '@/lib/types/onboarding';

export default function OnboardingStep7({ data, onChange, onNext, onBack, onSkip }: OnboardingStepProps) {
  const pillars: ContentPillar[] = data.content_pillars?.length
    ? data.content_pillars
    : [{ title: '', description: '' }];

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
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 bg-dusty-rose/10 rounded-full">
          <span className="text-xs font-semibold text-dusty-rose uppercase tracking-wider">Brand Anchor</span>
        </div>
        <h2 className="font-serif text-3xl text-sage mb-2 mt-2">Content Pillars</h2>
        <p className="text-sage/60 mb-8">
          Define 3–5 recurring themes your content is built around. These filter trend relevance to your brand.
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
