'use client';

import { Check } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface Props {
  currentPhase: number;
  onPhaseClick: (phase: number) => void;
}

const WORKFLOW_STEPS: Step[] = [
  {
    number: 1,
    title: 'Contextual Brief',
    description: 'Fine-tune with your business context',
  },
  {
    number: 2,
    title: 'Asset Orchestration',
    description: 'Generate scripts and visual assets',
  },
  {
    number: 3,
    title: 'OwnVoice Guardrail',
    description: 'Compliance and tone check',
  },
  {
    number: 4,
    title: 'Scheduling & Hand-off',
    description: 'Export and schedule content',
  },
];

export function WorkflowStepper({ currentPhase, onPhaseClick }: Props) {
  return (
    <div className="bg-white border-b border-sage/10 px-8 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          {WORKFLOW_STEPS.map((step, index) => {
            const isCompleted = step.number < currentPhase;
            const isCurrent = step.number === currentPhase;
            const isUpcoming = step.number > currentPhase;
            const canClick = step.number <= currentPhase;

            return (
              <div key={step.number} className="flex items-center flex-1">
                {/* Step Circle */}
                <button
                  onClick={() => canClick && onPhaseClick(step.number)}
                  disabled={!canClick}
                  className={`relative flex flex-col items-center group ${
                    canClick ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  {/* Circle */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                      isCompleted
                        ? 'bg-sage text-cream'
                        : isCurrent
                        ? 'bg-dusty-rose text-cream ring-4 ring-dusty-rose/20'
                        : 'bg-sage/10 text-sage/40'
                    } ${canClick ? 'hover:scale-110' : ''}`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span className="text-lg">{step.number}</span>
                    )}
                  </div>

                  {/* Labels */}
                  <div className="mt-3 text-center max-w-[140px]">
                    <p
                      className={`font-semibold text-sm transition-colors ${
                        isCurrent ? 'text-sage' : isCompleted ? 'text-sage/80' : 'text-sage/40'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-sage/50 mt-1">{step.description}</p>
                  </div>
                </button>

                {/* Connector Line */}
                {index < WORKFLOW_STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 relative" style={{ top: '-45px' }}>
                    <div
                      className={`h-full transition-all ${
                        step.number < currentPhase ? 'bg-sage' : 'bg-sage/20'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
