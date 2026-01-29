'use client';

import { Card } from '@/components/ui/card';
import { UserStats } from '@/lib/types/user';
import { Clock, User } from 'lucide-react';

interface Props {
  userStats: UserStats[];
}

export function RecentActivity({ userStats }: Props) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Create activity feed from user stats
  const activities = userStats
    .filter((u) => u.last_validation_at)
    .map((u) => ({
      id: u.id,
      user: u.name,
      action: 'validated content',
      validations: u.total_validations,
      time: u.last_validation_at,
      score: u.avg_relevance_score,
    }))
    .sort(
      (a, b) =>
        new Date(b.time!).getTime() - new Date(a.time!).getTime()
    );

  return (
    <Card className="bg-white rounded-3xl shadow-soft p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-sage" />
        <h2 className="font-serif text-xl text-sage">Recent Activity</h2>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sage/50 text-sm text-center py-8">
            No recent activity
          </p>
        ) : (
          activities.slice(0, 8).map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-sage/5 rounded-2xl hover:bg-sage/10 transition-colors"
            >
              <div className="w-8 h-8 bg-dusty-rose/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-dusty-rose" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-sage">
                  <span className="font-semibold">{activity.user}</span>{' '}
                  {activity.action}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-sage/60">
                    {formatDate(activity.time!)}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-sage/20 text-sage rounded-full">
                    {activity.validations} validations
                  </span>
                  {activity.score && (
                    <span className="text-xs font-semibold text-dusty-rose">
                      Avg: {Math.round(activity.score)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
