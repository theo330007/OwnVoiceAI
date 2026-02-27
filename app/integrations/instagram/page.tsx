import { requireAuth, getCurrentUser } from '@/lib/auth';
import { getInstagramInsights, getTopInstagramPosts } from '@/app/actions/instagram';
import { InstagramInsightsPanel } from '@/app/dashboard/components/InstagramInsightsPanel';

export default async function InstagramDashboardPage() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) throw new Error('User not found');

  const [insights, topPosts] = await Promise.all([
    getInstagramInsights(user.id),
    getTopInstagramPosts(user.id, 10),
  ]);

  return (
    <div className="min-h-screen bg-cream py-12 px-8">
      <div className="max-w-5xl mx-auto">
        <InstagramInsightsPanel
          userId={user.id}
          instagramUsername={(user as any).instagram_username ?? null}
          instagramConnectedAt={(user as any).instagram_connected_at ?? null}
          instagramLastSynced={(user as any).instagram_last_synced_at ?? null}
          insights={insights}
          topPosts={topPosts}
        />
      </div>
    </div>
  );
}
