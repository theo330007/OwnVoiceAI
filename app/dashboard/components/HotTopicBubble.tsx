'use client';

import { useState } from 'react';
import { ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';

export function HotTopicBubble() {
  const [topic, setTopic]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [savedDay, setSavedDay] = useState<string>('tomorrow');
  const [dismissed, setDismissed] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  if (dismissed) return null;

  const handleSubmit = async () => {
    if (!topic.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Not signed in'); return; }

      const { data: profile } = await supabase
        .from('users')
        .select('metadata')
        .eq('id', user.id)
        .single();

      // Save hot_topic for priority editorial injection
      const updatedMetadata = {
        ...(profile?.metadata ?? {}),
        hot_topic: topic.trim(),
        hot_topic_set_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('users')
        .update({ metadata: updatedMetadata })
        .eq('id', user.id);

      if (updateError) throw new Error(updateError.message);

      // Append to user_news list (shown in dashboard widget & profile page)
      const newsRes = await fetch('/api/dashboard/user-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: topic.trim() }),
      });
      if (!newsRes.ok) {
        const data = await newsRes.json();
        throw new Error(data.error || 'Failed to add to hot topics list');
      }

      // Add a quick post for tomorrow in the calendar
      const calRes = await fetch('/api/dashboard/quick-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      if (calRes.ok) {
        const calData = await calRes.json();
        setSavedDay(calData.day_name ?? 'tomorrow');
      }

      setSaved(true);
      setTimeout(() => setDismissed(true), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative mb-5">
      {/* Animated attention ring */}
      <div className="absolute -inset-[3px] rounded-[26px] bg-gradient-to-r from-amber-400/40 via-dusty-rose/30 to-amber-400/40 animate-pulse" />

      <div className="relative bg-white border border-amber-200/70 rounded-3xl p-4 shadow-soft overflow-hidden">
        {/* Subtle shimmer strip at top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />

        {saved ? (
          <div className="py-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm font-medium text-sage">Added to <strong>{savedDay}</strong>'s calendar — review it in Editorial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm font-medium text-sage">Appended to Hot Topics in your Profile</span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base animate-bounce leading-none">🔥</span>
                <p className="text-sm font-semibold text-sage">What's hot in your niche?</p>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="text-sage/25 hover:text-sage/50 transition-colors mt-0.5 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-sage/50 mb-3 leading-relaxed">
              Tell us what's trending and we'll weave it into your content strategy.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="e.g. gut microbiome reset…"
                className="flex-1 text-xs text-sage bg-sage/[0.03] border border-sage/10 rounded-xl px-3 py-2 placeholder:text-sage/30 focus:outline-none focus:border-sage/30 transition-colors"
              />
              <button
                onClick={handleSubmit}
                disabled={!topic.trim() || saving}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-dusty-rose hover:bg-dusty-rose/90 text-cream transition-colors disabled:opacity-40 flex-shrink-0"
              >
                {saving
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <ArrowRight className="w-3.5 h-3.5" />
                }
              </button>
            </div>
            {error && <p className="text-[11px] text-red-500 mt-2">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
