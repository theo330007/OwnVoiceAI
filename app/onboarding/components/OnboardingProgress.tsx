'use client';

import { Check } from 'lucide-react';

const STEPS = [
  { number: 1, title: 'Identity', description: 'Who you are' },
  { number: 2, title: 'Offer', description: 'What you sell' },
  { number: 3, title: 'Positioning', description: 'Your unique angle' },
  { number: 4, title: 'Content', description: 'Your brand voice' },
  { number: 5, title: 'Story', description: 'Your journey' },
  { number: 6, title: 'Industry', description: 'Primary focus' },
  { number: 7, title: 'Pillars', description: 'Content themes' },
  { number: 8, title: 'Voice', description: 'Brand keywords' },
];

interface Props {
  currentStep: number;
}

export function OnboardingProgress({ currentStep }: Props) {
  return (
    <div className="bg-white border-b border-sage/10 px-4 py-5">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all text-xs ${
                      isCompleted
                        ? 'bg-sage text-cream'
                        : isCurrent
                        ? 'bg-dusty-rose text-cream ring-4 ring-dusty-rose/20'
                        : 'bg-sage/10 text-sage/40'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>
                  <div className="mt-1.5 text-center max-w-[64px]">
                    <p
                      className={`font-semibold text-[10px] transition-colors ${
                        isCurrent ? 'text-sage' : isCompleted ? 'text-sage/80' : 'text-sage/40'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[9px] text-sage/50 mt-0.5 hidden md:block leading-tight">{step.description}</p>
                  </div>
                </div>

                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1.5 relative" style={{ top: '-10px' }}>
                    <div
                      className={`h-full transition-all ${
                        step.number < currentStep ? 'bg-sage' : 'bg-sage/20'
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
