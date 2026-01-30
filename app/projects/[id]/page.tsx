import { getProjectById } from '@/app/actions/projects';
import { requireAuth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { ProjectHeader } from './components/ProjectHeader';
import { WorkflowProgress } from './components/WorkflowProgress';
import { ProjectContent } from './components/ProjectContent';

interface Props {
  params: {
    id: string;
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  await requireAuth();

  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <ProjectHeader project={project} />
        <WorkflowProgress project={project} />
        <ProjectContent project={project} />
      </div>
    </div>
  );
}
