import { getAllProjects, getProjectStats } from '@/app/actions/admin-projects';
import Link from 'next/link';
import { Folder, User, Clock, TrendingUp } from 'lucide-react';

export default async function AdminProjectsPage() {
  const [projects, stats] = await Promise.all([
    getAllProjects(),
    getProjectStats(),
  ]);

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
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-sage mb-2">All Projects</h1>
          <p className="text-sage/70">
            View and collaborate on all user projects
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-4">
            <p className="text-sm text-sage/70 mb-1">Total Projects</p>
            <p className="text-2xl font-bold text-sage">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-4">
            <p className="text-sm text-sage/70 mb-1">Active</p>
            <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-4">
            <p className="text-sm text-sage/70 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-4">
            <p className="text-sm text-sage/70 mb-1">Draft</p>
            <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-4">
            <p className="text-sm text-sage/70 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-dusty-rose">{stats.totalUsers}</p>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-3xl shadow-soft p-6">
          <div className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-sage/50 text-center py-12">No projects yet</p>
            ) : (
              projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="block p-4 bg-sage/5 rounded-2xl hover:bg-sage/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Folder className="w-5 h-5 text-sage" />
                        <h3 className="font-semibold text-sage text-lg">
                          {project.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                      </div>

                      {project.description && (
                        <p className="text-sm text-sage/70 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-sage/60">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>
                            {project.user_name || project.user_email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Updated {formatDate(project.updated_at)}</span>
                        </div>
                        {project.selected_trends && project.selected_trends.length > 0 && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{project.selected_trends.length} trends</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
