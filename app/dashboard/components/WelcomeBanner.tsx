'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, TrendingUp, Lightbulb, CalendarDays } from 'lucide-react';

const QUICK_STARTS = [
  {
    icon: TrendingUp,
    label: 'Browse Niche Trends',
    description: "See what's trending in your space",
    href: '/dashboard',
    iconBg: 'bg-sage/10 text-sage',
  },
  {
    icon: Lightbulb,
    label: 'Generate Ideas',
    description: 'AI ideas for each content pillar',
    href: '/dashboard',
    iconBg: 'bg-dusty-rose/10 text-dusty-rose',
  },
  {
    icon: CalendarDays,
    label: 'Plan Your Month',
    description: 'Build your editorial calendar',
    href: '/editorial',
    iconBg: 'bg-sage/10 text-sage',
  },
];

interface Props {
  isFirstVisit: boolean;
  userName: string;
}

export function WelcomeBanner({ isFirstVisit, userName }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isFirstVisit && !localStorage.getItem('ov_welcome_dismissed')) {
      setVisible(true);
    }
  }, [isFirstVisit]);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('ov_welcome_dismissed', '1');
    fetch('/api/profile/dismiss-welcome', { method: 'PATCH' }).catch(() => {});
  };

  return (
    <div className="relative bg-gradient-to-r from-sage/8 to-dusty-rose/8 border border-sage/15 rounded-3xl p-5 mb-6">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 w-7 h-7 rounded-xl flex items-center justify-center text-sage/40 hover:bg-sage/10 hover:text-sage transition-all"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <p className="text-[10px] font-bold text-sage/40 uppercase tracking-widest mb-1">
        You're all set up
      </p>
      <h2 className="font-serif text-xl text-sage font-semibold mb-4">
        Welcome, {userName}. Here's where to start.
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {QUICK_STARTS.map(qs => {
          const Icon = qs.icon;
          return (
            <Link
              key={qs.label}
              href={qs.href}
              className="bg-white border border-warm-border rounded-2xl p-3.5 hover:border-sage/30 hover:shadow-soft transition-all"
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center mb-2 ${qs.iconBg}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs font-semibold text-sage leading-tight mb-0.5">{qs.label}</p>
              <p className="text-[11px] text-sage/50 leading-tight">{qs.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
