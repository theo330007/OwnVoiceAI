import { getUserStats } from '@/app/actions/users';
import { getTrendsByLayer } from '@/app/actions/trends';
import { getAllKnowledge } from '@/app/actions/knowledge';
import { KPICards } from './components/KPICards';
import { QuickActions } from './components/QuickActions';
import { RecentActivity } from './components/RecentActivity';
import { SystemHealth } from './components/SystemHealth';
import { PlatformSettings } from './components/PlatformSettings';
import { InstagramScraper } from './components/InstagramScraper';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const [userStats, macroTrends, knowledge] = await Promise.all([
    getUserStats(),
    getTrendsByLayer('macro'),
    getAllKnowledge(),
  ]);

  // Calculate KPIs
  const totalUsers = userStats.length;
  const activeUsers = userStats.filter((u) => u.total_validations > 0).length;
  const totalValidations = userStats.reduce(
    (sum, u) => sum + u.total_validations,
    0
  );
  const avgRelevanceScore = Math.round(
    userStats.reduce((sum, u) => sum + (u.avg_relevance_score || 0), 0) /
      userStats.length || 0
  );
  const totalTrends = macroTrends.length;
  const knowledgeBaseSize = knowledge.length;

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-4xl text-sage mb-2">
                Admin Dashboard
              </h1>
              <p className="text-sage/70">
                Platform overview and management center
              </p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <KPICards
          totalUsers={totalUsers}
          activeUsers={activeUsers}
          totalValidations={totalValidations}
          avgRelevanceScore={avgRelevanceScore}
          totalTrends={totalTrends}
          knowledgeBaseSize={knowledgeBaseSize}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Quick Actions & Settings */}
          <div className="lg:col-span-2 space-y-8">
            <QuickActions />
            <InstagramScraper />
            <PlatformSettings />
          </div>

          {/* Right Column - Recent Activity & System Health */}
          <div className="space-y-8">
            <RecentActivity userStats={userStats.slice(0, 5)} />
            <SystemHealth
              totalTrends={totalTrends}
              knowledgeBaseSize={knowledgeBaseSize}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
