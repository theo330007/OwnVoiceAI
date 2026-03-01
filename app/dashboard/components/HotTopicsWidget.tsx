'use client';

import { useState } from 'react';
import { Flame, RefreshCcw, Loader2 } from 'lucide-react';

interface Props {
  initialHotNews: string;
}

export function HotTopicsWidget({ initialHotNews }: Props) {
  const [hotNews, setHotNews] = useState(initialHotNews);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/profile/refresh-hot-topics', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to refresh');
      setHotNews(data.hot_news);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-white border border-warm-border rounded-3xl p-5 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-dusty-rose" />
          <h3 className="text-xs font-semibold text-sage/60 uppercase tracking-wider">My Hot Topics</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Refresh with AI"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sage/10 hover:bg-sage/20 text-sage text-[11px] font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {isRefreshing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-2">{error}</p>
      )}

      {hotNews ? (
        <p className="text-sm text-sage/80 leading-relaxed">{hotNews}</p>
      ) : (
        <p className="text-sm text-sage/40 italic">
          No hot topics yet — click Refresh to generate AI-curated trends for your niche.
        </p>
      )}
    </div>
  );
}
