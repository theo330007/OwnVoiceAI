'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Video, Image, Zap, Copy, CheckCircle, ChevronRight, Download } from 'lucide-react';
import { gemini } from '@/lib/services/gemini.service';

interface Props {
  phase1Data: any;
  contentIdea: any;
  trendTitle: string;
  brandStyle?: string;
  onComplete: (data: any) => void;
  initialData?: any;
}

export function Phase2AssetOrchestration({
  phase1Data,
  contentIdea,
  trendTitle,
  brandStyle,
  onComplete,
  initialData = {},
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState<any>(initialData.script || null);
  const [hookVariations, setHookVariations] = useState<any[]>(initialData.hookVariations || []);
  const [bRollChecklist, setBRollChecklist] = useState<string[]>(initialData.bRollChecklist || []);
  const [visualBoardPrompts, setVisualBoardPrompts] = useState<string[]>(
    initialData.visualBoardPrompts || []
  );
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // Build context-aware prompt
      let contextInfo = '';
      if (phase1Data.adaptationType === 'product' && phase1Data.selectedProduct) {
        contextInfo = `Product Context:\n- Name: ${phase1Data.selectedProduct.name}\n- Description: ${phase1Data.selectedProduct.description}\n`;
      } else if (phase1Data.adaptationType === 'case_study' && phase1Data.selectedCaseStudy) {
        contextInfo = `Case Study Context:\n- Title: ${phase1Data.selectedCaseStudy.title}\n- Client: ${phase1Data.selectedCaseStudy.client_name || 'N/A'}\n- Results: ${phase1Data.selectedCaseStudy.results}\n`;
      }

      if (phase1Data.additionalContext) {
        contextInfo += `\nAdditional Context: ${phase1Data.additionalContext}`;
      }

      const prompt = `You are a professional content strategist creating production-ready assets for wellness content creators.

TREND: ${trendTitle}

ORIGINAL CONTENT IDEA:
Hook: ${contentIdea.hook}
Concept: ${contentIdea.concept}
CTA: ${contentIdea.cta}

${contextInfo ? `BUSINESS CONTEXT:\n${contextInfo}\n` : ''}

Generate the following assets:

1. **Dual-Column Script** (for Instagram Reel/TikTok):
   - Left column: Visual Cues (what to film, 5-7 scenes)
   - Right column: Audio/Captions (what to say or show as text)
   - Make it actionable and specific

2. **B-Roll Checklist** (5-7 specific shots needed):
   - Exact shot descriptions
   - Include angles, lighting suggestions
   - Reference the trend style

3. **A/B Hook Testing** (3 variations):
   - Variation A: Viral Reach (algorithm-optimized, bold claim)
   - Variation B: Community Trust (authentic, relatable)
   - Variation C: Direct Value (clear benefit, educational)

4. **Visual Board Prompts** (3 prompts for image generation):
   - Reel cover image prompt
   - Carousel background prompt
   - Story template prompt
   - Use style: ${brandStyle || 'Minimalist sage and cream aesthetic, organic wellness vibe'}

Return as JSON:
{
  "script": {
    "scenes": [
      {"visual": "...", "audio": "..."}
    ]
  },
  "broll_checklist": ["shot 1", "shot 2", ...],
  "hook_variations": [
    {"type": "Viral Reach", "hook": "..."},
    {"type": "Community Trust", "hook": "..."},
    {"type": "Direct Value", "hook": "..."}
  ],
  "visual_board": ["prompt 1", "prompt 2", "prompt 3"]
}`;

      const geminiService = (await import('@/lib/services/gemini.service')).gemini;
      const response = await geminiService.generateText(prompt);

      // Parse JSON
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }

      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const assets = JSON.parse(jsonStr);

      setScript(assets.script);
      setHookVariations(assets.hook_variations || []);
      setBRollChecklist(assets.broll_checklist || []);
      setVisualBoardPrompts(assets.visual_board || []);
    } catch (error: any) {
      console.error('Asset generation failed:', error);
      alert('Failed to generate assets. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleContinue = () => {
    onComplete({
      script,
      hookVariations,
      bRollChecklist,
      visualBoardPrompts,
    });
  };

  const downloadProductionSheet = () => {
    const content = `PRODUCTION SHEET
${trendTitle}

=== DUAL-COLUMN SCRIPT ===
${script?.scenes
  ?.map(
    (scene: any, idx: number) =>
      `Scene ${idx + 1}:\nVISUAL: ${scene.visual}\nAUDIO: ${scene.audio}\n`
  )
  .join('\n')}

=== B-ROLL CHECKLIST ===
${bRollChecklist.map((shot, idx) => `${idx + 1}. ${shot}`).join('\n')}

=== HOOK VARIATIONS ===
${hookVariations.map((hook) => `[${hook.type}]: ${hook.hook}`).join('\n\n')}

=== VISUAL BOARD PROMPTS ===
${visualBoardPrompts.map((prompt, idx) => `${idx + 1}. ${prompt}`).join('\n\n')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-sheet-${trendTitle.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!script && !isGenerating) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white rounded-3xl shadow-soft p-12 text-center">
          <Zap className="w-16 h-16 text-dusty-rose mx-auto mb-6" />
          <h2 className="font-serif text-3xl text-sage mb-4">Ready to Create Your Assets?</h2>
          <p className="text-sage/70 mb-8 max-w-2xl mx-auto">
            We'll generate a professional dual-column script, B-roll checklist, hook variations,
            and visual board prompts tailored to your content.
          </p>
          <Button
            onClick={handleGenerate}
            className="bg-sage hover:bg-sage/90 text-cream font-medium py-4 px-8 rounded-2xl"
          >
            <Zap className="w-5 h-5 mr-2" />
            Generate Production Assets
          </Button>
        </Card>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white rounded-3xl shadow-soft p-12 text-center">
          <Loader2 className="w-16 h-16 text-sage mx-auto mb-6 animate-spin" />
          <h2 className="font-serif text-3xl text-sage mb-4">Generating Your Assets...</h2>
          <p className="text-sage/70">
            Creating dual-column script, B-roll shots, hook variations, and visual prompts...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Dual-Column Script */}
      <Card className="bg-white rounded-3xl shadow-soft p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6 text-sage" />
            <h3 className="font-serif text-2xl text-sage">Dual-Column Script</h3>
          </div>
          <Button
            onClick={() =>
              copyToClipboard(
                script.scenes
                  .map((s: any, i: number) => `Scene ${i + 1}\nVISUAL: ${s.visual}\nAUDIO: ${s.audio}`)
                  .join('\n\n'),
                'script'
              )
            }
            variant="ghost"
            size="sm"
            className="text-sage hover:bg-sage/10"
          >
            {copiedItem === 'script' ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            Copy Script
          </Button>
        </div>

        <div className="space-y-4">
          {script.scenes.map((scene: any, idx: number) => (
            <div
              key={idx}
              className="grid grid-cols-2 gap-6 p-5 bg-gradient-to-r from-sage/5 to-dusty-rose/5 rounded-2xl"
            >
              <div>
                <p className="text-xs font-semibold text-sage/70 uppercase tracking-wide mb-2">
                  Scene {idx + 1} - Visual
                </p>
                <p className="text-sage leading-relaxed">{scene.visual}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-dusty-rose/70 uppercase tracking-wide mb-2">
                  Audio / Caption
                </p>
                <p className="text-sage leading-relaxed">{scene.audio}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* B-Roll Checklist */}
      <Card className="bg-white rounded-3xl shadow-soft p-8">
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-6 h-6 text-sage" />
          <h3 className="font-serif text-2xl text-sage">B-Roll Checklist</h3>
        </div>

        <div className="space-y-3">
          {bRollChecklist.map((shot, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 bg-sage/5 rounded-2xl">
              <div className="w-8 h-8 bg-sage text-cream rounded-xl flex items-center justify-center flex-shrink-0 font-bold">
                {idx + 1}
              </div>
              <p className="text-sage leading-relaxed flex-1 pt-0.5">{shot}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Hook Variations */}
      <Card className="bg-white rounded-3xl shadow-soft p-8">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-6 h-6 text-sage" />
          <h3 className="font-serif text-2xl text-sage">A/B Hook Testing</h3>
        </div>

        <div className="space-y-4">
          {hookVariations.map((variation, idx) => (
            <div
              key={idx}
              className="p-5 bg-gradient-to-r from-sage/5 to-dusty-rose/5 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-dusty-rose/20 text-dusty-rose text-xs font-semibold rounded-full uppercase tracking-wide">
                  {variation.type}
                </span>
                <Button
                  onClick={() => copyToClipboard(variation.hook, `hook-${idx}`)}
                  variant="ghost"
                  size="sm"
                  className="text-sage hover:bg-sage/10"
                >
                  {copiedItem === `hook-${idx}` ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-sage leading-relaxed font-medium">{variation.hook}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Visual Board */}
      <Card className="bg-white rounded-3xl shadow-soft p-8">
        <div className="flex items-center gap-3 mb-6">
          <Image className="w-6 h-6 text-sage" />
          <h3 className="font-serif text-2xl text-sage">Visual Board Prompts</h3>
        </div>

        <p className="text-sage/70 text-sm mb-6">
          Use these prompts with DALL-E, Midjourney, or your image generation tool of choice.
        </p>

        <div className="space-y-4">
          {visualBoardPrompts.map((prompt, idx) => (
            <div key={idx} className="p-5 bg-sage/5 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-sage/70 uppercase tracking-wide">
                  Prompt {idx + 1}
                </p>
                <Button
                  onClick={() => copyToClipboard(prompt, `visual-${idx}`)}
                  variant="ghost"
                  size="sm"
                  className="text-sage hover:bg-sage/10"
                >
                  {copiedItem === `visual-${idx}` ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-sage/80 leading-relaxed text-sm">{prompt}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          onClick={downloadProductionSheet}
          variant="outline"
          className="flex-1 border-2 border-sage/20 hover:border-sage text-sage font-medium py-4 rounded-2xl"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Production Sheet
        </Button>

        <Button
          onClick={handleContinue}
          className="flex-1 bg-sage hover:bg-sage/90 text-cream font-medium py-4 rounded-2xl"
        >
          Continue to Guardrail Check
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
