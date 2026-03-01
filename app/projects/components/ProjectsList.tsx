'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Project } from '@/app/actions/projects';
import { createWorkflowFromProject } from '@/app/actions/workflows';
import {
  BookOpen, Camera, Megaphone, Users2,
  CheckCircle2, Clock, Archive,
  Play, Sparkles, Loader2, FolderOpen,
} from 'lucide-react';

interface Props {
  initialProjects: (Project & { notes_count: number })[];
}

const CONTENT_TYPE_CONFIG = {
  educational:       { label: 'Educational',       icon: BookOpen,  color: 'text-blue-600',   bgColor: 'bg-blue-50' },
  behind_the_scenes: { label: 'Behind the Scenes', icon: Camera,    color: 'text-purple-600', bgColor: 'bg-purple-50' },
  promotional:       { label: 'Promotional',        icon: Megaphone, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  interactive:       { label: 'Interactive',        icon: Users2,    color: 'text-green-600',  bgColor: 'bg-green-50' },
};

const PHASE_CONFIG = {
  ideation:  { label: 'Ideation',  color: 'text-blue-600',   bgColor: 'bg-blue-50' },
  drafting:  { label: 'Drafting',  color: 'text-purple-600', bgColor: 'bg-purple-50' },
  editing:   { label: 'Editing',   color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ready:     { label: 'Ready',     color: 'text-green-600',  bgColor: 'bg-green-50' },
  published: { label: 'Published', color: 'text-sage',       bgColor: 'bg-sage/10' },
};

// ─── Row component (needs per-row state for workflow creation) ────────────────

function ProjectRow({ project }: { project: Project & { notes_count: number } }) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  const contentCfg = CONTENT_TYPE_CONFIG[project.content_type] ?? CONTENT_TYPE_CONFIG.educational;
  const phaseCfg   = PHASE_CONFIG[project.current_phase]       ?? PHASE_CONFIG.ideation;
  const Icon       = contentCfg.icon;

  const statusDot =
    project.status === 'completed' ? 'bg-green-400' :
    project.status === 'archived'  ? 'bg-sage/20'   : 'bg-dusty-rose';

  const handleStart = async () => {
    setStarting(true);
    try {
      const workflow = await createWorkflowFromProject(project.id);
      router.push(`/lab/workflow/${workflow.id}`);
    } catch {
      setStarting(false);
    }
  };

  return (
    <tr className="group border-b border-sage/6 hover:bg-sage/[0.02] transition-colors">
      {/* Status dot */}
      <td className="py-3 pl-4 pr-2 w-6">
        <span className={`inline-block w-2 h-2 rounded-full ${statusDot} flex-shrink-0`} />
      </td>

      {/* Title + pillar */}
      <td className="py-3 pr-4 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`${contentCfg.bgColor} p-1.5 rounded-lg flex-shrink-0`}>
            <Icon className={`w-3.5 h-3.5 ${contentCfg.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-sage leading-snug truncate max-w-xs">
              {project.title}
            </p>
            {project.trend_title && (
              <p className="text-[11px] text-sage/40 truncate">{project.trend_title}</p>
            )}
          </div>
        </div>
      </td>

      {/* Content type */}
      <td className="py-3 pr-4 hidden sm:table-cell">
        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${contentCfg.bgColor} ${contentCfg.color} whitespace-nowrap`}>
          {contentCfg.label}
        </span>
      </td>

      {/* Phase */}
      <td className="py-3 pr-4 hidden md:table-cell">
        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${phaseCfg.bgColor} ${phaseCfg.color} whitespace-nowrap`}>
          {phaseCfg.label}
        </span>
      </td>

      {/* Progress */}
      <td className="py-3 pr-4 hidden lg:table-cell w-28">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-sage/8 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-sage to-dusty-rose h-1 rounded-full"
              style={{ width: `${project.completion_percentage}%` }}
            />
          </div>
          <span className="text-[10px] text-sage/40 font-medium w-7 text-right flex-shrink-0">
            {project.completion_percentage}%
          </span>
        </div>
      </td>

      {/* Date */}
      <td className="py-3 pr-4 hidden xl:table-cell text-[11px] text-sage/35 whitespace-nowrap">
        {new Date(project.created_at).toLocaleDateString()}
      </td>

      {/* Action */}
      <td className="py-3 pr-4 text-right">
        {project.workflow_id ? (
          <Link
            href={`/lab/workflow/${project.workflow_id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sage to-dusty-rose hover:opacity-90 text-cream text-[11px] font-semibold rounded-lg transition-opacity whitespace-nowrap"
          >
            <Play className="w-2.5 h-2.5" />
            Open
          </Link>
        ) : (
          <button
            onClick={handleStart}
            disabled={starting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sage/8 hover:bg-sage/15 text-sage text-[11px] font-semibold rounded-lg border border-sage/15 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {starting ? (
              <><Loader2 className="w-2.5 h-2.5 animate-spin" />Starting…</>
            ) : (
              <><Sparkles className="w-2.5 h-2.5" />Start Workflow</>
            )}
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Main list ────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'all',         label: 'All' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed',   label: 'Completed' },
  { key: 'archived',    label: 'Archived' },
] as const;

type TabKey = typeof TABS[number]['key'];

export function ProjectsList({ initialProjects }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const counts = {
    all:         initialProjects.length,
    in_progress: initialProjects.filter(p => p.status === 'in_progress').length,
    completed:   initialProjects.filter(p => p.status === 'completed').length,
    archived:    initialProjects.filter(p => p.status === 'archived').length,
  };

  const filtered = initialProjects.filter(p =>
    activeTab === 'all' ? true : p.status === activeTab
  );

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-white rounded-2xl border border-sage/10 w-fit mb-6">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-sage text-cream shadow-sm'
                : 'text-sage/50 hover:text-sage'
            }`}
          >
            {label}
            <span className={`ml-1.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
              activeTab === key ? 'bg-white/20 text-cream' : 'bg-sage/8 text-sage/50'
            }`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-soft p-12 text-center">
          <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <FolderOpen className="w-8 h-8 text-sage/40" />
          </div>
          <h2 className="font-serif text-xl text-sage mb-2">
            {activeTab === 'all' ? 'No projects yet' : `No ${activeTab.replace('_', ' ')} projects`}
          </h2>
          <p className="text-sage/50 text-sm max-w-sm mx-auto">
            {activeTab === 'all'
              ? 'Generate ideas from the dashboard and save them as projects to get started.'
              : `You don't have any ${activeTab.replace('_', ' ')} projects yet.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-sage/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sage/8 bg-sage/[0.02]">
                <th className="py-2.5 pl-4 pr-2 w-6" />
                <th className="py-2.5 pr-4 text-left text-[10px] font-bold text-sage/40 uppercase tracking-widest">
                  Project
                </th>
                <th className="py-2.5 pr-4 text-left text-[10px] font-bold text-sage/40 uppercase tracking-widest hidden sm:table-cell">
                  Type
                </th>
                <th className="py-2.5 pr-4 text-left text-[10px] font-bold text-sage/40 uppercase tracking-widest hidden md:table-cell">
                  Phase
                </th>
                <th className="py-2.5 pr-4 text-left text-[10px] font-bold text-sage/40 uppercase tracking-widest hidden lg:table-cell w-28">
                  Progress
                </th>
                <th className="py-2.5 pr-4 text-left text-[10px] font-bold text-sage/40 uppercase tracking-widest hidden xl:table-cell">
                  Created
                </th>
                <th className="py-2.5 pr-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(project => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
