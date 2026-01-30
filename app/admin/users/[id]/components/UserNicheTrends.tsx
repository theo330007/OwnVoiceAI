'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addUserNicheTrend, deleteUserNicheTrend } from '@/app/actions/user-trends';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, Target } from 'lucide-react';
import type { Trend } from '@/lib/types';

interface Props {
  userId: string;
  nicheTrends: Trend[];
}

export function UserNicheTrends({ userId, nicheTrends }: Props) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    trend_type: 'wellness',
    title: '',
    description: '',
    keywords: '',
    relevance_score: 75,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const keywordsArray = formData.keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      await addUserNicheTrend(userId, {
        trend_type: formData.trend_type,
        title: formData.title,
        description: formData.description,
        keywords: keywordsArray,
        relevance_score: formData.relevance_score,
      });

      // Reset form
      setFormData({
        trend_type: 'wellness',
        title: '',
        description: '',
        keywords: '',
        relevance_score: 75,
      });

      setIsAdding(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to add niche trend');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (trendId: string) => {
    if (!confirm('Are you sure you want to delete this niche trend?')) {
      return;
    }

    setDeletingId(trendId);
    try {
      await deleteUserNicheTrend(trendId, userId);
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to delete niche trend');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="bg-white rounded-3xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-dusty-rose" />
          <h3 className="font-serif text-xl text-sage">User Niche Trends</h3>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-sage text-cream rounded-2xl hover:bg-sage/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Niche Trend
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-sage/5 rounded-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-sage mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none"
              placeholder="e.g., Seed cycling for hormonal balance"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none min-h-[80px]"
              placeholder="Describe this niche trend..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-2">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none"
              placeholder="seed cycling, hormones, fertility"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-sage text-cream rounded-xl hover:bg-sage/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Trend'}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-sage/10 text-sage rounded-xl hover:bg-sage/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Trends List */}
      <div className="space-y-3">
        {nicheTrends.length === 0 ? (
          <p className="text-sage/50 text-center py-8">
            No niche trends yet. Add one to help focus their content strategy.
          </p>
        ) : (
          nicheTrends.map((trend) => (
            <div
              key={trend.id}
              className="p-4 bg-sage/5 rounded-2xl hover:bg-sage/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sage mb-1">{trend.title}</h4>
                  <p className="text-sm text-sage/70 mb-2">{trend.description}</p>
                  {trend.keywords && trend.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {trend.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-dusty-rose/20 text-dusty-rose text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(trend.id)}
                  disabled={deletingId === trend.id}
                  className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete trend"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
