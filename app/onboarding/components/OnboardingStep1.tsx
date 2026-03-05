'use client';

import type { OnboardingStepProps } from '@/lib/types/onboarding';

const INDUSTRIES = [
  { label: 'Health & Wellness',     emoji: '🌿' },
  { label: 'Business & Coaching',   emoji: '💼' },
  { label: 'Tech & Digital',        emoji: '💻' },
  { label: 'Creator & Marketing',   emoji: '🎙️' },
  { label: 'Education & Training',  emoji: '🎓' },
  { label: 'Personal Development',  emoji: '🧠' },
  { label: 'Lifestyle & Culture',   emoji: '✨' },
  { label: 'Science & Research',    emoji: '🔬' },
  { label: 'Finance & Investing',   emoji: '📈' },
  { label: 'Other',                 emoji: '🌐' },
];

export default function OnboardingStep1({ data, onChange, onNext, onSkip }: OnboardingStepProps) {
  const toggleIndustry = (label: string) => {
    const current = data.primary_industry || [];
    if (current.includes(label)) {
      onChange({ primary_industry: current.filter((i) => i !== label) });
    } else {
      onChange({ primary_industry: [...current, label] });
    }
  };

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
              <label className="block text-sm font-medium text-sage mb-1.5">
                Target Audience Region
              </label>
              <input
                type="text"
                value={data.target_market}
                onChange={(e) => onChange({ target_market: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
                placeholder="e.g. International English-speaking"
              />
            </div>
          </div>

          {/* Primary Industry — multi-select */}
          <div>
            <label className="block text-sm font-medium text-sage mb-1">
              Primary Industry <span className="text-dusty-rose">*</span>
            </label>
            <p className="text-xs text-sage/50 mb-3">
              Select all that apply — this powers your personalised trend feed.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {INDUSTRIES.map(({ label, emoji }) => {
                const isSelected = data.primary_industry?.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleIndustry(label)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                      isSelected
                        ? 'border-dusty-rose bg-dusty-rose/10 text-dusty-rose'
                        : 'border-sage/15 bg-sage/[0.03] text-sage/70 hover:border-sage/30 hover:text-sage'
                    }`}
                  >
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
            {data.primary_industry && data.primary_industry.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-sage/60 mb-1.5">
                  Be more specific <span className="text-sage/40 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={data.industry_specifics || ''}
                  onChange={(e) => onChange({ industry_specifics: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all text-sm"
                  placeholder="Describe your specific focus area..."
                />
              </div>
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
