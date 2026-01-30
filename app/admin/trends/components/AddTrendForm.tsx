'use client';

import { useState } from 'react';
import { addTrend } from '@/app/actions/trends';
import { useRouter } from 'next/navigation';
import type { TrendLayer } from '@/lib/types';

export function AddTrendForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    layer: 'macro' as TrendLayer,
    trend_type: 'wellness',
    title: '',
    description: '',
    source_url: '',
    keywords: '',
    relevance_score: 75,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const keywordsArray = formData.keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      await addTrend({
        layer: formData.layer,
        trend_type: formData.trend_type,
        title: formData.title,
        description: formData.description,
        source_url: formData.source_url || undefined,
        keywords: keywordsArray,
        relevance_score: formData.relevance_score,
      });

      // Reset form
      setFormData({
        layer: 'macro',
        trend_type: 'wellness',
        title: '',
        description: '',
        source_url: '',
        keywords: '',
        relevance_score: 75,
      });

      // Refresh the page to show new trend
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to add trend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-soft p-8">
      <h2 className="font-serif text-2xl text-sage mb-6">Add New Trend</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trend Type */}
        <div>
          <label className="block text-sm font-medium text-sage mb-2">
            Trend Type
          </label>
          <input
            type="text"
            value={formData.trend_type}
            onChange={(e) =>
              setFormData({ ...formData, trend_type: e.target.value })
            }
            className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
            placeholder="e.g., wellness, fertility, nutrition"
            required
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-sage mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
            placeholder="Trend title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-sage mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 min-h-[100px]"
            placeholder="Describe the trend..."
            required
          />
        </div>

        {/* Source URL */}
        <div>
          <label className="block text-sm font-medium text-sage mb-2">
            Source URL (Optional)
          </label>
          <input
            type="url"
            value={formData.source_url}
            onChange={(e) =>
              setFormData({ ...formData, source_url: e.target.value })
            }
            className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
            placeholder="https://example.com/article"
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-sage mb-2">
            Keywords (comma-separated)
          </label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) =>
              setFormData({ ...formData, keywords: e.target.value })
            }
            className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
            placeholder="wellness, health, trending"
            required
          />
        </div>

        {/* Relevance Score */}
        <div>
          <label className="block text-sm font-medium text-sage mb-2">
            Relevance Score: {formData.relevance_score}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.relevance_score}
            onChange={(e) =>
              setFormData({
                ...formData,
                relevance_score: parseInt(e.target.value),
              })
            }
            className="w-full"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sage hover:bg-sage/90 text-cream font-medium py-3 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add Trend'}
        </button>
      </form>
    </div>
  );
}
