'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingProgress } from './components/OnboardingProgress';
import OnboardingStep1 from './components/OnboardingStep1';
import OnboardingStep2 from './components/OnboardingStep2';
import OnboardingStep3 from './components/OnboardingStep3';
import OnboardingStep4 from './components/OnboardingStep4';
import OnboardingStep5 from './components/OnboardingStep5';
import { EMPTY_ONBOARDING } from '@/lib/types/onboarding';
import type { OnboardingAnswers } from '@/lib/types/onboarding';
import { Loader2, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingAnswers>(EMPTY_ONBOARDING);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (updates: Partial<OnboardingAnswers>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    // Save partial progress before navigating away
    try {
      await fetch('/api/onboarding/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: formData }),
      });
    } catch {
      // Best-effort save — don't block navigation on failure
    }
    router.push('/profile');
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: formData }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to process onboarding');
      }

      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-dusty-rose/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-dusty-rose animate-pulse" />
          </div>
          <h2 className="font-serif text-3xl text-sage mb-3">Building your profile...</h2>
          <p className="text-sage/60 mb-6">
            Our AI is analyzing your answers to create your strategic brand profile. This takes a few seconds.
          </p>
          <Loader2 className="w-6 h-6 text-sage animate-spin mx-auto" />
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => { setIsProcessing(false); setError(''); }}
                className="mt-2 text-sm text-red-600 underline"
              >
                Go back and try again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const stepProps = {
    data: formData,
    onChange: handleChange,
    onNext: handleNext,
    onBack: currentStep > 1 ? handleBack : undefined,
    onSkip: handleSkip,
  };

  return (
    <div className="min-h-screen bg-cream">
      <OnboardingProgress currentStep={currentStep} />
      {error && (
        <div className="max-w-2xl mx-auto px-6 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
      {currentStep === 1 && <OnboardingStep1 {...stepProps} />}
      {currentStep === 2 && <OnboardingStep2 {...stepProps} />}
      {currentStep === 3 && <OnboardingStep3 {...stepProps} />}
      {currentStep === 4 && <OnboardingStep4 {...stepProps} />}
      {currentStep === 5 && <OnboardingStep5 {...stepProps} />}
    </div>
  );
}
