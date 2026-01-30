'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Circle } from 'lucide-react';
import type { Project, ProjectStep } from '@/lib/types/project';
import { updateProject } from '@/app/actions/projects';

const steps: Array<{ id: ProjectStep; label: string; description: string }> = [
  {
    id: 'setup',
    label: 'Setup',
    description: 'Define project goals and parameters',
  },
  {
    id: 'research',
    label: 'Research',
    description: 'Analyze trends and gather insights',
  },
  {
    id: 'planning',
    label: 'Planning',
    description: 'Create content strategy and plan',
  },
  {
    id: 'execution',
    label: 'Execution',
    description: 'Produce and publish content',
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Analyze results and iterate',
  },
];

interface Props {
  project: Project;
}

export function WorkflowProgress({ project }: Props) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const currentStepIndex = steps.findIndex((s) => s.id === project.current_step);

  const handleStepClick = async (stepId: ProjectStep) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await updateProject(project.id, {
        current_step: stepId,
      });
      router.refresh();
    } catch (error) {
      console.error('Failed to update step:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-soft p-8 mb-8">
      <h2 className="font-serif text-2xl text-sage mb-6">Workflow Progress</h2>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-sage/10">
          <div
            className="h-full bg-sage transition-all duration-500"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-5 gap-4">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isClickable = !isUpdating;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                disabled={!isClickable}
                className="flex flex-col items-center text-center group disabled:cursor-not-allowed"
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all ${
                    isCompleted || isCurrent
                      ? 'bg-sage text-cream'
                      : 'bg-sage/10 text-sage/40 group-hover:bg-sage/20'
                  } ${isCurrent ? 'ring-4 ring-sage/20' : ''}`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>

                {/* Label */}
                <div
                  className={`font-medium text-sm mb-1 ${
                    isCurrent ? 'text-sage' : 'text-sage/60'
                  }`}
                >
                  {step.label}
                </div>

                {/* Description */}
                <div className="text-xs text-sage/50 leading-tight">
                  {step.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
