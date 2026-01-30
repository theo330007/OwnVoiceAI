import { getUserProjects, getProjectStats } from '@/app/actions/projects';
import { requireAuth } from '@/lib/auth';
import { ProjectCard } from './components/ProjectCard';
import { NewProjectButton } from './components/NewProjectButton';
import { ProjectStats } from './components/ProjectStats';
import { FolderOpen } from 'lucide-react';

export default async function ProjectsPage() {
  await requireAuth();

  const [projects, stats] = await Promise.all([
    getUserProjects(),
    getProjectStats(),
  ]);

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl text-sage mb-3">My Projects</h1>
            <p className="text-sage/70">
              Create and manage your content strategy projects
            </p>
          </div>
          <NewProjectButton />
        </div>

        {/* Stats */}
        <ProjectStats stats={stats} />

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-soft p-12 text-center">
            <div className="w-20 h-20 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-sage/40" />
            </div>
            <h2 className="font-serif text-2xl text-sage mb-3">
              No projects yet
            </h2>
            <p className="text-sage/60 mb-6 max-w-md mx-auto">
              Start your first content strategy project to validate ideas and create
              winning content.
            </p>
            <NewProjectButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
