'use client';

import Link from 'next/link';
import { CheckCircle2, TrendingUp, Lightbulb, CalendarDays, Play } from 'lucide-react';

interface Props {
  nicheTrendsCount: number;
  projectsTotal: number;
  projectsInProgress: number;
  hasEditorialPlan: boolean;
}

export function ContentPipelineWidget({
  nicheTrendsCount,
  projectsTotal,
  projectsInProgress,
  hasEditorialPlan,
}: Props) {
  const steps = [
    {
      id: 'discover',
      icon: TrendingUp,
      label: 'Discover',
      statusText: nicheTrendsCount > 0 ? `${nicheTrendsCount} trends loaded` : 'Browse trends',
      isDone: nicheTrendsCount > 0,
      href: '/dashboard',
      ctaLabel: nicheTrendsCount > 0 ? 'View trends' : 'Start here',
    },
    {
      id: 'ideate',
      icon: Lightbulb,
      label: 'Ideate',
      statusText:
        projectsTotal > 0
          ? `${projectsTotal} idea${projectsTotal !== 1 ? 's' : ''} saved`
          : 'Generate ideas',
      isDone: projectsTotal > 0,
      href: '/dashboard',
      ctaLabel: projectsTotal > 0 ? 'Generate more' : 'Generate ideas',
    },
    {
      id: 'plan',
      icon: CalendarDays,
      label: 'Plan',
      statusText: hasEditorialPlan ? 'Calendar planned' : 'Plan your month',
      isDone: hasEditorialPlan,
      href: '/editorial',
      ctaLabel: hasEditorialPlan ? 'Edit calendar' : 'Open calendar',
    },
    {
      id: 'create',
      icon: Play,
      label: 'Create',
      statusText:
        projectsInProgress > 0
          ? `${projectsInProgress} in progress`
          : 'Start a workflow',
      isDone: projectsInProgress > 0,
      href: '/projects',
      ctaLabel: projectsInProgress > 0 ? 'Continue' : 'View projects',
    },
  ] as const;

  const completedCount = steps.filter(s => s.isDone).length;

  return (
    <div className="bg-white border border-warm-border rounded-3xl p-5 shadow-soft mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold text-sage/40 uppercase tracking-widest">
            Content Pipeline
          </p>
          <p className="text-xs text-sage/50 mt-0.5">
            {completedCount === 4
              ? 'All steps complete — keep creating!'
              : `Step ${completedCount + 1} of 4`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {steps.map(s => (
            <span
              key={s.id}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                s.isDone ? 'bg-sage' : 'bg-sage/15'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-start">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === steps.length - 1;
          const nextDone = !isLast && steps[idx + 1].isDone;

          return (
            <div key={step.id} className="flex items-start flex-1 min-w-0">
              {/* Step column */}
              <div className="flex flex-col items-center min-w-0 flex-1 px-1">
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 mb-2 transition-all ${
                    step.isDone
                      ? 'bg-sage text-cream shadow-soft'
                      : 'bg-sage/8 text-sage/30'
                  }`}
                >
                  {step.isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Label */}
                <p
                  className={`font-serif text-sm font-semibold leading-none mb-1 text-center ${
                    step.isDone ? 'text-sage' : 'text-sage/40'
                  }`}
                >
                  {step.label}
                </p>

                {/* Status */}
                <p className="text-[11px] text-sage/50 leading-tight text-center mb-1.5 px-1 line-clamp-1">
                  {step.statusText}
                </p>

                {/* CTA */}
                <Link
                  href={step.href}
                  className={`text-[11px] font-semibold transition-colors ${
                    step.isDone
                      ? 'text-sage/40 hover:text-sage'
                      : 'text-dusty-rose hover:text-dusty-rose/80'
                  }`}
                >
                  {step.ctaLabel} →
                </Link>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  className={`h-px w-4 flex-shrink-0 mt-4 transition-colors ${
                    step.isDone && nextDone ? 'bg-sage/30' : 'bg-warm-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
