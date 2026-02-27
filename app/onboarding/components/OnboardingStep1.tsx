'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { OnboardingStepProps } from '@/lib/types/onboarding';

const NICHE_OPTIONS = [
  // Health & Wellness
  'Nutrition & Gut Health',
  'Fitness & Movement',
  'Mental Health & Mindset',
  'Holistic Wellness',
  "Women's Health",
  'Weight Loss',
  'Stress & Burnout',
  'Perimenopause & Menopause',
  'Skin & Beauty',
  // Business & Career
  'Business Coaching',
  'Entrepreneurship',
  'Personal Finance',
  'Productivity & Time Management',
  'Career Development',
  'Leadership',
  // Tech & Digital
  'Tech & SaaS',
  'AI & Automation',
  'No-Code / Low-Code',
  'Cybersecurity',
  'Web3 & Crypto',
  // Creator & Marketing
  'Content Creation',
  'Social Media Marketing',
  'Personal Branding',
  'Copywriting',
  'Email Marketing',
  // Education & Lifestyle
  'Life Coaching',
  'Parenting & Family',
  'Relationships',
  'Spirituality',
  'Travel & Lifestyle',
];

export default function OnboardingStep1({ data, onChange, onNext, onSkip }: OnboardingStepProps) {
  const [customInput, setCustomInput] = useState('');

  const toggleNiche = (niche: string) => {
    const current = data.niche_tags || [];
    if (current.includes(niche)) {
      onChange({ niche_tags: current.filter((n) => n !== niche) });
    } else {
      onChange({ niche_tags: [...current, niche] });
    }
  };

  const addCustomNiche = () => {
    const value = customInput.trim();
    if (!value) return;
    const current = data.niche_tags || [];
    if (!current.includes(value)) {
      onChange({ niche_tags: [...current, value] });
    }
    setCustomInput('');
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

          {/* Niche Tags — drives trend scraping */}
          <div>
            <label className="block text-sm font-medium text-sage mb-1">
              Your Niche <span className="text-dusty-rose">*</span>
            </label>
            <p className="text-xs text-sage/50 mb-3">
              Select all that apply or type your own — this powers your personalised trend feed.
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {NICHE_OPTIONS.map((niche) => (
                <button
                  key={niche}
                  type="button"
                  onClick={() => toggleNiche(niche)}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                    data.niche_tags?.includes(niche)
                      ? 'bg-dusty-rose text-cream'
                      : 'bg-sage/10 text-sage hover:bg-sage/20'
                  }`}
                >
                  {niche}
                </button>
              ))}
            </div>

            {/* Custom niche input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomNiche(); } }}
                placeholder="Add your own niche..."
                className="flex-1 px-4 py-2.5 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all text-sm"
              />
              <button
                type="button"
                onClick={addCustomNiche}
                disabled={!customInput.trim()}
                className="px-3 py-2.5 bg-sage/10 hover:bg-sage/20 text-sage rounded-2xl transition-colors disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Custom tags (not in preset list) */}
            {data.niche_tags?.filter((t) => !NICHE_OPTIONS.includes(t)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {data.niche_tags
                  .filter((t) => !NICHE_OPTIONS.includes(t))
                  .map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-dusty-rose text-cream text-sm font-medium rounded-2xl"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => toggleNiche(tag)}
                        className="text-cream/70 hover:text-cream transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}

            {data.niche_tags && data.niche_tags.length > 0 && (
              <p className="text-xs text-sage/50 mt-2">{data.niche_tags.length} selected</p>
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
