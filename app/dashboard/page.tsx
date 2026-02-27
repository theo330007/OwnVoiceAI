import { getTrendsByLayer } from '@/app/actions/trends';
import { getUserNicheTrends, getStrategicInsights } from '@/app/actions/user-trends';
import { requireAuth, getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from './components/DashboardShell';

export default async function DashboardPage() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not found');
  }

  // Redirect to onboarding if strategy profile is empty and onboarding not yet completed
  const hasProfile = user.metadata?.strategy?.persona || user.metadata?.strategy?.niche;
  const hasCompletedOnboarding = user.metadata?.onboarding?.completed_at;
  if (!hasProfile && !hasCompletedOnboarding) {
    redirect('/onboarding');
  }

  const [macroTrends, nicheTrends, strategicInsights] = await Promise.all([
    getTrendsByLayer('macro'),
    getUserNicheTrends(user.id),
    getStrategicInsights(user.id),
  ]);

  const userIndustries =
    (user.metadata as any)?.industries ||
    (user.industry ? [user.industry] : []);

  return (
    <DashboardShell
      user={user}
      macroTrends={macroTrends}
      nicheTrends={nicheTrends}
      strategicInsights={strategicInsights}
      instagramConnected={!!user.instagram_username}
      instagramUsername={user.instagram_username ?? null}
      userIndustries={userIndustries}
    />
  );
}
