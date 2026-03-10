import { requireAuth } from '@/lib/auth';
import { getUserProjects, getProjectStats } from '@/app/actions/projects';
import { ProjectsList } from './components/ProjectsList';
import { ProjectsStats } from './components/ProjectsStats';

export default async function ProjectsPage() {
  await requireAuth();

  const [projects, stats] = await Promise.all([
    getUserProjects(),
    getProjectStats(),
  ]);

  return (
    <div className="min-h-screen bg-cream">
      <div className="px-8 py-8">
        <header className="mb-8">
          <div className="mb-4">
            <h1 className="font-serif text-4xl text-sage">Content Projects</h1>
            <p className="text-sage/50 text-sm mt-1">
              Track and manage your content creation workflows
            </p>
          </div>

          {/* Stats */}
          {stats && <ProjectsStats stats={stats} />}
        </header>

        {/* Projects List */}
        <ProjectsList initialProjects={projects} />
      </div>
    </div>
  );
}
