'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, FolderOpen, ChevronDown, Shield } from 'lucide-react';
import { signOut } from '@/lib/auth';

interface NavbarProps {
  user: any;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Don't show navbar where the sidebar is active (replaces it)
  const SIDEBAR_ROUTES = ['/dashboard', '/lab', '/projects', '/profile', '/integrations'];
  if (
    pathname === '/' ||
    pathname?.startsWith('/auth') ||
    SIDEBAR_ROUTES.some((r) => pathname?.startsWith(r))
  ) {
    return null;
  }

  // Don't show navbar if no user
  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-sage/10 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage rounded-2xl flex items-center justify-center">
              <span className="text-cream font-serif text-xl font-bold">O</span>
            </div>
            <span className="font-serif text-xl text-sage hidden sm:block">
              OwnVoice AI
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {user.role === 'admin' ? (
              <Link
                href="/admin/dashboard"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/admin/dashboard'
                    ? 'text-sage'
                    : 'text-sage/60 hover:text-sage'
                }`}
              >
                Admin Dashboard
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'text-sage'
                    : 'text-sage/60 hover:text-sage'
                }`}
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/projects"
              className={`text-sm font-medium transition-colors ${
                pathname?.startsWith('/projects')
                  ? 'text-sage'
                  : 'text-sage/60 hover:text-sage'
              }`}
            >
              Projects
            </Link>
            {user.role !== 'admin' && (
              <Link
                href="/lab"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/lab'
                    ? 'text-sage'
                    : 'text-sage/60 hover:text-sage'
                }`}
              >
                OwnVoice Lab
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-2xl hover:bg-sage/5 transition-colors"
            >
              <div className="w-8 h-8 bg-dusty-rose rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-sage">{user.name}</p>
                <p className="text-xs text-sage/50">{user.email}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-sage/60 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-soft-lg border border-sage/10 py-2">
                <Link
                  href="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-sage/5 transition-colors"
                >
                  <User className="w-4 h-4 text-sage/60" />
                  <span className="text-sm text-sage">View Profile</span>
                </Link>

                <Link
                  href="/projects"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-sage/5 transition-colors"
                >
                  <FolderOpen className="w-4 h-4 text-sage/60" />
                  <span className="text-sm text-sage">My Projects</span>
                </Link>

                {user.role === 'admin' && (
                  <>
                    <div className="border-t border-sage/10 my-2"></div>
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-sage/5 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-sage/60" />
                      <span className="text-sm text-sage font-medium">Admin Dashboard</span>
                    </Link>
                  </>
                )}

                <div className="border-t border-sage/10 my-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
