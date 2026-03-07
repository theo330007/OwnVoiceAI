import { getTrendsByLayer } from '@/app/actions/trends';
import { getUserNicheTrends, getStrategicInsights } from '@/app/actions/user-trends';
import { requireAuth, getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DiscoverShell } from './components/DiscoverShell';

export default async function DiscoverPage() {
  await requireAuth();
  const user = await getCurrentUser();
  if (!user) throw new Error('User not found');

  const hasProfile = (user.metadata as any)?.strategy?.persona || (user.metadata as any)?.strategy?.niche;
  if (!hasProfile) redirect('/onboarding');

  const [macroTrends, nicheTrends, strategicInsights] = await Promise.all([
    getTrendsByLayer('macro'),
    getUserNicheTrends(user.id),
    getStrategicInsights(user.id),
  ]);

  const userIndustries =
    (user.metadata as any)?.industries ||
    (user.industry ? [user.industry] : []);

  const strategy = (user.metadata as any)?.strategy || {};

  return (
    <DiscoverShell
      user={user}
      macroTrends={macroTrends}
      nicheTrends={nicheTrends}
      strategicInsights={strategicInsights}
      userIndustries={userIndustries}
      strategy={strategy}
    />
  );
}
