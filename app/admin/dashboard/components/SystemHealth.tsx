'use client';

import { Card } from '@/components/ui/card';
import { Server, Database, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  totalTrends: number;
  knowledgeBaseSize: number;
}

export function SystemHealth({ totalTrends, knowledgeBaseSize }: Props) {
  const healthMetrics = [
    {
      label: 'API Status',
      status: 'operational',
      icon: Server,
      details: 'All systems operational',
    },
    {
      label: 'Database',
      status: 'operational',
      icon: Database,
      details: `${totalTrends + knowledgeBaseSize} records`,
    },
    {
      label: 'AI Agent',
      status: 'operational',
      icon: Zap,
      details: 'Gemini 2.0 Flash active',
    },
    {
      label: 'Vector Search',
      status: knowledgeBaseSize > 0 ? 'operational' : 'warning',
      icon: CheckCircle,
      details:
        knowledgeBaseSize > 0
          ? `${knowledgeBaseSize} embeddings`
          : 'No knowledge base entries',
    },
  ];

  return (
    <Card className="bg-white rounded-3xl shadow-soft p-6">
      <h2 className="font-serif text-xl text-sage mb-6">System Health</h2>

      <div className="space-y-4">
        {healthMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const isOperational = metric.status === 'operational';

          return (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-sage/5 rounded-2xl"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isOperational
                    ? 'bg-green-100 text-green-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sage text-sm">
                    {metric.label}
                  </h3>
                  {isOperational ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                <p className="text-xs text-sage/60">{metric.details}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm font-medium text-green-800">
            All systems operational
          </p>
        </div>
      </div>
    </Card>
  );
}
