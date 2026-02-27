'use client';

import type { OnboardingStepProps } from '@/lib/types/onboarding';

const OFFER_TYPES = [
  'Online course',
  '1:1 Consulting',
  'Group program',
  'Membership',
  'Physical product',
  'Digital product',
];

export default function OnboardingStep2({ data, onChange, onNext, onBack, onSkip }: OnboardingStepProps) {
  const toggleOfferType = (type: string) => {
    const current = data.offer_type || [];
    if (current.includes(type)) {
      onChange({ offer_type: current.filter((t) => t !== type) });
    } else {
      onChange({ offer_type: [...current, type] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white rounded-3xl shadow-soft p-8">
        <h2 className="font-serif text-3xl text-sage mb-2">Your Offer</h2>
        <p className="text-sage/60 mb-8">Tell us about what you sell and your business model.</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-sage mb-3">Type of offer (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {OFFER_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleOfferType(type)}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                    data.offer_type?.includes(type)
                      ? 'bg-sage text-cream'
                      : 'bg-sage/10 text-sage hover:bg-sage/20'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-1.5">
              Describe your main offer in 2 sentences
            </label>
            <textarea
              value={data.offer_description}
              onChange={(e) => onChange({ offer_description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none"
              placeholder="What do you offer and who is it for?"
            />
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
