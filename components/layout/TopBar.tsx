'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  CalendarDays,
  Lightbulb,
  FolderOpen,
  FlaskConical,
  Link2,
  Settings,
} from 'lucide-react';
import { CommandPalette } from './CommandPalette';

const PAGE_META: Record<string, { title: string; icon: React.ElementType }> = {
  '/dashboard':    { title: 'Dashboard',         icon: LayoutDashboard },
  '/editorial':    { title: 'Editorial Calendar', icon: CalendarDays    },
  '/discover':     { title: 'Discover',           icon: Lightbulb       },
  '/projects':     { title: 'Projects',           icon: FolderOpen      },
  '/lab':          { title: 'OwnVoice Lab',       icon: FlaskConical    },
  '/integrations': { title: 'Integrations',       icon: Link2           },
  '/profile':      { title: 'Settings',           icon: Settings        },
};

export function TopBar({ user }: { user: any }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const meta = Object.entries(PAGE_META).find(
    ([href]) => href === pathname || (href !== '/dashboard' && pathname?.startsWith(href))
  )?.[1];
  const Icon = meta?.icon;

  return (
    <>
      <div className="fixed top-0 left-16 right-0 h-14 bg-white border-b border-warm-border flex items-center px-6 gap-4 z-20">
        {/* Page title */}
        <div className="flex items-center gap-2 min-w-[180px]">
          {Icon && <Icon className="w-4 h-4 text-sage/40" />}
          <span className="font-serif text-base text-sage">{meta?.title ?? 'OwnVoice AI'}</span>
        </div>

        {/* Search trigger */}
        <button
          onClick={() => setOpen(true)}
          className="flex-1 max-w-sm flex items-center gap-2 h-8 px-3 bg-cream border border-warm-border rounded-xl text-xs text-sage/40 hover:border-sage/30 hover:text-sage/60 transition-colors"
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="flex-1 text-left">Search pages and content…</span>
          <kbd className="text-[10px] border border-sage/15 rounded px-1 py-0.5 font-mono text-sage/30">⌘K</kbd>
        </button>

        {/* User chip */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-sage/50 hidden sm:block">{user?.name?.split(' ')[0]}</span>
          <div className="w-7 h-7 rounded-full bg-dusty-rose flex items-center justify-center">
            <span className="text-white font-medium text-[11px]">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      </div>

      {open && <CommandPalette onClose={() => setOpen(false)} />}
    </>
  );
}
