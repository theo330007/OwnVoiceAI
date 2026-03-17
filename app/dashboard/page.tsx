import { requireAuth, getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserProjects } from '@/app/actions/projects';
import { getInstagramInsights, getTopInstagramPosts } from '@/app/actions/instagram';
import { createClient } from '@/lib/supabase';
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
  const quickPosts = (user.metadata as any)?.quick_posts ?? [];

  const nicheContext = niche_funnel?.microniche
    ? `${niche_funnel.category} > ${niche_funnel.subcategory} > ${niche_funnel.microniche}`
    : niche_funnel?.subcategory
    ? `${niche_funnel.category} > ${niche_funnel.subcategory}`
    : industries.filter(Boolean).join(', ') || strategy.niche || 'wellness & personal development';

  const existingPlan = (user.metadata as any)?.editorial_plan || null;

  let projects: Awaited<ReturnType<typeof getUserProjects>> = [];
  try { projects = await getUserProjects(); } catch {}

  let instagramInsights: Awaited<ReturnType<typeof getInstagramInsights>> = [];
  let instagramTopPosts: Awaited<ReturnType<typeof getTopInstagramPosts>> = [];
  if (user.instagram_username) {
    try {
      [instagramInsights, instagramTopPosts] = await Promise.all([
        getInstagramInsights(user.id),
        getTopInstagramPosts(user.id, 3),
      ]);
    } catch {}
  }

  let recentTrends: { id: string; title: string; description: string }[] = [];
  try {
    const supabase = await createClient();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('trends')
      .select('id, title, description')
      .gte('created_at', sevenDaysAgo)
      .gte('relevance_score', 65)
      .order('relevance_score', { ascending: false })
      .limit(5);
    recentTrends = data ?? [];
  } catch {}

  // Show welcome banner only if onboarding completed within last 24h and not yet dismissed
  const onboardingCompletedAt = (user.metadata as any)?.onboarding?.completed_at;
  const isRecentCompletion =
    onboardingCompletedAt &&
    Date.now() - new Date(onboardingCompletedAt).getTime() < 24 * 60 * 60 * 1000;
  const isFirstVisit = !!(isRecentCompletion && !(user.metadata as any)?.onboarding?.welcome_dismissed);

  return (
    <DashboardShell
      user={user}
      instagramConnected={!!user.instagram_username}
      instagramUsername={user.instagram_username ?? null}
      instagramLastSynced={(user as any).instagram_last_synced_at ?? null}
      instagramInsights={instagramInsights}
      instagramTopPosts={instagramTopPosts}
      userNews={userNews}
      quickPosts={quickPosts}
      isFirstVisit={isFirstVisit}
      pillars={strategy.content_pillars || []}
      objectives={strategy.post_objectives || []}
      nicheContext={nicheContext}
      existingPlan={existingPlan}
      projects={projects}
      recentTrends={recentTrends}
    />
  );
}
