import { requireAuth, getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserProjects } from '@/app/actions/projects';
import { getTrendsByLayer } from '@/app/actions/trends';
import { getUserNicheTrends, getStrategicInsights } from '@/app/actions/user-trends';
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

  const strategy = (user.metadata as any)?.strategy || {};
  const niche_funnel = (user.metadata as any)?.niche_funnel || {};
  const industries: string[] = (user.metadata as any)?.industries || [];
  const userNews = (user.metadata as any)?.user_news ?? [];

  const nicheContext = niche_funnel?.microniche
    ? `${niche_funnel.category} > ${niche_funnel.subcategory} > ${niche_funnel.microniche}`
    : niche_funnel?.subcategory
    ? `${niche_funnel.category} > ${niche_funnel.subcategory}`
    : industries.filter(Boolean).join(', ') || strategy.niche || 'wellness & personal development';

  const userIndustries = industries.length > 0 ? industries : (user.industry ? [user.industry] : []);

  let projects: Awaited<ReturnType<typeof getUserProjects>> = [];
  try { projects = await getUserProjects(); } catch {}

  const [macroTrends, nicheTrends, strategicInsights] = await Promise.all([
    getTrendsByLayer('macro'),
    getUserNicheTrends(user.id),
    getStrategicInsights(user.id),
  ]);

  // Show welcome banner only if onboarding completed within last 24h and not yet dismissed
  const onboardingCompletedAt = (user.metadata as any)?.onboarding?.completed_at;
  const isRecentCompletion =
    onboardingCompletedAt &&
    Date.now() - new Date(onboardingCompletedAt).getTime() < 24 * 60 * 60 * 1000;
  const isFirstVisit = !!(isRecentCompletion && !(user.metadata as any)?.onboarding?.welcome_dismissed);

  return (
    <DashboardShell
      user={user}
      userNews={userNews}
      isFirstVisit={isFirstVisit}
      pillars={strategy.content_pillars || []}
      nicheContext={nicheContext}
      projects={projects}
      macroTrends={macroTrends}
      nicheTrends={nicheTrends}
      strategicInsights={strategicInsights}
      userIndustries={userIndustries}
      strategy={strategy}
    />
  );
}
