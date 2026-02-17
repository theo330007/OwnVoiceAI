'use client';

import { Check } from 'lucide-react';

const STEPS = [
  { number: 1, title: 'Identity', description: 'Who you are' },
  { number: 2, title: 'Offer', description: 'What you sell' },
  { number: 3, title: 'Positioning', description: 'Your unique angle' },
  { number: 4, title: 'Content DNA', description: 'Your brand voice' },
  { number: 5, title: 'Story', description: 'Your journey' },
];

interface Props {
  currentStep: number;
}

export function OnboardingProgress({ currentStep }: Props) {
  return (
    <div className="bg-white border-b border-sage/10 px-8 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all text-sm ${
                      isCompleted
                        ? 'bg-sage text-cream'
                        : isCurrent
                        ? 'bg-dusty-rose text-cream ring-4 ring-dusty-rose/20'
                        : 'bg-sage/10 text-sage/40'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center max-w-[100px]">
                    <p
                      className={`font-semibold text-xs transition-colors ${
                        isCurrent ? 'text-sage' : isCompleted ? 'text-sage/80' : 'text-sage/40'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[10px] text-sage/50 mt-0.5 hidden sm:block">{step.description}</p>
                  </div>
                </div>

                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-3 relative" style={{ top: '-12px' }}>
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
