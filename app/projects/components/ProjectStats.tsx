'use client';

import { FolderOpen, Play, CheckCircle, FileText } from 'lucide-react';

interface Stats {
  total: number;
  active: number;
  completed: number;
  draft: number;
}

interface Props {
  stats: Stats;
}

export function ProjectStats({ stats }: Props) {
  const statCards = [
    {
      label: 'Total Projects',
      value: stats.total,
      icon: FolderOpen,
      color: 'text-sage',
      bgColor: 'bg-sage/10',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: Play,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Drafts',
      value: stats.draft,
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-3xl shadow-soft p-6"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-sage">{stat.value}</p>
              <p className="text-sm text-sage/60">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
