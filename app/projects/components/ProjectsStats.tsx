'use client';

import { Card } from '@/components/ui/card';
import { FolderOpen, PlayCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface Stats {
  total_projects: number;
  in_progress_projects: number;
  completed_projects: number;
  avg_completion_percentage: number;
}

interface Props {
  stats: Stats;
}

export function ProjectsStats({ stats }: Props) {
  const statCards = [
    {
      label: 'Total Projects',
      value: stats.total_projects,
      icon: FolderOpen,
      color: 'text-sage',
      bgColor: 'bg-sage/10',
    },
    {
      label: 'In Progress',
      value: stats.in_progress_projects,
      icon: PlayCircle,
      color: 'text-dusty-rose',
      bgColor: 'bg-dusty-rose/10',
    },
    {
      label: 'Completed',
      value: stats.completed_projects,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Avg. Progress',
      value: `${Math.round(stats.avg_completion_percentage || 0)}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="bg-white rounded-2xl shadow-soft p-6 border border-sage/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-sm text-sage/60 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-sage">{stat.value}</p>
          </Card>
        );
      })}
    </div>
  );
}
