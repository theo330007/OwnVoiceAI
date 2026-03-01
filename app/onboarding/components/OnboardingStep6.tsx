'use client';

import type { OnboardingStepProps } from '@/lib/types/onboarding';

const INDUSTRIES = [
  { label: 'Fertility & Hormones', emoji: '🌸' },
  { label: 'Nutrition & Dietetics', emoji: '🥗' },
  { label: 'Mental Health & Wellness', emoji: '🧠' },
  { label: 'Fitness & Movement', emoji: '💪' },
  { label: 'Sleep Health', emoji: '🌙' },
  { label: 'Skin & Beauty', emoji: '✨' },
  { label: 'Weight Management', emoji: '⚖️' },
  { label: 'Holistic Health', emoji: '🌿' },
  { label: 'Women\'s Health', emoji: '♀️' },
  { label: 'Gut Health', emoji: '🫀' },
  { label: 'Chronic Disease', emoji: '🩺' },
  { label: 'Stress & Burnout', emoji: '🧘' },
  { label: 'Mindfulness', emoji: '☮️' },
  { label: 'Sexual Health', emoji: '💛' },
  { label: 'Aging & Longevity', emoji: '🌱' },
];

export default function OnboardingStep6({ data, onChange, onNext, onBack, onSkip }: OnboardingStepProps) {
  const selected = data.primary_industry || '';

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white rounded-3xl shadow-soft p-8">
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 bg-dusty-rose/10 rounded-full">
          <span className="text-xs font-semibold text-dusty-rose uppercase tracking-wider">Brand Anchor</span>
        </div>
        <h2 className="font-serif text-3xl text-sage mb-2 mt-2">Your Primary Industry</h2>
        <p className="text-sage/60 mb-8">
          Select your main focus area. This drives terminology across the app and powers your trend feed.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {INDUSTRIES.map(({ label, emoji }) => {
            const isSelected = selected === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onChange({ primary_industry: label })}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                  isSelected
                    ? 'border-dusty-rose bg-dusty-rose/10 text-dusty-rose ring-2 ring-dusty-rose/20'
                    : 'border-sage/15 bg-sage/[0.03] text-sage hover:border-sage/30 hover:bg-sage/[0.06]'
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs font-medium leading-tight">{label}</span>
              </button>
            );
          })}
        </div>

        {selected && (
          <p className="mt-4 text-sm text-sage/60 text-center">
            Selected: <span className="font-semibold text-sage">{selected}</span>
          </p>
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
