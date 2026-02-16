'use client';

import { useState } from 'react';
import { ProjectCard } from './ProjectCard';
import type { Project } from '@/app/actions/projects';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FolderOpen } from 'lucide-react';

interface Props {
  initialProjects: (Project & { notes_count: number })[];
}

export function ProjectsList({ initialProjects }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'completed' | 'archived'>('all');

  const filteredProjects = initialProjects.filter((project) => {
    if (activeTab === 'all') return true;
    return project.status === activeTab;
  });

  return (
    <div>
      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-8">
        <TabsList className="bg-white rounded-2xl p-1 border border-sage/10">
          <TabsTrigger value="all" className="rounded-xl">
            All ({initialProjects.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="rounded-xl">
            In Progress ({initialProjects.filter((p) => p.status === 'in_progress').length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-xl">
            Completed ({initialProjects.filter((p) => p.status === 'completed').length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="rounded-xl">
            Archived ({initialProjects.filter((p) => p.status === 'archived').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-soft p-12 text-center">
          <div className="w-20 h-20 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-10 h-10 text-sage/40" />
          </div>
          <h2 className="font-serif text-2xl text-sage mb-3">
            {activeTab === 'all'
              ? 'No projects yet'
              : `No ${activeTab.replace('_', ' ')} projects`}
          </h2>
          <p className="text-sage/60 mb-6 max-w-md mx-auto">
            {activeTab === 'all'
              ? 'Generate strategic insights from niche trends and start a workflow to create your first project.'
              : `You don't have any ${activeTab.replace('_', ' ')} projects yet.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
