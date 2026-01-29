'use client';

import { useState } from 'react';
import { addTrend } from '@/app/actions/trends';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminTrendsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    layer: 'macro' as 'macro' | 'niche',
    trend_type: 'wellness',
    title: '',
    description: '',
    source_url: '',
    keywords: '',
    relevance_score: 75,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const keywordsArray = formData.keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      await addTrend({
        ...formData,
        keywords: keywordsArray,
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

      alert('Trend added successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sage/70 hover:text-sage transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="font-serif text-4xl text-sage mb-2">Add Trend</h1>
        <p className="text-sage/70 mb-8">
          Manually add a macro or niche wellness trend
        </p>

        <Card className="bg-white rounded-3xl shadow-soft p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Layer Selection */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Layer <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="macro"
                    checked={formData.layer === 'macro'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        layer: e.target.value as 'macro' | 'niche',
                      })
                    }
                    className="text-sage"
                  />
                  <span className="text-sage">Macro</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="niche"
                    checked={formData.layer === 'niche'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        layer: e.target.value as 'macro' | 'niche',
                      })
                    }
                    className="text-sage"
                  />
                  <span className="text-sage">Niche</span>
                </label>
              </div>
            </div>

            {/* Trend Type */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Trend Type <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.trend_type}
                onChange={(e) =>
                  setFormData({ ...formData, trend_type: e.target.value })
                }
                placeholder="e.g., wellness, fertility, nutrition"
                required
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Rise of gut health awareness"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the trend..."
                rows={4}
              />
            </div>

            {/* Source URL */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Source URL
              </label>
              <Input
                type="url"
                value={formData.source_url}
                onChange={(e) =>
                  setFormData({ ...formData, source_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Keywords (comma-separated)
              </label>
              <Input
                type="text"
                value={formData.keywords}
                onChange={(e) =>
                  setFormData({ ...formData, keywords: e.target.value })
                }
                placeholder="gut health, microbiome, digestion"
              />
            </div>

            {/* Relevance Score */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Relevance Score (0-100)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.relevance_score}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    relevance_score: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-sage hover:bg-sage/90 text-cream"
            >
              {isSubmitting ? (
                'Adding...'
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Trend
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
