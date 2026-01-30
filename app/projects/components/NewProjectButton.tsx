'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2 } from 'lucide-react';
import { createProject } from '@/app/actions/projects';

export function NewProjectButton() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    try {
      const project = await createProject({
        title,
        description: description || undefined,
      });

      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      router.refresh();
      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setError('');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-sage hover:bg-sage/90 text-cream font-medium px-6 py-3 rounded-2xl transition-colors"
      >
        <Plus className="w-5 h-5" />
        New Project
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-sage/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-soft-lg max-w-lg w-full p-8 relative">
            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={isCreating}
              className="absolute top-6 right-6 text-sage/60 hover:text-sage transition-colors disabled:cursor-not-allowed"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <h2 className="font-serif text-3xl text-sage mb-6">
              Create New Project
            </h2>

            {/* Form */}
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-sage mb-2"
                >
                  Project Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isCreating}
                  className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all disabled:bg-sage/5 disabled:cursor-not-allowed"
                  placeholder="e.g., Summer Wellness Campaign"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-sage mb-2"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isCreating}
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none disabled:bg-sage/5 disabled:cursor-not-allowed"
                  placeholder="Describe your project goals and strategy..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isCreating || !title.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-sage hover:bg-sage/90 text-cream font-medium py-3 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create Project
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isCreating}
                  className="flex-1 border border-sage/20 hover:border-sage/40 text-sage font-medium py-3 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
