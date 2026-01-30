'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Edit2, Trash2, Loader2 } from 'lucide-react';
import type { Project } from '@/lib/types/project';
import { updateProject, deleteProject } from '@/app/actions/projects';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  archived: 'bg-orange-100 text-orange-700',
};

const statusLabels = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
};

interface Props {
  project: Project;
}

export function ProjectHeader({ project }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || '');
  const [status, setStatus] = useState(project.status);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProject(project.id, {
        title,
        description: description || undefined,
        status,
      });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      router.push('/projects');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete project:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="mb-8">
      {/* Back Button */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sage/60 hover:text-sage transition-colors mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Projects
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-soft p-8">
        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Project Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-sage hover:bg-sage/90 text-cream font-medium py-3 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="flex-1 border border-sage/20 hover:border-sage/40 text-sage font-medium py-3 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="font-serif text-3xl text-sage">
                    {project.title}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[project.status]
                    }`}
                  >
                    {statusLabels[project.status]}
                  </span>
                </div>
                {project.description && (
                  <p className="text-sage/70">{project.description}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-sage/10 rounded-xl transition-colors"
                >
                  <Edit2 className="w-5 h-5 text-sage" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5 text-red-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-6 text-sm text-sage/60 pt-4 border-t border-sage/10">
              <div>
                Created{' '}
                {new Date(project.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div>
                Updated{' '}
                {new Date(project.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
