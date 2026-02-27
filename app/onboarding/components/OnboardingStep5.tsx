'use client';

import type { OnboardingStepProps } from '@/lib/types/onboarding';
import { Sparkles } from 'lucide-react';

export default function OnboardingStep5({ data, onChange, onNext, onBack, onSkip }: OnboardingStepProps) {
  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white rounded-3xl shadow-soft p-8">
        <h2 className="font-serif text-3xl text-sage mb-2">Your Story</h2>
        <p className="text-sage/60 mb-8">The personal touch that makes your brand authentic and relatable.</p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-sage mb-1.5">
              Your personal story
            </label>
            <p className="text-xs text-sage/50 mb-2">What led you to do what you do today?</p>
            <textarea
              value={data.personal_story}
              onChange={(e) => onChange({ personal_story: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none"
              placeholder="Your origin story, turning point, motivation..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-1.5">
              What makes you legitimate?
            </label>
            <p className="text-xs text-sage/50 mb-2">Credentials, experience, training, past career...</p>
            <textarea
              value={data.legitimating_experience}
              onChange={(e) => onChange({ legitimating_experience: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none"
              placeholder="e.g. 12 years in corporate IT + nutrition certification..."
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
              className="bg-dusty-rose hover:bg-dusty-rose/90 text-cream font-medium px-8 py-3 rounded-2xl transition-colors inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate My Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
