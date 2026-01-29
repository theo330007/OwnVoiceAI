'use client';

import { useState } from 'react';
import { addKnowledge } from '@/app/actions/knowledge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminKnowledgePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source: '',
    source_url: '',
    topic_tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tagsArray = formData.topic_tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await addKnowledge({
        ...formData,
        topic_tags: tagsArray,
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        source: '',
        source_url: '',
        topic_tags: '',
      });

      alert('Knowledge added successfully! Embedding generated.');
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

        <h1 className="font-serif text-4xl text-sage mb-2">
          Add Knowledge Base Entry
        </h1>
        <p className="text-sage/70 mb-8">
          Add scientific research, studies, or articles with automatic embedding
          generation
        </p>

        <Card className="bg-white rounded-3xl shadow-soft p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="e.g., Impact of Omega-3 on Female Fertility"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Paste the full article content or summary here..."
                rows={12}
                required
              />
              <p className="text-xs text-sage/50 mt-1">
                This will be embedded for vector search
              </p>
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Source <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                placeholder="e.g., Journal of Reproductive Medicine, PubMed, NIH"
                required
              />
            </div>

            {/* Source URL */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Source URL <span className="text-red-500">*</span>
              </label>
              <Input
                type="url"
                value={formData.source_url}
                onChange={(e) =>
                  setFormData({ ...formData, source_url: e.target.value })
                }
                placeholder="https://..."
                required
              />
            </div>

            {/* Topic Tags */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Topic Tags (comma-separated){' '}
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.topic_tags}
                onChange={(e) =>
                  setFormData({ ...formData, topic_tags: e.target.value })
                }
                placeholder="fertility, nutrition, omega-3"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-sage hover:bg-sage/90 text-cream"
            >
              {isSubmitting ? (
                'Adding and generating embedding...'
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Knowledge Entry
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
