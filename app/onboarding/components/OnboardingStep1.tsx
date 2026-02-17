'use client';

import type { OnboardingStepProps } from '@/lib/types/onboarding';

export default function OnboardingStep1({ data, onChange, onNext, onSkip }: OnboardingStepProps) {
  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white rounded-3xl shadow-soft p-8">
        <h2 className="font-serif text-3xl text-sage mb-2">Tell us about yourself</h2>
        <p className="text-sage/60 mb-8">Let&apos;s start with the basics about you and your business.</p>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage mb-1.5">First Name</label>
              <input
                type="text"
                value={data.first_name}
                onChange={(e) => onChange({ first_name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage mb-1.5">Last Name</label>
              <input
                type="text"
                value={data.last_name}
                onChange={(e) => onChange({ last_name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-1.5">Business Name</label>
            <input
              type="text"
              value={data.business_name}
              onChange={(e) => onChange({ business_name: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
              placeholder="Your brand or company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-1.5">Website</label>
            <input
              type="url"
              value={data.website}
              onChange={(e) => onChange({ website: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage mb-1.5">Instagram</label>
              <input
                type="text"
                value={data.instagram}
                onChange={(e) => onChange({ instagram: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
                placeholder="@yourhandle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage mb-1.5">TikTok</label>
              <input
                type="text"
                value={data.tiktok}
                onChange={(e) => onChange({ tiktok: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
                placeholder="@yourhandle"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage mb-1.5">Country</label>
              <input
                type="text"
                value={data.country}
                onChange={(e) => onChange({ country: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
                placeholder="e.g. Singapore"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage mb-1.5">Target Market</label>
              <input
                type="text"
                value={data.target_market}
                onChange={(e) => onChange({ target_market: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
                placeholder="e.g. International English-speaking"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-1.5">How long have you been in business?</label>
            <input
              type="text"
              value={data.years_in_business}
              onChange={(e) => onChange({ years_in_business: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
              placeholder="e.g. Since 2017, 3 years..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-3">Employment status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="employment"
                  checked={data.employment_status === 'full-time'}
                  onChange={() => onChange({ employment_status: 'full-time' })}
                  className="w-4 h-4 text-sage accent-sage"
                />
                <span className="text-sage">Full-time</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="employment"
                  checked={data.employment_status === 'transitioning'}
                  onChange={() => onChange({ employment_status: 'transitioning' })}
                  className="w-4 h-4 text-sage accent-sage"
                />
                <span className="text-sage">Transitioning</span>
              </label>
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
          <button
            onClick={onNext}
            className="bg-sage hover:bg-sage/90 text-cream font-medium px-8 py-3 rounded-2xl transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
