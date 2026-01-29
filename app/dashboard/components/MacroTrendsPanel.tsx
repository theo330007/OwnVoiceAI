'use client';

import { useState } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendDetailModal } from '@/components/TrendDetailModal';
import type { Trend } from '@/lib/types';

interface Props {
  initialTrends: Trend[];
}

export function MacroTrendsPanel({ initialTrends }: Props) {
  const [trends, setTrends] = useState(initialTrends);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // For MVP, just reload the page data
    // In Phase 2, this will trigger Inngest workflow
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleTrendClick = (trend: Trend) => {
    setSelectedTrend(trend);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTrend(null), 200);
  };

  return (
    <Card className="bg-white rounded-3xl shadow-soft p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-sage" />
          <h2 className="font-serif text-2xl text-sage">Macro Trends</h2>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="ghost"
          size="sm"
          className="text-sage hover:bg-sage/10"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </Button>
      </div>

      <div className="space-y-4">
        {trends.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sage/50 mb-4">No macro trends yet.</p>
            <a
              href="/admin/trends"
              className="text-dusty-rose hover:underline text-sm"
            >
              Add some in the admin panel →
            </a>
          </div>
        ) : (
          trends.map((trend) => (
            <div
              key={trend.id}
              onClick={() => handleTrendClick(trend)}
              className="p-4 bg-sage/5 rounded-2xl hover:bg-sage/10 transition-all cursor-pointer hover:shadow-soft group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sage group-hover:text-dusty-rose transition-colors">
                  {trend.title}
                </h3>
                {trend.relevance_score && (
                  <span className="px-2 py-1 bg-dusty-rose/20 text-dusty-rose text-xs font-bold rounded-full flex-shrink-0 ml-2">
                    {trend.relevance_score}
                  </span>
                )}
              </div>
              {trend.description && (
                <p className="text-sm text-sage/70 mb-3 line-clamp-2">
                  {trend.description}
                </p>
              )}
              {trend.keywords && trend.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {trend.keywords.slice(0, 3).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-dusty-rose/20 text-dusty-rose text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                  {trend.keywords.length > 3 && (
                    <span className="px-3 py-1 bg-sage/20 text-sage text-xs rounded-full">
                      +{trend.keywords.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <TrendDetailModal
        trend={selectedTrend}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </Card>
  );
}
