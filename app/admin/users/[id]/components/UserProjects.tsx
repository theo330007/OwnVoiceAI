'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProjectForUser } from '@/app/actions/admin-projects';
import { Card } from '@/components/ui/card';
import { Folder, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Project } from '@/lib/types/project';

interface Props {
  userId: string;
  projects: Project[];
}

export function UserProjects({ userId, projects }: Props) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const project = await createProjectForUser(userId, {
        title: formData.title,
        description: formData.description || undefined,
      });

      setFormData({
        title: '',
        description: '',
      });

      setIsCreating(false);
      router.push(`/admin/projects/${project.id}`);
    } catch (error: any) {
      alert(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-sage/10 text-sage';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="bg-white rounded-3xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Folder className="w-6 h-6 text-dusty-rose" />
          <div>
            <h3 className="font-serif text-xl text-sage">User's Projects</h3>
            <p className="text-xs text-sage/60">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2 bg-dusty-rose text-cream rounded-2xl hover:bg-dusty-rose/90 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 bg-dusty-rose/5 rounded-2xl space-y-4 border border-dusty-rose/20"
        >
          <div>
            <label className="block text-sm font-medium text-sage mb-2">
              Project Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-sage/20 focus:border-dusty-rose focus:outline-none focus:ring-2 focus:ring-dusty-rose/20"
              placeholder="e.g., Fertility Blog Series"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-sage/20 focus:border-dusty-rose focus:outline-none focus:ring-2 focus:ring-dusty-rose/20 min-h-[80px]"
              placeholder="What's this project about?"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-dusty-rose text-cream rounded-xl hover:bg-dusty-rose/90 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? 'Creating...' : 'Create & Collaborate'}
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-sage/10 text-sage rounded-xl hover:bg-sage/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="text-center py-8 px-4 bg-sage/5 rounded-2xl">
            <Folder className="w-12 h-12 text-sage/30 mx-auto mb-3" />
            <p className="text-sage/50 mb-2">No projects yet</p>
            <p className="text-xs text-sage/40">
              Create a project to start collaborating with this user
            </p>
          </div>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/projects/${project.id}`}
              className="block p-4 bg-gradient-to-br from-dusty-rose/5 to-sage/5 rounded-2xl hover:shadow-soft transition-all border border-dusty-rose/10 hover:border-dusty-rose/30"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sage">{project.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-sm text-sage/70 mb-2 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-sage/60">
                    <span>Updated {formatDate(project.updated_at)}</span>
                    {project.selected_trends && project.selected_trends.length > 0 && (
                      <span>{project.selected_trends.length} trends</span>
                    )}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-dusty-rose flex-shrink-0 ml-3" />
              </div>
            </Link>
          ))
        )}
      </div>

      {projects.length > 0 && (
        <div className="mt-4 pt-4 border-t border-sage/10">
          <Link
            href="/admin/projects"
            className="text-sm text-dusty-rose hover:text-dusty-rose/80 transition-colors flex items-center gap-1"
          >
            View all projects →
          </Link>
        </div>
      )}
    </Card>
  );
}
