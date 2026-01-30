'use server';

import { getCurrentUser } from './auth';
import { redirect } from 'next/navigation';
import type { User, UserRole } from './types/user';

/**
 * Requires the current user to be authenticated and have admin role
 * Redirects to login if not authenticated, or to dashboard if not admin
 */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  if (user.role !== 'admin') {
    // User is authenticated but not an admin
    redirect('/dashboard');
  }

  return user;
}

/**
 * Checks if the current user has admin role
 * Returns true if admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

/**
 * Checks if a user has a specific role
 */
export async function hasRole(user: User | null, role: UserRole): Promise<boolean> {
  return user?.role === role;
}
