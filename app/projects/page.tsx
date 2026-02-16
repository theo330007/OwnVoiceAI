import { requireAuth } from '@/lib/auth';
import { getUserProjects, getProjectStats } from '@/app/actions/projects';
import { ProjectsList } from './components/ProjectsList';
import { ProjectsStats } from './components/ProjectsStats';
import { FolderKanban } from 'lucide-react';
import Link from 'next/link';

export default async function ProjectsPage() {
  await requireAuth();

  const [projects, stats] = await Promise.all([
    getUserProjects(),
    getProjectStats(),
  ]);

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FolderKanban className="w-8 h-8 text-sage" />
                <h1 className="font-serif text-4xl text-sage">
                  Content Projects
                </h1>
              </div>
              <p className="text-sage/70">
                Track and manage your content creation workflows
              </p>
            </div>

            <Link
              href="/dashboard"
              className="px-6 py-3 bg-sage hover:bg-sage/90 text-cream rounded-2xl transition-colors"
            >
              Back to Dashboard
            </Link>
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
