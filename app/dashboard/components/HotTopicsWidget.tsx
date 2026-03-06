'use client';

import { useState, useRef, useEffect } from 'react';
import { Flame, Plus, X, Loader2, Newspaper } from 'lucide-react';

export interface UserNewsItem {
  id: string;
  title: string;
  addedAt: string;
}

interface Props {
  initialUserNews: UserNewsItem[];
}

export function HotTopicsWidget({ initialUserNews }: Props) {
  const [items, setItems] = useState<UserNewsItem[]>(initialUserNews);
  const [draft, setDraft] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleAdd() {
    const title = draft.trim();
    if (!title || isAdding) return;
    setIsAdding(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/user-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add');
      setItems(data.user_news);
      setDraft('');
      inputRef.current?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to add');
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch('/api/dashboard/user-news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      setItems(data.user_news);
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    }
  }

  return (
    <div className="bg-white border border-warm-border rounded-3xl p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-dusty-rose" />
        <h3 className="text-xs font-semibold text-sage/60 uppercase tracking-wider">My Hot Topics</h3>
      </div>

      <p className="text-[11px] text-sage/40 leading-relaxed mb-3">
        Add news or trends from your niche — we'll weave them into your editorial calendar.
      </p>

      {/* Input row */}
      <div className="flex gap-1.5 mb-3">
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="e.g. New gut-brain axis study…"
          className="flex-1 px-3 py-2 text-xs rounded-xl border border-sage/20 bg-cream/50 text-sage placeholder-sage/30 focus:outline-none focus:border-sage/50 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!draft.trim() || isAdding}
          className="w-8 h-8 flex items-center justify-center bg-sage hover:bg-sage/90 text-cream rounded-xl transition-colors disabled:opacity-40"
        >
          {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>

      {error && <p className="text-[11px] text-red-500 mb-2">{error}</p>}

      {/* News list */}
      {items.length > 0 ? (
        <ul className="space-y-1.5 max-h-48 overflow-y-auto">
          {items.map(item => (
            <li
              key={item.id}
              className="group flex items-start gap-2 px-2.5 py-2 rounded-xl bg-sage/[0.04] hover:bg-sage/[0.07] transition-colors"
            >
              <Newspaper className="w-3 h-3 text-dusty-rose/60 flex-shrink-0 mt-0.5" />
              <span className="flex-1 text-xs text-sage/80 leading-snug">{item.title}</span>
              <button
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 text-sage/25 hover:text-red-400 transition-all flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-sage/35 italic text-center py-3">
          No topics yet — add news from your niche above.
        </p>
      )}
    </div>
  );
}
