import { getUserStats } from '@/app/actions/users';
import { UsersTable } from './components/UsersTable';
import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function AdminUsersPage() {
  const userStats = await getUserStats();

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sage/70 hover:text-sage transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="font-serif text-4xl text-sage mb-2">
              User Management
            </h1>
            <p className="text-sage/70">
              Manage user profiles, subscriptions, and activity
            </p>
          </div>

          <Link href="/admin/users/new">
            <Button className="bg-sage hover:bg-sage/90 text-cream">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-soft p-6 border border-sage/5">
            <p className="text-sm text-sage/70 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-sage">{userStats.length}</p>
          </div>
          <div className="bg-white rounded-3xl shadow-soft p-6 border border-sage/5">
            <p className="text-sm text-sage/70 mb-1">Active Users</p>
            <p className="text-3xl font-bold text-dusty-rose">
              {userStats.filter((u) => u.total_validations > 0).length}
            </p>
          </div>
          <div className="bg-white rounded-3xl shadow-soft p-6 border border-sage/5">
            <p className="text-sm text-sage/70 mb-1">Total Validations</p>
            <p className="text-3xl font-bold text-sage">
              {userStats.reduce((sum, u) => sum + u.total_validations, 0)}
            </p>
          </div>
          <div className="bg-white rounded-3xl shadow-soft p-6 border border-sage/5">
            <p className="text-sm text-sage/70 mb-1">Avg. Relevance</p>
            <p className="text-3xl font-bold text-dusty-rose">
              {Math.round(
                userStats.reduce(
                  (sum, u) => sum + (u.avg_relevance_score || 0),
                  0
                ) / userStats.length || 0
              )}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <UsersTable users={userStats} />
      </div>
    </div>
  );
}
