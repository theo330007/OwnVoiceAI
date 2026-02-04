'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Package, Briefcase, ChevronRight } from 'lucide-react';

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

export function Phase1ContextualBrief({
  contentIdea,
  trendTitle,
  products,
  caseStudies,
  onComplete,
  initialData = {},
}: Props) {
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
      adaptationType,
      selectedProductId,
      selectedCaseStudyId,
      selectedProduct,
      selectedCaseStudy,
      additionalContext,
    };

    onComplete(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Original Content Idea */}
      <Card className="bg-gradient-to-br from-sage/5 to-dusty-rose/5 rounded-3xl shadow-soft p-8 border-2 border-sage/10">
        <div className="flex items-start gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-dusty-rose flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-serif text-3xl text-sage mb-2">{trendTitle}</h2>
            <p className="text-sage/70 text-sm">Original Strategic Insight</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sage mb-2">Hook:</h3>
            <p className="text-sage/80 leading-relaxed italic">"{contentIdea.hook}"</p>
          </div>

          <div>
            <h3 className="font-semibold text-sage mb-2">Concept:</h3>
            <p className="text-sage/80 leading-relaxed">{contentIdea.concept}</p>
          </div>

          <div>
            <h3 className="font-semibold text-sage mb-2">Call-to-Action:</h3>
            <p className="text-dusty-rose font-medium">{contentIdea.cta}</p>
          </div>
        </div>
      </Card>

      {/* Contextual Adaptation */}
      <Card className="bg-white rounded-3xl shadow-soft p-8">
        <h3 className="font-serif text-2xl text-sage mb-4">
          Fine-Tune with Your Business Context
        </h3>
        <p className="text-sage/70 mb-6">
          Should we adapt this content to a specific product launch or client case study? This
          grounds the content in your actual business reality.
        </p>

        {/* Adaptation Type Selection */}
        <div className="space-y-4 mb-6">
          <button
            onClick={() => setAdaptationType('none')}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
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
                {adaptationType === 'none' && (
                  <div className="w-3 h-3 rounded-full bg-sage" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sage">No Adaptation</p>
                <p className="text-sm text-sage/60">
                  Keep the content generic and trend-focused
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setAdaptationType('product')}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
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
                {adaptationType === 'product' && (
                  <div className="w-3 h-3 rounded-full bg-sage" />
                )}
              </div>
              <Package className="w-5 h-5 text-sage" />
              <div>
                <p className="font-semibold text-sage">Adapt to Product Launch</p>
                <p className="text-sm text-sage/60">
                  Connect to a specific product or service you offer
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setAdaptationType('case_study')}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
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
                {adaptationType === 'case_study' && (
                  <div className="w-3 h-3 rounded-full bg-sage" />
                )}
              </div>
              <Briefcase className="w-5 h-5 text-sage" />
              <div>
                <p className="font-semibold text-sage">Adapt to Case Study</p>
                <p className="text-sm text-sage/60">
                  Ground in a real client success story
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Product Selection */}
        {adaptationType === 'product' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-sage mb-3">
              Select Product or Service:
            </label>
            {products.length === 0 ? (
              <div className="p-6 bg-sage/5 rounded-2xl text-center">
                <p className="text-sage/60 text-sm">
                  No products added yet. You can add products in your profile settings.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
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
            <label className="block text-sm font-medium text-sage mb-3">
              Select Case Study:
            </label>
            {caseStudies.length === 0 ? (
              <div className="p-6 bg-sage/5 rounded-2xl text-center">
                <p className="text-sage/60 text-sm">
                  No case studies added yet. You can add case studies in your profile settings.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {caseStudies.map((caseStudy) => (
                  <button
                    key={caseStudy.id}
                    onClick={() => setSelectedCaseStudyId(caseStudy.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      selectedCaseStudyId === caseStudy.id
                        ? 'border-dusty-rose bg-dusty-rose/5'
                        : 'border-sage/10 hover:border-dusty-rose/30'
                    }`}
                  >
                    <h4 className="font-semibold text-sage mb-1">{caseStudy.title}</h4>
                    {caseStudy.client_name && (
                      <p className="text-xs text-sage/50 mb-1">Client: {caseStudy.client_name}</p>
                    )}
                    <p className="text-sm text-sage/70">{caseStudy.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Additional Context */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-sage mb-3">
            Additional Context (Optional):
          </label>
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Any specific details, angles, or requirements for this content?"
            rows={4}
            className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none"
          />
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="w-full bg-sage hover:bg-sage/90 text-cream font-medium py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          Continue to Asset Orchestration
          <ChevronRight className="w-5 h-5" />
        </Button>
      </Card>
    </div>
  );
}
