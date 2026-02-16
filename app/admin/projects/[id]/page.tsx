import { getProjectByIdAdmin } from '@/app/actions/admin-projects';
import { getUserNicheTrends } from '@/app/actions/user-trends';
import { getTrendsByLayer } from '@/app/actions/trends';
import { getProjectCollaborationNotes } from '@/app/actions/collaboration';
import { CollaborationNotes } from '@/app/admin/users/[id]/components/CollaborationNotes';
import { StrategicInsights } from '@/app/admin/users/[id]/components/StrategicInsights';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, TrendingUp } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function AdminProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, macroTrends, collaborationNotes] = await Promise.all([
    getProjectByIdAdmin(params.id),
    getTrendsByLayer('macro'),
    getProjectCollaborationNotes(params.id),
  ]);

  if (!project) {
    notFound();
  }

  const nicheTrends = await getUserNicheTrends(project.user_id);

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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-sage/70 hover:text-sage transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-serif text-4xl text-sage">{project.title}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
              </div>

              {project.description && (
                <p className="text-sage/70 text-lg mb-4">{project.description}</p>
              )}

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-sage/70">
                  <User className="w-4 h-4" />
                  <Link
                    href={`/admin/users/${project.user_id}`}
                    className="hover:text-sage transition-colors"
                  >
                    {project.user_name || project.user_email}
                  </Link>
                </div>
                <div className="flex items-center gap-2 text-sage/70">
                  <Calendar className="w-4 h-4" />
                  <span>Updated {formatDate(project.updated_at)}</span>
                </div>
                {project.selected_trends && project.selected_trends.length > 0 && (
                  <div className="flex items-center gap-2 text-sage/70">
                    <TrendingUp className="w-4 h-4" />
                    <span>{project.selected_trends.length} trends selected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Project Details & Insights (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Content */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h3 className="font-serif text-xl text-sage mb-4">Project Details</h3>

              {project.selected_trends && project.selected_trends.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-sage/70 uppercase tracking-wide mb-2">
                    Selected Trends
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.selected_trends.map((trendId, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-sage/10 text-sage text-sm rounded-full"
                      >
                        Trend #{idx + 1}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-sage/70">Current Step</p>
                  <p className="text-sage">{project.current_step || 'Not started'}</p>
                </div>

                {(project as any).generated_content && (
                  <div>
                    <p className="text-sm font-semibold text-sage/70 mb-2">
                      Generated Content
                    </p>
                    <div className="p-4 bg-sage/5 rounded-xl text-sm text-sage whitespace-pre-wrap">
                      {(project as any).generated_content}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Strategic Insights */}
            <StrategicInsights macroTrends={macroTrends} nicheTrends={nicheTrends} />
          </div>

          {/* Right Column - Collaboration (1/3) */}
          <div className="space-y-6">
            {/* Collaboration Notes */}
            <CollaborationNotes
              projectId={project.id}
              userId={project.user_id}
              notes={collaborationNotes}
            />

            {/* Quick User Info */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h3 className="font-serif text-lg text-sage mb-4">User Info</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-sage/60">Name</p>
                  <p className="text-sage font-medium">{project.user_name}</p>
                </div>
                <div>
                  <p className="text-sage/60">Email</p>
                  <p className="text-sage">{project.user_email}</p>
                </div>
                <Link
                  href={`/admin/users/${project.user_id}`}
                  className="inline-block mt-3 text-sm text-sage hover:text-sage/70 transition-colors"
                >
                  View Full Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
