'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  CalendarDays,
  Lightbulb,
  FolderOpen,
  FlaskConical,
  Link2,
  Settings,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',          icon: LayoutDashboard, description: 'Overview and editorial calendar' },
  { href: '/editorial',    label: 'Editorial Calendar', icon: CalendarDays,    description: '4-week content planner' },
  { href: '/discover',     label: 'Discover',           icon: Lightbulb,       description: 'Trends and AI content ideas' },
  { href: '/projects',     label: 'Projects',           icon: FolderOpen,      description: 'Track your content pieces' },
  { href: '/lab',          label: 'OwnVoice Lab',       icon: FlaskConical,    description: 'AI content studio' },
  { href: '/integrations', label: 'Integrations',       icon: Link2,           description: 'Connect social accounts' },
  { href: '/profile',      label: 'Settings',           icon: Settings,        description: 'Pillars, niche, persona' },
];

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? NAV_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      )
    : NAV_ITEMS;

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setSelected(0); }, [query]);

  const go = (href: string) => { router.push(href); onClose(); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if      (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter')     { if (filtered[selected]) go(filtered[selected].href); }
    else if (e.key === 'Escape')    { onClose(); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-sage/10 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-soft-lg border border-warm-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-warm-border">
          <Search className="w-4 h-4 text-sage/40 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages and features…"
            className="flex-1 text-sm text-sage placeholder:text-sage/40 focus:outline-none bg-transparent"
          />
          <button
            onClick={onClose}
            className="text-sage/30 hover:text-sage/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="py-2 max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-sage/40 px-4 py-3 text-center">No results for &quot;{query}&quot;</p>
          ) : (
            filtered.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => go(item.href)}
                  onMouseEnter={() => setSelected(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
                    i === selected ? 'bg-sage/5' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-sage/[0.08] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-sage/60" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sage">{item.label}</p>
                    <p className="text-[11px] text-sage/40">{item.description}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Keyboard hints */}
        <div className="px-4 py-2 border-t border-warm-border flex items-center gap-4 text-[10px] text-sage/30">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
