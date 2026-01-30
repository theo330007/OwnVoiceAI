import { getUserById, getUserValidations } from '@/app/actions/users';
import { getTrendsByLayer } from '@/app/actions/trends';
import { getUserNicheTrends } from '@/app/actions/user-trends';
import { getUserProjects } from '@/app/actions/admin-projects';
import { UserProfileForm } from './components/UserProfileForm';
import { UserActivity } from './components/UserActivity';
import { UserNicheTrends } from './components/UserNicheTrends';
import { UserProjects } from './components/UserProjects';
import { StrategicInsights } from './components/StrategicInsights';
import { ValidationDetails } from './components/ValidationDetails';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [user, validations, macroTrends, nicheTrends, projects] =
    await Promise.all([
      getUserById(params.id),
      getUserValidations(params.id),
      getTrendsByLayer('macro'),
      getUserNicheTrends(params.id),
      getUserProjects(params.id),
    ]);

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sage/70 hover:text-sage transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-4xl text-sage mb-2">{user.name}</h1>
              <p className="text-sage/70 mb-1">{user.email}</p>
              {user.business_name && (
                <p className="text-sm text-sage/60">
                  {user.business_name}
                  {user.industry && ` • ${user.industry}`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-sage/60">Total Validations</p>
                <p className="text-2xl font-bold text-sage">{validations.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Projects - PROMINENT */}
            <UserProjects userId={user.id} projects={projects} />

            {/* User Niche Trends */}
            <UserNicheTrends userId={user.id} nicheTrends={nicheTrends} />

            {/* Strategic Insights */}
            <StrategicInsights macroTrends={macroTrends} nicheTrends={nicheTrends} />

            {/* Validation Details */}
            <ValidationDetails validations={validations.slice(0, 5)} />
          </div>

          {/* Right Column - Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Activity Stats */}
            <UserActivity userId={user.id} validations={validations} />

            {/* Profile Form */}
            <UserProfileForm user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
