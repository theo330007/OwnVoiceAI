import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserProjects } from '@/app/actions/projects';
import { EditorialCalendar } from './components/EditorialCalendar';
import { createClient } from '@/lib/supabase';

export default async function EditorialPage({
  searchParams,
}: {
  searchParams: { month?: string; openSettings?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const strategy = (user.metadata as any)?.strategy || {};
  const niche_funnel = (user.metadata as any)?.niche_funnel || {};
  const industries: string[] = (user.metadata as any)?.industries || [];

  const nicheContext = niche_funnel?.microniche
    ? `${niche_funnel.category} > ${niche_funnel.subcategory} > ${niche_funnel.microniche}`
    : niche_funnel?.subcategory
    ? `${niche_funnel.category} > ${niche_funnel.subcategory}`
    : industries.filter(Boolean).join(', ') || strategy.niche || 'wellness & personal development';

  const existingPlan = (user.metadata as any)?.editorial_plan || null;
  const quickPosts = (user.metadata as any)?.quick_posts ?? [];

  let projects: Awaited<ReturnType<typeof getUserProjects>> = [];
  try {
    projects = await getUserProjects();
  } catch {}

  // Fetch recent niche trends (last 7 days, relevance ≥ 65)
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

  // Parse ?month=YYYY-MM and ?openSettings=1 from dashboard redirect
  let initialMonth: { year: number; month: number } | undefined;
  if (searchParams.month) {
    const [y, m] = searchParams.month.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m)) initialMonth = { year: y, month: m - 1 };
  }
  const openSettings = searchParams.openSettings === '1';

  return (
    <div className="min-h-screen bg-cream">
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-sage">Monthly Editorial Architecture</h1>
          <p className="text-sage/50 text-sm mt-1">
            Your 4-week content calendar — pillar rotation, content mix & posting cadence.
          </p>
        </div>
        <EditorialCalendar
          userId={user.id}
          pillars={strategy.content_pillars || []}
          objectives={strategy.post_objectives || []}
          nicheContext={nicheContext}
          existingPlan={existingPlan}
          quickPosts={quickPosts}
          projects={projects}
          recentTrends={recentTrends}
          initialMonth={initialMonth}
          openSettings={openSettings}
        />
      </div>
    </div>
  );
}
