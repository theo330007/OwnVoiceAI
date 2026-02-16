'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Package,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Film,
  LayoutGrid,
  MessageCircle,
  GraduationCap,
  Flame,
  BookOpen,
  Lightbulb,
  Heart,
  TrendingUp,
  Check,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  specs: any;
}

interface CaseStudy {
  id: string;
  title: string;
  client_name: string;
  description: string;
  results: string;
}

interface ContentIdea {
  hook: string;
  concept: string;
  cta: string;
}

interface Props {
  contentIdea: ContentIdea;
  trendTitle: string;
  products: Product[];
  caseStudies: CaseStudy[];
  onComplete: (data: any) => void;
  initialData?: any;
}

const TOTAL_STEPS = 5;

const FORMAT_OPTIONS = [
  {
    value: 'reel',
    label: 'Reel',
    description: 'Short-form vertical video (15-90s)',
    icon: Film,
  },
  {
    value: 'carousel',
    label: 'Carousel',
    description: 'Multi-slide educational post (up to 10 slides)',
    icon: LayoutGrid,
  },
  {
    value: 'story',
    label: 'Story',
    description: 'Ephemeral, raw, behind-the-scenes format',
    icon: MessageCircle,
  },
];

const TONE_OPTIONS = [
  {
    value: 'educational',
    label: 'Educational',
    description: 'Teach and inform with authority',
    icon: GraduationCap,
  },
  {
    value: 'bold',
    label: 'Bold & Provocative',
    description: 'Challenge assumptions, spark debate',
    icon: Flame,
  },
  {
    value: 'storytelling',
    label: 'Storytelling',
    description: 'Personal narrative, emotional connection',
    icon: BookOpen,
  },
];

const ANGLE_OPTIONS = [
  {
    value: 'direct_value',
    label: 'Direct Value',
    description: 'Lead with actionable tips and takeaways',
    icon: Lightbulb,
  },
  {
    value: 'personal_story',
    label: 'Personal Story',
    description: 'Share a personal experience tied to the trend',
    icon: Heart,
  },
  {
    value: 'trend_commentary',
    label: 'Trend Commentary',
    description: 'React to the trend with your expertise',
    icon: TrendingUp,
  },
];

export function Phase1ContextualBrief({
  contentIdea,
  trendTitle,
  products,
  caseStudies,
  onComplete,
  initialData = {},
}: Props) {
  const [currentStep, setCurrentStep] = useState(initialData.contentFormat ? 5 : 1);
  const [contentFormat, setContentFormat] = useState<string>(initialData.contentFormat || '');
  const [toneStyle, setToneStyle] = useState<string>(initialData.toneStyle || '');
  const [contentAngle, setContentAngle] = useState<string>(initialData.contentAngle || '');
  const [adaptationType, setAdaptationType] = useState<'none' | 'product' | 'case_study'>(
    initialData.adaptationType || 'none'
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    initialData.selectedProductId || null
  );
  const [selectedCaseStudyId, setSelectedCaseStudyId] = useState<string | null>(
    initialData.selectedCaseStudyId || null
  );
  const [additionalContext, setAdditionalContext] = useState<string>(
    initialData.additionalContext || ''
  );

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedCaseStudy = caseStudies.find((c) => c.id === selectedCaseStudyId);

  const handleContinue = () => {
    const data = {
      contentFormat,
      toneStyle,
      contentAngle,
      adaptationType,
      selectedProductId,
      selectedCaseStudyId,
      selectedProduct,
      selectedCaseStudy,
      additionalContext,
    };
    onComplete(data);
  };

  const handleOptionSelect = (setter: (val: string) => void, value: string) => {
    setter(value);
    setTimeout(() => setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS)), 300);
  };

  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));
  const goNext = () => setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return !!contentFormat;
      case 3: return !!toneStyle;
      case 4: return !!contentAngle;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step Progress */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (i + 1 <= currentStep) setCurrentStep(i + 1);
            }}
            className={`transition-all duration-300 rounded-full ${
              i + 1 === currentStep
                ? 'w-8 h-2.5 bg-sage'
                : i + 1 < currentStep
                ? 'w-2.5 h-2.5 bg-sage/40 cursor-pointer hover:bg-sage/60'
                : 'w-2.5 h-2.5 bg-sage/15'
            }`}
          />
        ))}
      </div>
      <p className="text-center text-sm text-sage/50 mb-4">
        Step {currentStep} of {TOTAL_STEPS}
      </p>

      {/* Step 1: Review Content Idea */}
      {currentStep === 1 && (
        <Card className="bg-gradient-to-br from-sage/5 to-dusty-rose/5 rounded-3xl shadow-soft p-8 border-2 border-sage/10">
          <div className="flex items-start gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-dusty-rose flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-serif text-3xl text-sage mb-2">{trendTitle}</h2>
              <p className="text-sage/60 text-sm">Your content starting point</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="p-4 bg-white/60 rounded-2xl">
              <h3 className="text-xs font-semibold text-sage/50 uppercase tracking-wide mb-2">Hook</h3>
              <p className="text-sage/80 leading-relaxed italic text-lg">"{contentIdea.hook}"</p>
            </div>

            <div className="p-4 bg-white/60 rounded-2xl">
              <h3 className="text-xs font-semibold text-sage/50 uppercase tracking-wide mb-2">Concept</h3>
              <p className="text-sage/80 leading-relaxed">{contentIdea.concept}</p>
            </div>

            <div className="p-4 bg-white/60 rounded-2xl">
              <h3 className="text-xs font-semibold text-sage/50 uppercase tracking-wide mb-2">Call-to-Action</h3>
              <p className="text-dusty-rose font-medium">{contentIdea.cta}</p>
            </div>
          </div>

          <Button
            onClick={() => setCurrentStep(2)}
            className="w-full mt-8 bg-sage hover:bg-sage/90 text-cream font-medium py-4 rounded-2xl flex items-center justify-center gap-2"
          >
            Start Creating
            <ChevronRight className="w-5 h-5" />
          </Button>
        </Card>
      )}

      {/* Step 2: Content Format */}
      {currentStep === 2 && (
        <Card className="bg-white rounded-3xl shadow-soft p-8">
          <h3 className="font-serif text-2xl text-sage mb-2">What format?</h3>
          <p className="text-sage/60 mb-6">Choose how this content will be delivered</p>

          <div className="space-y-3">
            {FORMAT_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = contentFormat === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(setContentFormat, option.value)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    isSelected
                      ? 'border-sage bg-sage/5 shadow-sm'
                      : 'border-sage/10 hover:border-sage/30 hover:bg-sage/[0.02]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-sage text-cream' : 'bg-sage/10 text-sage'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sage text-lg">{option.label}</p>
                    <p className="text-sm text-sage/60">{option.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-sage rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-cream" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 mt-8">
            <Button onClick={goBack} variant="outline" className="px-6 py-4 rounded-2xl">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              onClick={goNext}
              disabled={!contentFormat}
              className="flex-1 bg-sage hover:bg-sage/90 text-cream font-medium py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Tone & Style */}
      {currentStep === 3 && (
        <Card className="bg-white rounded-3xl shadow-soft p-8">
          <h3 className="font-serif text-2xl text-sage mb-2">What tone?</h3>
          <p className="text-sage/60 mb-6">Set the energy and voice for this piece</p>

          <div className="space-y-3">
            {TONE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = toneStyle === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(setToneStyle, option.value)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    isSelected
                      ? 'border-sage bg-sage/5 shadow-sm'
                      : 'border-sage/10 hover:border-sage/30 hover:bg-sage/[0.02]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-sage text-cream' : 'bg-sage/10 text-sage'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sage text-lg">{option.label}</p>
                    <p className="text-sm text-sage/60">{option.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-sage rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-cream" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 mt-8">
            <Button onClick={goBack} variant="outline" className="px-6 py-4 rounded-2xl">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              onClick={goNext}
              disabled={!toneStyle}
              className="flex-1 bg-sage hover:bg-sage/90 text-cream font-medium py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Content Angle */}
      {currentStep === 4 && (
        <Card className="bg-white rounded-3xl shadow-soft p-8">
          <h3 className="font-serif text-2xl text-sage mb-2">What angle?</h3>
          <p className="text-sage/60 mb-6">Choose your approach to the content</p>

          <div className="space-y-3">
            {ANGLE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = contentAngle === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(setContentAngle, option.value)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    isSelected
                      ? 'border-sage bg-sage/5 shadow-sm'
                      : 'border-sage/10 hover:border-sage/30 hover:bg-sage/[0.02]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-sage text-cream' : 'bg-sage/10 text-sage'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sage text-lg">{option.label}</p>
                    <p className="text-sm text-sage/60">{option.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-sage rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-cream" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 mt-8">
            <Button onClick={goBack} variant="outline" className="px-6 py-4 rounded-2xl">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              onClick={goNext}
              disabled={!contentAngle}
              className="flex-1 bg-sage hover:bg-sage/90 text-cream font-medium py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 5: Business Context */}
      {currentStep === 5 && (
        <Card className="bg-white rounded-3xl shadow-soft p-8">
          {/* Summary of choices */}
          <div className="flex flex-wrap gap-2 mb-6">
            {contentFormat && (
              <span className="px-3 py-1 bg-sage/10 text-sage text-sm rounded-full font-medium capitalize">
                {contentFormat}
              </span>
            )}
            {toneStyle && (
              <span className="px-3 py-1 bg-dusty-rose/10 text-dusty-rose text-sm rounded-full font-medium capitalize">
                {toneStyle === 'bold' ? 'Bold & Provocative' : toneStyle}
              </span>
            )}
            {contentAngle && (
              <span className="px-3 py-1 bg-sage/10 text-sage text-sm rounded-full font-medium">
                {contentAngle === 'direct_value' ? 'Direct Value' : contentAngle === 'personal_story' ? 'Personal Story' : 'Trend Commentary'}
              </span>
            )}
          </div>

          <h3 className="font-serif text-2xl text-sage mb-2">
            Business Context
          </h3>
          <p className="text-sage/60 mb-6">
            Optionally ground this content in your business reality
          </p>

          {/* Adaptation Type Selection */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setAdaptationType('none')}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                adaptationType === 'none'
                  ? 'border-sage bg-sage/5'
                  : 'border-sage/10 hover:border-sage/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    adaptationType === 'none' ? 'border-sage' : 'border-sage/30'
                  }`}
                >
                  {adaptationType === 'none' && <div className="w-3 h-3 rounded-full bg-sage" />}
                </div>
                <div>
                  <p className="font-semibold text-sage">No Adaptation</p>
                  <p className="text-sm text-sage/60">Keep the content generic and trend-focused</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setAdaptationType('product')}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                adaptationType === 'product'
                  ? 'border-sage bg-sage/5'
                  : 'border-sage/10 hover:border-sage/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    adaptationType === 'product' ? 'border-sage' : 'border-sage/30'
                  }`}
                >
                  {adaptationType === 'product' && <div className="w-3 h-3 rounded-full bg-sage" />}
                </div>
                <Package className="w-5 h-5 text-sage" />
                <div>
                  <p className="font-semibold text-sage">Adapt to Product Launch</p>
                  <p className="text-sm text-sage/60">Connect to a specific product or service</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setAdaptationType('case_study')}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                adaptationType === 'case_study'
                  ? 'border-sage bg-sage/5'
                  : 'border-sage/10 hover:border-sage/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    adaptationType === 'case_study' ? 'border-sage' : 'border-sage/30'
                  }`}
                >
                  {adaptationType === 'case_study' && <div className="w-3 h-3 rounded-full bg-sage" />}
                </div>
                <Briefcase className="w-5 h-5 text-sage" />
                <div>
                  <p className="font-semibold text-sage">Adapt to Case Study</p>
                  <p className="text-sm text-sage/60">Ground in a real client success story</p>
                </div>
              </div>
            </button>
          </div>

          {/* Product Selection */}
          {adaptationType === 'product' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-sage mb-3">Select Product:</label>
              {products.length === 0 ? (
                <div className="p-6 bg-sage/5 rounded-2xl text-center">
                  <p className="text-sage/60 text-sm">No products added yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                        selectedProductId === product.id
                          ? 'border-dusty-rose bg-dusty-rose/5'
                          : 'border-sage/10 hover:border-dusty-rose/30'
                      }`}
                    >
                      <h4 className="font-semibold text-sage mb-1">{product.name}</h4>
                      <p className="text-sm text-sage/70">{product.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Case Study Selection */}
          {adaptationType === 'case_study' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-sage mb-3">Select Case Study:</label>
              {caseStudies.length === 0 ? (
                <div className="p-6 bg-sage/5 rounded-2xl text-center">
                  <p className="text-sage/60 text-sm">No case studies added yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {caseStudies.map((cs) => (
                    <button
                      key={cs.id}
                      onClick={() => setSelectedCaseStudyId(cs.id)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                        selectedCaseStudyId === cs.id
                          ? 'border-dusty-rose bg-dusty-rose/5'
                          : 'border-sage/10 hover:border-dusty-rose/30'
                      }`}
                    >
                      <h4 className="font-semibold text-sage mb-1">{cs.title}</h4>
                      {cs.client_name && (
                        <p className="text-xs text-sage/50 mb-1">Client: {cs.client_name}</p>
                      )}
                      <p className="text-sm text-sage/70">{cs.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Additional Context */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-sage mb-2">
              Additional Context (Optional)
            </label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Any specific details, angles, or requirements?"
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none"
            />
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button onClick={goBack} variant="outline" className="px-6 py-4 rounded-2xl">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1 bg-sage hover:bg-sage/90 text-cream font-medium py-4 rounded-2xl flex items-center justify-center gap-2"
            >
              Continue to Asset Orchestration
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
