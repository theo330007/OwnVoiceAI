'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, FolderOpen, Link2, Settings, LogOut, CalendarDays } from 'lucide-react';
import { signOut } from '@/lib/auth';

interface Props {
  user: any;
}

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/editorial', icon: CalendarDays, label: 'Editorial' },
  { href: '/integrations', icon: Link2, label: 'Integrations' },
  { href: '/profile', icon: Settings, label: 'Settings' },
];

function SidebarItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} className="group relative flex items-center justify-center">
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
          active
            ? 'bg-sage text-cream shadow-soft'
            : 'text-sage/40 hover:bg-sage/10 hover:text-sage'
        }`}
      >
        <Icon className="w-4.5 h-4.5" strokeWidth={active ? 2.5 : 2} />
      </div>
      {/* Tooltip */}
      <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-sage-700 text-cream text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-soft">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-sage-700" />
      </div>
    </Link>
  );
}

export function DashboardSidebar({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-16 bg-white border-r border-warm-border flex flex-col items-center py-4 z-30">
      {/* Logo */}
      <Link href="/dashboard" className="mb-8 flex items-center justify-center">
        <div className="w-10 h-10 bg-sage rounded-2xl flex items-center justify-center shadow-soft">
          <span className="text-cream font-serif text-lg font-bold">O</span>
        </div>
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-2 flex-1">
        {NAV_ITEMS.map(({ href, icon, label }) => (
          <SidebarItem
            key={label}
            href={href}
            icon={icon}
            label={label}
            active={pathname === href || (href !== '/dashboard' && pathname?.startsWith(href))}
          />
        ))}
      </nav>

      {/* Bottom: avatar + logout */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <div className="w-8 h-8 rounded-full bg-dusty-rose flex items-center justify-center">
          <span className="text-white font-medium text-xs">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="group relative w-10 h-10 rounded-2xl flex items-center justify-center text-sage/30 hover:bg-red-50 hover:text-red-500 transition-all"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-sage-700 text-cream text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-soft">
            Logout
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-sage-700" />
          </div>
        </button>
      </div>
    </aside>
  );
}
