'use client';

import { useState } from 'react';
import { deleteTrend } from '@/app/actions/trends';
import { useRouter } from 'next/navigation';
import { Trash2, ExternalLink } from 'lucide-react';
import type { Trend } from '@/lib/types';

interface TrendsListProps {
  macroTrends: Trend[];
}

export function TrendsList({ macroTrends }: TrendsListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trend?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteTrend(id);
      router.refresh();
    } catch (error) {
      console.error('Error deleting trend:', error);
      alert('Failed to delete trend');
    } finally {
      setDeletingId(null);
    }
  };

  const TrendCard = ({ trend }: { trend: Trend }) => (
    <div className="bg-white rounded-2xl border border-sage/10 p-6 hover:shadow-soft transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sage text-lg mb-1">{trend.title}</h3>
          <p className="text-sm text-sage/70 mb-2">{trend.description}</p>
        </div>
        <button
          onClick={() => handleDelete(trend.id)}
          disabled={deletingId === trend.id}
          className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="Delete trend"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {/* Keywords */}
        {trend.keywords && trend.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {trend.keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-dusty-rose/20 text-dusty-rose text-xs rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-sage/50 pt-2 border-t border-sage/10">
          <div className="flex items-center gap-4">
            <span>Type: {trend.trend_type}</span>
            {trend.relevance_score && (
              <span>Score: {trend.relevance_score}/100</span>
            )}
          </div>
          {trend.source_url && (
            <a
              href={trend.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sage/60 hover:text-sage transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Source
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="font-serif text-2xl text-sage mb-4">
        Macro Trends ({macroTrends.length})
      </h2>
      {macroTrends.length === 0 ? (
        <p className="text-sage/50 text-center py-8 bg-white rounded-2xl border border-sage/10">
          No macro trends yet. Add one using the form below.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {macroTrends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </div>
      )}
    </div>
  );
}
