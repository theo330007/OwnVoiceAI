import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserProjects } from '@/app/actions/projects';
import { EditorialCalendar } from './components/EditorialCalendar';
import { createClient } from '@/lib/supabase';

export default async function EditorialPage() {
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

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-sage mb-2">Monthly Editorial Architecture</h1>
          <p className="text-sage/60">
            Your 4-week content calendar — pillar rotation, content mix & posting cadence.
          </p>
        </div>
        <EditorialCalendar
          userId={user.id}
          pillars={strategy.content_pillars || []}
          objectives={strategy.post_objectives || []}
          nicheContext={nicheContext}
          existingPlan={existingPlan}
          projects={projects}
          recentTrends={recentTrends}
        />
      </div>
    </div>
  );
}
