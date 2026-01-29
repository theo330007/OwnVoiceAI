'use client';

import { Card } from '@/components/ui/card';
import { Activity, TrendingUp } from 'lucide-react';

interface Props {
  userId: string;
  validations: any[];
}

export function UserActivity({ userId, validations }: Props) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const avgScore =
    validations.length > 0
      ? Math.round(
          validations.reduce((sum, v) => sum + (v.relevance_score || 0), 0) /
            validations.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card className="bg-white rounded-3xl shadow-soft p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-sage" />
          <h3 className="font-serif text-lg text-sage">Activity Stats</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-sage/70 mb-1">Total Validations</p>
            <p className="text-2xl font-bold text-sage">{validations.length}</p>
          </div>

          <div>
            <p className="text-sm text-sage/70 mb-1">Average Relevance Score</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-dusty-rose">{avgScore}</p>
              <TrendingUp className="w-4 h-4 text-dusty-rose" />
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white rounded-3xl shadow-soft p-6">
        <h3 className="font-serif text-lg text-sage mb-4">Recent Activity</h3>

        <div className="space-y-3">
          {validations.length === 0 ? (
            <p className="text-sm text-sage/50 text-center py-8">
              No activity yet
            </p>
          ) : (
            validations.slice(0, 10).map((validation) => (
              <div
                key={validation.id}
                className="p-3 bg-sage/5 rounded-2xl hover:bg-sage/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-sage line-clamp-2">
                    {validation.user_query}
                  </p>
                  {validation.relevance_score && (
                    <span className="text-xs font-semibold text-dusty-rose ml-2 flex-shrink-0">
                      {validation.relevance_score}
                    </span>
                  )}
                </div>
                <p className="text-xs text-sage/60">
                  {formatDate(validation.created_at)}
                </p>
              </div>
            ))
          )}
        </div>

        {validations.length > 10 && (
          <p className="text-xs text-sage/50 text-center mt-4">
            Showing 10 of {validations.length} validations
          </p>
        )}
      </Card>
    </div>
  );
}
