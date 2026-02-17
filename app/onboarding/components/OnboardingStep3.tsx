'use client';

import type { OnboardingStepProps } from '@/lib/types/onboarding';

export default function OnboardingStep3({ data, onChange, onNext, onBack, onSkip }: OnboardingStepProps) {
  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white rounded-3xl shadow-soft p-8">
        <h2 className="font-serif text-3xl text-sage mb-2">Strategic Positioning</h2>
        <p className="text-sage/60 mb-8">This is the heart of your brand. Take your time here.</p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-sage mb-1.5">
              What specific problem do you solve?
            </label>
            <textarea
              value={data.problem_solved}
              onChange={(e) => onChange({ problem_solved: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none"
              placeholder="Describe the pain point you address..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-1.5">
              For whom exactly? (target audience)
            </label>
            <textarea
              value={data.target_audience}
              onChange={(e) => onChange({ target_audience: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none"
              placeholder="Age, profile, situation, mindset..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-1.5">
              What transformation do you promise?
            </label>
            <textarea
              value={data.transformation}
              onChange={(e) => onChange({ transformation: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none"
              placeholder="What does the &apos;after&apos; look like for your clients?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-1.5">
              How are you different from others?
            </label>
            <textarea
              value={data.differentiation}
              onChange={(e) => onChange({ differentiation: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none"
              placeholder="Your unique approach, method, perspective..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-1.5">
              What strong belief do you hold?
            </label>
            <textarea
              value={data.core_belief}
              onChange={(e) => onChange({ core_belief: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none"
              placeholder="A conviction that drives your work..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-1.5">
              What are you against?
            </label>
            <textarea
              value={data.opposition}
              onChange={(e) => onChange({ opposition: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none"
              placeholder="What practices or mindsets do you oppose?"
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
