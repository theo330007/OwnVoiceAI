'use client';

import { Card } from '@/components/ui/card';
import {
  Users,
  Activity,
  TrendingUp,
  Star,
  BarChart3,
  BookOpen,
} from 'lucide-react';

interface Props {
  totalUsers: number;
  activeUsers: number;
  totalValidations: number;
  avgRelevanceScore: number;
  totalTrends: number;
  knowledgeBaseSize: number;
}

export function KPICards({
  totalUsers,
  activeUsers,
  totalValidations,
  avgRelevanceScore,
  totalTrends,
  knowledgeBaseSize,
}: Props) {
  const kpis = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'bg-sage/10 text-sage',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Active Users',
      value: activeUsers,
      icon: Activity,
      color: 'bg-dusty-rose/10 text-dusty-rose',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Total Validations',
      value: totalValidations,
      icon: BarChart3,
      color: 'bg-sage/10 text-sage',
      trend: '+24%',
      trendUp: true,
    },
    {
      label: 'Avg. Relevance',
      value: avgRelevanceScore,
      icon: Star,
      color: 'bg-dusty-rose/10 text-dusty-rose',
      trend: '+3%',
      trendUp: true,
    },
    {
      label: 'Total Trends',
      value: totalTrends,
      icon: TrendingUp,
      color: 'bg-sage/10 text-sage',
      trend: '0%',
      trendUp: false,
    },
    {
      label: 'Knowledge Base',
      value: knowledgeBaseSize,
      icon: BookOpen,
      color: 'bg-dusty-rose/10 text-dusty-rose',
      trend: '+5%',
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="p-6 bg-white rounded-3xl shadow-soft">
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-2xl ${kpi.color} flex items-center justify-center`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold text-sage mb-1">{kpi.value}</p>
            <p className="text-sm text-sage/70 mb-2">{kpi.label}</p>
            <div className="flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  kpi.trendUp ? 'text-green-600' : 'text-sage/50'
                }`}
              >
                {kpi.trend}
              </span>
              <span className="text-xs text-sage/50">vs last month</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
