import { MacroTrendsPanel } from './components/MacroTrendsPanel';
import { NicheTrendsPanel } from './components/NicheTrendsPanel';
import { StrategyPanel } from './components/StrategyPanel';
import { InstagramInsightsPanel } from './components/InstagramInsightsPanel';
import { TikTokInsightsPanel } from './components/TikTokInsightsPanel';
import { getTrendsByLayer } from '@/app/actions/trends';
import { getUserNicheTrends, getStrategicInsights } from '@/app/actions/user-trends';
import { getInstagramInsights, getTopInstagramPosts } from '@/app/actions/instagram';
import { requireAuth, getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles } from 'lucide-react';

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

  const [macroTrends, nicheTrends, strategicInsights, instagramInsights, instagramTopPosts] =
    await Promise.all([
      getTrendsByLayer('macro'),
      getUserNicheTrends(user.id),
      getStrategicInsights(user.id),
      getInstagramInsights(user.id),
      getTopInstagramPosts(user.id, 10),
    ]);

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-8">
        <header className="mb-12">
          <h1 className="font-serif text-5xl text-sage mb-3">
            OwnVoice AI Dashboard
          </h1>
          <p className="text-sage/70 text-lg mb-6">
            Your boutique wellness content intelligence hub
          </p>

          <Link
            href="/lab"
            className="inline-flex items-center gap-2 bg-dusty-rose text-cream px-6 py-3 rounded-2xl shadow-soft hover:bg-dusty-rose/90 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Open OwnVoice AI Lab
          </Link>
        </header>

        {/* Social Media Insights - Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Instagram Panel */}
          <InstagramInsightsPanel
            userId={user.id}
            instagramUsername={user.instagram_username}
            instagramConnectedAt={user.instagram_connected_at}
            instagramLastSynced={user.instagram_last_synced_at}
            insights={instagramInsights}
            topPosts={instagramTopPosts}
          />

          {/* TikTok Panel */}
          <TikTokInsightsPanel
            userId={user.id}
            tiktokUsername={null}
            tiktokConnectedAt={null}
            tiktokLastSynced={null}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <MacroTrendsPanel initialTrends={macroTrends} />
          <NicheTrendsPanel initialTrends={nicheTrends} userId={user.id} userIndustry={user.industry || ''} />
          <StrategyPanel insights={strategicInsights} userId={user.id} />
        </div>
      </div>
    </div>
  );
}
