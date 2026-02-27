'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2, Video, Image, Zap, Copy, CheckCircle, ChevronDown,
  Download, Camera, Film, LayoutGrid, MessageCircle, GraduationCap, Flame,
  BookOpen, Lightbulb, Heart, TrendingUp, RefreshCw, Headphones, Upload,
  ChevronRight, ChevronLeft, X, User as UserIcon, Mic, Settings2, Plus, Maximize2,
} from 'lucide-react';
import { generateProductionAssets } from '@/app/actions/workflows';

// Inline modify bar — lightweight input that sends a message to the AI sidebar chat
function InlineModify({ placeholder, onSubmit }: { placeholder: string; onSubmit: (msg: string) => void }) {
  const [val, setVal] = useState('');
  return (
    <div className="flex gap-2 mt-4 pt-4 border-t border-sage/10">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && val.trim()) { onSubmit(val); setVal(''); }
        }}
        className="flex-1 px-3 py-2 rounded-xl border border-sage/15 text-sm focus:outline-none focus:border-sage text-sage"
      />
      <button
        onClick={() => { if (val.trim()) { onSubmit(val); setVal(''); } }}
        disabled={!val.trim()}
        className="px-4 py-2 bg-sage text-cream rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-sage/90 transition-colors"
      >
        Modify
      </button>
    </div>
  );
}

// Format-specific config
const FORMAT_CONFIG = {
  reel: {
    label: 'Reel',
    icon: Film,
    scriptTitle: 'Dual-Column Script',
    sceneLabel: 'Scene',
    visualLabel: 'Visual',
    audioLabel: 'Audio / Voiceover',
    bRollTitle: 'B-Roll Shot List',
    bRollVisible: true,
    generateLabel: 'Generate Reel Assets',
    loadingLabel: 'Creating your reel script, B-roll shots, hooks & assets...',
  },
  carousel: {
    label: 'Carousel',
    icon: LayoutGrid,
    scriptTitle: 'Slide-by-Slide Script',
    sceneLabel: 'Slide',
    visualLabel: 'Design Direction',
    audioLabel: 'Voice-Over',
    bRollTitle: 'Slide Visual Guidelines',
    bRollVisible: true,
    generateLabel: 'Generate Carousel Assets',
    loadingLabel: 'Creating your slide scripts, visual guidelines, hooks & assets...',
  },
  story: {
    label: 'Story',
    icon: MessageCircle,
    scriptTitle: 'Story Sequence',
    sceneLabel: 'Frame',
    visualLabel: 'What to Show',
    audioLabel: 'Text Overlay / Audio',
    bRollTitle: 'Supporting Shots',
    bRollVisible: true,
    generateLabel: 'Generate Story Assets',
    loadingLabel: 'Creating your story frames, supporting shots, hooks & assets...',
  },
};

const TONE_CONFIG: Record<string, { label: string; icon: any }> = {
  educational: { label: 'Educational', icon: GraduationCap },
  bold: { label: 'Bold & Provocative', icon: Flame },
  storytelling: { label: 'Storytelling', icon: BookOpen },
};

const ANGLE_CONFIG: Record<string, { label: string; icon: any }> = {
  direct_value: { label: 'Direct Value', icon: Lightbulb },
  personal_story: { label: 'Personal Story', icon: Heart },
  trend_commentary: { label: 'Trend Commentary', icon: TrendingUp },
};

const ACCEPT_MAP: Record<string, string> = {
  image: 'image/*',
  video: 'video/*',
  audio: 'audio/*',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GeneratedAssetResult {
  url: string;
  source: 'ai' | 'upload';
  fileName?: string;
  metadata?: { provider: string; generationTime?: number };
}

interface AttachedReference {
  id: string;
  url: string;
  fileName: string;
  file?: File;
  type: 'upload' | 'creator_face' | 'creator_voice';
}

type ContentUpdate = {
  scene_update?: { index: number; visual: string; audio: string; assets?: any[] };
  script?: { scenes: any[] };
  hookVariations?: { type: string; hook: string }[];
  bRollShotList?: { title: string; description: string; camera_angle: string; vibe_tag: string; duration: string }[];
};

interface Props {
  phase1Data: any;
  contentIdea: any;
  trendTitle: string;
  brandStyle?: string;
  userProfile?: any;
  onComplete: (data: any) => void;
  initialData?: any;
  chatMessages?: ChatMessage[];
  creatorFaceUrl?: string | null;
  creatorVoiceUrl?: string | null;
  externalUpdate?: ContentUpdate | null;
  onContentChange?: (content: { script: any; hookVariations: any[]; bRollShotList: any[] }) => void;
  onModify?: (msg: string) => void;
}

function AssetPreview({ url, type, className = 'w-16 h-16' }: { url: string; type: string; className?: string }) {
  if (type === 'image') {
    return <img src={url} alt="Asset" className={`${className} rounded-lg object-cover`} />;
  }
  if (type === 'video') {
    return <video src={url} className={`${className} rounded-lg object-cover`} muted loop autoPlay playsInline />;
  }
  if (type === 'audio') {
    return (
      <div className={`${className} bg-sage/10 rounded-lg flex flex-col items-center justify-center`}>
        <Headphones className="w-4 h-4 text-sage mb-0.5" />
        <audio src={url} controls className="w-14 scale-[0.6]" />
      </div>
    );
  }
  return null;
}

// Reference chip: shows a small preview + name + remove button
function ReferenceChip({ attachedRef, assetType, onRemove }: { attachedRef: AttachedReference; assetType: string; onRemove: () => void }) {
  const isImage = attachedRef.type === 'upload' ? assetType === 'image' || assetType === 'video' : attachedRef.type === 'creator_face';
  const IconComp = attachedRef.type === 'creator_face' ? UserIcon : attachedRef.type === 'creator_voice' ? Headphones : Upload;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-sage/5 border border-sage/10 rounded-lg group">
      {isImage && attachedRef.url ? (
        <img src={attachedRef.url} alt="" className="w-6 h-6 rounded object-cover flex-shrink-0" />
      ) : (
        <IconComp className="w-3.5 h-3.5 text-sage/50 flex-shrink-0" />
      )}
      <span className="text-[11px] text-sage/70 max-w-[100px] truncate">{attachedRef.fileName}</span>
      <button
        onClick={onRemove}
        className="text-sage/30 hover:text-red-500 transition-colors flex-shrink-0"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// 3-state asset row: Empty → References Attached → Asset Ready
function AssetRow({
  assetId,
  assetType,
  description,
  usage,
  generationPrompt,
  generated,
  references,
  isGenerating,
  onGenerate,
  onUploadReference,
  onRemoveReference,
  onDownload,
  onClear,
  creatorFaceUrl,
  creatorVoiceUrl,
  onUseCreatorFace,
  onUseCreatorVoice,
  onPreview,
}: {
  assetId: string;
  assetType: string;
  description: string;
  usage: string;
  generationPrompt: string;
  generated?: GeneratedAssetResult;
  references: AttachedReference[];
  isGenerating: boolean;
  onGenerate: () => void;
  onUploadReference: (file: File) => void;
  onRemoveReference: (refId: string) => void;
  onDownload: () => void;
  onClear: () => void;
  creatorFaceUrl?: string | null;
  creatorVoiceUrl?: string | null;
  onUseCreatorFace?: () => void;
  onUseCreatorVoice?: () => void;
  onPreview?: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const TypeIcon = assetType === 'video' ? Video : assetType === 'audio' ? Headphones : Image;
  const hasRefs = references.length > 0;
  const hasFaceRef = references.some((r) => r.type === 'creator_face');
  const hasVoiceRef = references.some((r) => r.type === 'creator_voice');
  const showFaceButton = (assetType === 'image' || assetType === 'video') && creatorFaceUrl && onUseCreatorFace && !hasFaceRef;
  const showVoiceButton = (assetType === 'audio' || assetType === 'video') && creatorVoiceUrl && onUseCreatorVoice && !hasVoiceRef;

  // State C: Asset Ready
  if (generated) {
    return (
      <div className="flex items-center gap-3 py-2.5">
        <div
          className={assetType === 'image' && onPreview ? 'cursor-zoom-in' : ''}
          onClick={() => assetType === 'image' && onPreview && onPreview(generated.url)}
        >
          <AssetPreview url={generated.url} type={assetType} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="px-1.5 py-0.5 bg-dusty-rose/15 text-dusty-rose text-[10px] rounded-full uppercase font-semibold leading-none">
              {assetType}
            </span>
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full uppercase font-semibold leading-none ${
              generated.source === 'ai' ? 'bg-sage/15 text-sage' : 'bg-blue-100 text-blue-600'
            }`}>
              {generated.source === 'ai' ? 'AI Generated' : 'Uploaded'}
            </span>
          </div>
          <p className="text-xs text-sage/70 leading-snug line-clamp-1">{description}</p>
          {generated.fileName && (
            <p className="text-[10px] text-sage/40 truncate">{generated.fileName}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            onClick={onDownload}
            size="sm"
            variant="outline"
            className="border-sage/15 hover:border-sage text-sage rounded-lg h-7 px-2.5 text-[11px] gap-1"
          >
            <Download className="w-3 h-3" />
            Download
          </Button>
          <Button
            onClick={onClear}
            size="sm"
            variant="ghost"
            className="text-sage/40 hover:text-sage rounded-lg h-7 px-2 text-[11px] gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Replace
          </Button>
        </div>
      </div>
    );
  }

  // State B: References Attached (one or more, not yet generated)
  if (hasRefs) {
    return (
      <div className="py-2.5 space-y-2">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="px-1.5 py-0.5 bg-dusty-rose/15 text-dusty-rose text-[10px] rounded-full uppercase font-semibold leading-none">
            {assetType}
          </span>
          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full uppercase font-semibold leading-none">
            {references.length} reference{references.length > 1 ? 's' : ''}
          </span>
          <span className="text-xs text-sage/50 line-clamp-1 flex-1">{description}</span>
        </div>

        {/* Reference chips */}
        <div className="flex flex-wrap gap-1.5">
          {references.map((r) => (
            <ReferenceChip
              key={r.id}
              attachedRef={r}
              assetType={assetType}
              onRemove={() => onRemoveReference(r.id)}
            />
          ))}
        </div>

        {/* Actions: add more + generate */}
        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="outline"
            className="border-sage/15 hover:border-sage text-sage/60 hover:text-sage rounded-lg h-7 px-2.5 text-[11px] gap-1"
          >
            <Upload className="w-3 h-3" />
            + Upload
          </Button>
          {showFaceButton && (
            <Button
              onClick={onUseCreatorFace}
              size="sm"
              variant="outline"
              className="border-dusty-rose/30 hover:border-dusty-rose text-dusty-rose rounded-lg h-7 px-2.5 text-[11px] gap-1"
            >
              <UserIcon className="w-3 h-3" />
              + My Face
            </Button>
          )}
          {showVoiceButton && (
            <Button
              onClick={onUseCreatorVoice}
              size="sm"
              variant="outline"
              className="border-dusty-rose/30 hover:border-dusty-rose text-dusty-rose rounded-lg h-7 px-2.5 text-[11px] gap-1"
            >
              <Headphones className="w-3 h-3" />
              + My Voice
            </Button>
          )}
          <div className="flex-1" />
          {isGenerating ? (
            <Button disabled size="sm" className="bg-sage/50 text-cream rounded-lg h-7 px-2.5 text-[11px] gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating...
            </Button>
          ) : (
            <Button
              onClick={onGenerate}
              size="sm"
              className="bg-sage hover:bg-sage/90 text-cream rounded-lg h-7 px-2.5 text-[11px] gap-1"
            >
              <Zap className="w-3 h-3" />
              Generate with AI ({references.length} ref{references.length > 1 ? 's' : ''})
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_MAP[assetType] || '*/*'}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUploadReference(file);
            e.target.value = '';
          }}
        />
      </div>
    );
  }

  // State A: Empty
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-16 h-16 bg-sage/5 rounded-lg flex items-center justify-center border border-dashed border-sage/15 flex-shrink-0">
        <TypeIcon className="w-5 h-5 text-sage/25" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="px-1.5 py-0.5 bg-dusty-rose/15 text-dusty-rose text-[10px] rounded-full uppercase font-semibold leading-none">
            {assetType}
          </span>
          <span className="text-[10px] text-sage/40">{usage}</span>
        </div>
        <p className="text-xs text-sage/70 leading-snug line-clamp-2">{description}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isGenerating ? (
          <Button disabled size="sm" className="bg-sage/50 text-cream rounded-lg h-7 px-2.5 text-[11px] gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating...
          </Button>
        ) : (
          <>
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              variant="outline"
              className="border-sage/15 hover:border-sage text-sage/60 hover:text-sage rounded-lg h-7 px-2.5 text-[11px] gap-1"
            >
              <Upload className="w-3 h-3" />
              Upload Reference
            </Button>
            <Button
              onClick={onGenerate}
              size="sm"
              variant="ghost"
              className="text-sage/40 hover:text-sage rounded-lg h-7 px-2.5 text-[11px] gap-1"
            >
              <Zap className="w-3 h-3" />
              Generate
            </Button>
            {showFaceButton && (
              <Button
                onClick={onUseCreatorFace}
                size="sm"
                variant="outline"
                className="border-dusty-rose/30 hover:border-dusty-rose text-dusty-rose rounded-lg h-7 px-2.5 text-[11px] gap-1"
              >
                <UserIcon className="w-3 h-3" />
                My Face
              </Button>
            )}
            {showVoiceButton && (
              <Button
                onClick={onUseCreatorVoice}
                size="sm"
                variant="outline"
                className="border-dusty-rose/30 hover:border-dusty-rose text-dusty-rose rounded-lg h-7 px-2.5 text-[11px] gap-1"
              >
                <Headphones className="w-3 h-3" />
                My Voice
              </Button>
            )}
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_MAP[assetType] || '*/*'}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUploadReference(file);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}

export function Phase2AssetOrchestration({
  phase1Data,
  contentIdea,
  trendTitle,
  brandStyle,
  userProfile,
  onComplete,
  initialData = {},
  chatMessages = [],
  creatorFaceUrl,
  creatorVoiceUrl,
  externalUpdate,
  onContentChange,
  onModify,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState<any>(initialData.script || null);
  const [hookVariations, setHookVariations] = useState<any[]>(initialData.hookVariations || []);
  const [bRollShotList, setBRollShotList] = useState<any[]>(initialData.bRollShotList || []);
  const [critiqueNotes, setCritiqueNotes] = useState<string | null>(null);
  const [subStep, setSubStep] = useState<1 | 2 | 3>(1);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['script']));
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [showAdvancedAssets, setShowAdvancedAssets] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!lightboxUrl) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxUrl(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxUrl]);

  // Asset generation state
  const [generatedAssets, setGeneratedAssets] = useState<Map<string, GeneratedAssetResult>>(new Map());
  const [generatingAssets, setGeneratingAssets] = useState<Set<string>>(new Set());
  const [attachedReferences, setAttachedReferences] = useState<Map<string, AttachedReference[]>>(new Map());

  // Global production defaults
  const [globalFaceMode, setGlobalFaceMode] = useState<'creator' | 'upload' | 'none'>('none');
  const [globalVoiceMode, setGlobalVoiceMode] = useState<'creator' | 'upload' | 'none'>('none');
  const [customFaceRef, setCustomFaceRef] = useState<AttachedReference | null>(null);
  const [customVoiceRef, setCustomVoiceRef] = useState<AttachedReference | null>(null);
  const [generatingScene, setGeneratingScene] = useState<number | null>(null);
  // Scene-level style references (context files for the AI, one pool per scene)
  const [sceneReferences, setSceneReferences] = useState<Map<number, AttachedReference[]>>(new Map());
  // Keyword refine and text overlay per scene (sub-step 2)
  const [sceneKeywords, setSceneKeywords] = useState<Map<number, string>>(new Map());
  const [sceneTextOverlay, setSceneTextOverlay] = useState<Map<number, boolean>>(new Map());
  const customFaceInputRef = useRef<HTMLInputElement>(null);
  const customVoiceInputRef = useRef<HTMLInputElement>(null);
  const sceneFileInputRef = useRef<HTMLInputElement>(null);

  // Apply external content updates from AI chat
  useEffect(() => {
    if (!externalUpdate) return;
    if (externalUpdate.scene_update) {
      const { index, ...sceneData } = externalUpdate.scene_update;
      setScript((prev: any) => {
        if (!prev) return prev;
        const scenes = [...prev.scenes];
        scenes[index] = { ...scenes[index], ...sceneData };
        return { ...prev, scenes };
      });
      setCurrentSceneIdx(externalUpdate.scene_update.index);
    }
    if (externalUpdate.script) {
      const updatedScript = externalUpdate.script;
      setScript((prev: any) => {
        // Preserve existing scene assets (generation prompts, thumbnails) when AI rewrites text
        const mergedScenes = updatedScript.scenes.map((newScene: any, idx: number) => ({
          ...newScene,
          assets: prev?.scenes?.[idx]?.assets || newScene.assets || [],
        }));
        return { ...updatedScript, scenes: mergedScenes };
      });
      setCurrentSceneIdx(0);
    }
    if (externalUpdate.hookVariations) setHookVariations(externalUpdate.hookVariations);
    if (externalUpdate.bRollShotList) setBRollShotList(externalUpdate.bRollShotList);
  }, [externalUpdate]);

  // Notify page of content changes so the chat always has the latest context
  useEffect(() => {
    if (script || hookVariations.length || bRollShotList.length) {
      onContentChange?.({ script, hookVariations, bRollShotList });
    }
  }, [script, hookVariations, bRollShotList]);

  // Get format-specific config
  const format = (phase1Data.contentFormat || 'reel') as keyof typeof FORMAT_CONFIG;
  const cfg = FORMAT_CONFIG[format] || FORMAT_CONFIG.reel;
  const FormatIcon = cfg.icon;

  const tone = phase1Data.toneStyle || 'educational';
  const toneInfo = TONE_CONFIG[tone] || TONE_CONFIG.educational;
  const ToneIcon = toneInfo.icon;

  const angle = phase1Data.contentAngle || 'direct_value';
  const angleInfo = ANGLE_CONFIG[angle] || ANGLE_CONFIG.direct_value;
  const AngleIcon = angleInfo.icon;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const buildRefinementContext = (): string => {
    const userMessages = chatMessages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-10);
    if (userMessages.length === 0) return '';
    return userMessages
      .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n');
  };

  const handleGenerate = async (isRegeneration = false) => {
    setIsGenerating(true);
    try {
      let contextInfo = '';
      if (phase1Data.adaptationType === 'product' && phase1Data.selectedProduct) {
        contextInfo = `Product Context:\n- Name: ${phase1Data.selectedProduct.name}\n- Description: ${phase1Data.selectedProduct.description}\n`;
      } else if (phase1Data.adaptationType === 'case_study' && phase1Data.selectedCaseStudy) {
        contextInfo = `Case Study Context:\n- Title: ${phase1Data.selectedCaseStudy.title}\n- Client: ${phase1Data.selectedCaseStudy.client_name || 'N/A'}\n- Results: ${phase1Data.selectedCaseStudy.results}\n`;
      }
      if (phase1Data.additionalContext) {
        contextInfo += `\nAdditional Context: ${phase1Data.additionalContext}`;
      }

      // Append user strategic profile so all generated prompts are on-brand
      if (userProfile) {
        const s = userProfile.metadata?.strategy || {};
        const industries = (userProfile.metadata?.industries || []).join(', ');
        const profileLines: string[] = [];
        if (userProfile.name) profileLines.push(`Creator: ${userProfile.name}`);
        if (industries) profileLines.push(`Niche / Industries: ${industries}`);
        if (s.persona) profileLines.push(`Persona: ${s.persona}`);
        if (s.positioning) profileLines.push(`Positioning: ${s.positioning}`);
        if (s.target_audience) profileLines.push(`Target Audience: ${s.target_audience}`);
        if (s.tone) profileLines.push(`Brand Tone: ${s.tone}`);
        if (s.brand_words?.length) profileLines.push(`Brand Words: ${s.brand_words.join(', ')}`);
        if (s.offering || userProfile.offering) profileLines.push(`Offering: ${s.offering || userProfile.offering}`);
        if (s.content_pillars?.length) {
          const pillars = s.content_pillars.map((p: any) => p.title || p).join(', ');
          profileLines.push(`Content Pillars: ${pillars}`);
        }
        if (s.visual_identity) profileLines.push(`Visual Identity / Charte Graphique: ${s.visual_identity}`);
        if (profileLines.length) {
          contextInfo += `\n\nCreator Profile (use this to keep all slides visually and tonally consistent):\n${profileLines.join('\n')}`;
        }
      }

      const refinementContext = isRegeneration ? buildRefinementContext() : '';
      const strategy = userProfile?.metadata?.strategy || {};

      const assets = await generateProductionAssets({
        trendTitle, contentIdea, contextInfo,
        brandStyle: brandStyle || '',
        contentFormat: format, toneStyle: tone, contentAngle: angle,
        refinementContext,
        contentPillars: strategy.content_pillars || [],
        positioning: strategy.positioning || '',
        tone: strategy.tone || '',
      });

      setScript(assets.script);
      setHookVariations(assets.hook_variations || []);
      setBRollShotList(assets.shot_list || []);
      setCritiqueNotes(assets.critique_notes || null);
      setCurrentSceneIdx(0);
      setSubStep(1);
      if (isRegeneration) {
        setGeneratedAssets(new Map());
        setAttachedReferences(new Map());
      }
      setExpandedSections(new Set(['script']));
    } catch (error: any) {
      console.error('Asset generation failed:', error);
      alert('Failed to generate assets. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Resolve which global references apply for a given asset type
  const getGlobalRefsForAssetType = (assetType: string): AttachedReference[] => {
    const refs: AttachedReference[] = [];
    if (assetType === 'image' || assetType === 'video') {
      if (globalFaceMode === 'creator' && creatorFaceUrl) {
        refs.push({ id: 'global-face', url: creatorFaceUrl, fileName: 'My Face', type: 'creator_face' });
      } else if (globalFaceMode === 'upload' && customFaceRef) {
        refs.push(customFaceRef);
      }
    }
    if (assetType === 'audio' || assetType === 'video') {
      if (globalVoiceMode === 'creator' && creatorVoiceUrl) {
        refs.push({ id: 'global-voice', url: creatorVoiceUrl, fileName: 'My Voice', type: 'creator_voice' });
      } else if (globalVoiceMode === 'upload' && customVoiceRef) {
        refs.push(customVoiceRef);
      }
    }
    return refs;
  };

  // --- Asset handlers ---
  // overrideReferenceUrls: when provided by handleGenerateScene (scene-level refs), skip slot lookup
  const handleGenerateAsset = async (assetId: string, prompt: string, type: string, overrideReferenceUrls?: string[]) => {
    setGeneratingAssets((prev) => new Set(prev).add(assetId));
    try {
      let referenceUrls: string[];
      if (overrideReferenceUrls !== undefined) {
        referenceUrls = overrideReferenceUrls;
      } else {
        const slotRefs = attachedReferences.get(assetId) || [];
        const refs = slotRefs.length > 0 ? slotRefs : getGlobalRefsForAssetType(type);
        referenceUrls = refs.map((r) => r.url).filter(Boolean);
      }

      const response = await fetch('/api/generate-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          prompt,
          options: { aspectRatio: format === 'carousel' ? '1:1' : '9:16' },
          referenceUrls: referenceUrls.length > 0 ? referenceUrls : undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedAssets((prev) => new Map(prev).set(assetId, { ...data.asset, source: 'ai' }));
        // Clear references after successful generation
        setAttachedReferences((prev) => {
          const next = new Map(prev);
          const existing = next.get(assetId) || [];
          existing.forEach((r) => { if (r.file) URL.revokeObjectURL(r.url); });
          next.delete(assetId);
          return next;
        });
      } else {
        alert(`Failed to generate ${type}: ${data.error}`);
      }
    } catch (error: any) {
      console.error('Asset generation failed:', error);
      alert('Failed to generate asset. Please try again.');
    } finally {
      setGeneratingAssets((prev) => {
        const next = new Set(prev);
        next.delete(assetId);
        return next;
      });
    }
  };

  const handleUploadReference = (assetId: string, file: File) => {
    const url = URL.createObjectURL(file);
    const newRef: AttachedReference = {
      id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      url,
      fileName: file.name,
      file,
      type: 'upload',
    };
    setAttachedReferences((prev) => {
      const next = new Map(prev);
      const existing = next.get(assetId) || [];
      next.set(assetId, [...existing, newRef]);
      return next;
    });
  };

  const handleRemoveReference = (assetId: string, refId: string) => {
    setAttachedReferences((prev) => {
      const next = new Map(prev);
      const existing = next.get(assetId) || [];
      const ref = existing.find((r) => r.id === refId);
      if (ref?.file) URL.revokeObjectURL(ref.url);
      const filtered = existing.filter((r) => r.id !== refId);
      if (filtered.length === 0) next.delete(assetId);
      else next.set(assetId, filtered);
      return next;
    });
  };

  const addSceneReference = (sceneIdx: number, file: File) => {
    const url = URL.createObjectURL(file);
    const newRef: AttachedReference = {
      id: `scene-ref-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      url, fileName: file.name, file, type: 'upload',
    };
    setSceneReferences((prev) => {
      const next = new Map(prev);
      const existing = next.get(sceneIdx) || [];
      next.set(sceneIdx, [...existing, newRef]);
      return next;
    });
  };

  const removeSceneReference = (sceneIdx: number, refId: string) => {
    setSceneReferences((prev) => {
      const next = new Map(prev);
      const existing = next.get(sceneIdx) || [];
      const ref = existing.find((r) => r.id === refId);
      if (ref?.file) URL.revokeObjectURL(ref.url);
      const filtered = existing.filter((r) => r.id !== refId);
      if (filtered.length === 0) next.delete(sceneIdx);
      else next.set(sceneIdx, filtered);
      return next;
    });
  };

  const clearAsset = (assetId: string) => {
    setGeneratedAssets((prev) => {
      const next = new Map(prev);
      const existing = next.get(assetId);
      if (existing?.source === 'upload') URL.revokeObjectURL(existing.url);
      next.delete(assetId);
      return next;
    });
  };

  const useCreatorFace = (assetId: string) => {
    if (!creatorFaceUrl) return;
    const alreadyAttached = (attachedReferences.get(assetId) || []).some((r) => r.type === 'creator_face');
    if (alreadyAttached) return;
    const newRef: AttachedReference = {
      id: 'creator-face',
      url: creatorFaceUrl,
      fileName: 'My Face',
      type: 'creator_face',
    };
    setAttachedReferences((prev) => {
      const next = new Map(prev);
      const existing = next.get(assetId) || [];
      next.set(assetId, [...existing, newRef]);
      return next;
    });
  };

  const useCreatorVoice = (assetId: string) => {
    if (!creatorVoiceUrl) return;
    const alreadyAttached = (attachedReferences.get(assetId) || []).some((r) => r.type === 'creator_voice');
    if (alreadyAttached) return;
    const newRef: AttachedReference = {
      id: 'creator-voice',
      url: creatorVoiceUrl,
      fileName: 'My Voice',
      type: 'creator_voice',
    };
    setAttachedReferences((prev) => {
      const next = new Map(prev);
      const existing = next.get(assetId) || [];
      next.set(assetId, [...existing, newRef]);
      return next;
    });
  };

  // Build synthetic asset definitions for B-roll and hooks
  const getBRollAssets = (shot: any, idx: number) => [
    {
      id: `broll-${idx}-image`,
      type: 'image' as const,
      description: `Reference image: ${shot.title}`,
      generationPrompt: `${shot.description}. Camera: ${shot.camera_angle}. Mood: ${shot.vibe_tag}. Professional photography, ${format === 'carousel' ? '1:1' : '9:16'} aspect ratio.`,
      usage: 'B-roll reference',
    },
    {
      id: `broll-${idx}-video`,
      type: 'video' as const,
      description: `Video clip: ${shot.title}`,
      generationPrompt: `${shot.description}. Camera movement: ${shot.camera_angle}. Duration: ${shot.duration}. Cinematic, ${shot.vibe_tag} mood.`,
      usage: 'B-roll footage',
    },
  ];

  const getHookAssets = (hook: any, idx: number) => [
    {
      id: `hook-${idx}-video`,
      type: 'video' as const,
      description: `Hook delivery video: ${hook.type}`,
      generationPrompt: `Video of someone delivering this hook with energy: "${hook.hook}". Style: ${hook.type}. Vertical format, engaging opening.`,
      usage: 'Hook video',
    },
    {
      id: `hook-${idx}-audio`,
      type: 'audio' as const,
      description: `Hook voiceover: ${hook.type}`,
      generationPrompt: `Voiceover recording: "${hook.hook}". Tone: ${hook.type}. Clear, confident delivery.`,
      usage: 'Hook audio',
    },
  ];

  // Collect ALL asset definitions for Generate All
  const getAllAssetDefs = () => {
    const all: { id: string; type: string; generationPrompt: string }[] = [];
    // Script scene assets
    (script?.scenes || []).forEach((s: any) => {
      (s.assets || []).forEach((a: any) => all.push(a));
    });
    // B-roll assets
    bRollShotList.forEach((shot, idx) => {
      getBRollAssets(shot, idx).forEach((a) => all.push(a));
    });
    // Hook assets
    hookVariations.forEach((hook, idx) => {
      getHookAssets(hook, idx).forEach((a) => all.push(a));
    });
    return all;
  };

  const handleGenerateAllAssets = async () => {
    const allDefs = getAllAssetDefs();
    for (const asset of allDefs) {
      if (!generatedAssets.has(asset.id)) {
        await handleGenerateAsset(asset.id, asset.generationPrompt, asset.type);
      }
    }
  };

  const handleGenerateScene = async (sceneIdx: number) => {
    const scene = script?.scenes?.[sceneIdx];
    if (!scene?.assets?.length) return;
    setGeneratingScene(sceneIdx);
    // Combine scene-level style references with global production defaults per asset type
    const sceneRefs = (sceneReferences.get(sceneIdx) || []).map((r) => r.url).filter(Boolean);
    for (const asset of scene.assets) {
      if (!generatedAssets.has(asset.id)) {
        const globalRefs = getGlobalRefsForAssetType(asset.type).map((r) => r.url).filter(Boolean);
        const combined = [...sceneRefs, ...globalRefs];
        await handleGenerateAsset(asset.id, asset.generationPrompt, asset.type, combined.length > 0 ? combined : undefined);
      }
    }
    setGeneratingScene(null);
  };

  // Regenerate image assets for a scene with a keyword hint + optional text overlay
  const handleKeywordRegenerate = async (sceneIdx: number) => {
    const scene = script?.scenes?.[sceneIdx];
    if (!scene?.assets?.length) return;
    const keyword = sceneKeywords.get(sceneIdx) || '';
    const textOverlay = sceneTextOverlay.get(sceneIdx) || false;
    const visualIdentity = userProfile?.metadata?.strategy?.visual_identity || '';
    setGeneratingScene(sceneIdx);
    const sceneRefs = (sceneReferences.get(sceneIdx) || []).map((r) => r.url).filter(Boolean);
    for (const asset of scene.assets) {
      if (asset.type !== 'image') continue; // only images in visual step
      const globalRefs = getGlobalRefsForAssetType(asset.type).map((r) => r.url).filter(Boolean);
      const combined = [...sceneRefs, ...globalRefs];
      let prompt = asset.generationPrompt;
      if (keyword) prompt += `. Keywords: ${keyword}`;
      if (textOverlay && scene.audio) {
        prompt += `. Overlay text: "${scene.audio}"`;
        if (visualIdentity) prompt += ` following visual identity: ${visualIdentity}`;
      }
      // Force-clear so it re-generates
      setGeneratedAssets((prev) => { const m = new Map(prev); m.delete(asset.id); return m; });
      await handleGenerateAsset(asset.id, prompt, asset.type, combined.length > 0 ? combined : undefined);
    }
    setGeneratingScene(null);
  };

  const handleDownloadAsset = async (assetId: string, generatedAsset: GeneratedAssetResult) => {
    try {
      const isDataUrl = generatedAsset.url.startsWith('data:');
      let downloadHref: string;
      let ext: string;

      if (isDataUrl) {
        // data:image/png;base64,... — extract MIME type for the extension
        const mime = generatedAsset.url.match(/^data:([^;]+);/)?.[1] || 'image/png';
        ext = mime.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
        downloadHref = generatedAsset.url;
      } else {
        const response = await fetch(generatedAsset.url);
        const blob = await response.blob();
        downloadHref = URL.createObjectURL(blob);
        ext = generatedAsset.url.match(/\.(jpg|jpeg|png|gif|mp4|mov|mp3|wav)$/i)?.[1] || 'png';
      }

      const a = document.createElement('a');
      a.href = downloadHref;
      if (generatedAsset.source === 'upload' && generatedAsset.fileName) {
        a.download = generatedAsset.fileName;
      } else {
        a.download = `${assetId}.${ext}`;
      }
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (!isDataUrl) URL.revokeObjectURL(downloadHref);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download asset.');
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleContinue = () => {
    onComplete({ script, hookVariations, bRollShotList });
  };

  // Helper to render an AssetRow with all handlers wired up
  const renderAssetRow = (asset: { id: string; type: string; description: string; generationPrompt: string; usage: string }) => (
    <AssetRow
      key={asset.id}
      assetId={asset.id}
      assetType={asset.type}
      description={asset.description}
      usage={asset.usage}
      generationPrompt={asset.generationPrompt}
      generated={generatedAssets.get(asset.id)}
      references={attachedReferences.get(asset.id) || []}
      isGenerating={generatingAssets.has(asset.id)}
      onGenerate={() => handleGenerateAsset(asset.id, asset.generationPrompt, asset.type)}
      onUploadReference={(file) => handleUploadReference(asset.id, file)}
      onRemoveReference={(refId) => handleRemoveReference(asset.id, refId)}
      onDownload={() => {
        const gen = generatedAssets.get(asset.id);
        if (gen) handleDownloadAsset(asset.id, gen);
      }}
      onClear={() => clearAsset(asset.id)}
      creatorFaceUrl={creatorFaceUrl}
      creatorVoiceUrl={creatorVoiceUrl}
      onUseCreatorFace={() => useCreatorFace(asset.id)}
      onUseCreatorVoice={() => useCreatorVoice(asset.id)}
      onPreview={(url) => setLightboxUrl(url)}
    />
  );

  const downloadProductionSheet = () => {
    const sceneAssets = (script?.scenes || []).reduce(
      (sum: number, s: any) => sum + (s.assets?.length || 0), 0
    );
    const bRollAssetCount = bRollShotList.length * 2;
    const hookAssetCount = hookVariations.length * 2;
    const totalAssets = sceneAssets + bRollAssetCount + hookAssetCount;

    const content = `PRODUCTION SHEET — ${cfg.label.toUpperCase()}
${trendTitle}
Format: ${cfg.label} | Tone: ${toneInfo.label} | Angle: ${angleInfo.label}

=== ${cfg.scriptTitle.toUpperCase()} ===
${script?.scenes?.map((scene: any, idx: number) =>
  `${cfg.sceneLabel} ${idx + 1}:\n${cfg.visualLabel.toUpperCase()}: ${scene.visual}\n${cfg.audioLabel.toUpperCase()}: ${scene.audio}${
    scene.assets?.length ? `\nAssets:\n${scene.assets.map((a: any) => `  [${a.type.toUpperCase()}] ${a.description} (${a.usage})`).join('\n')}` : ''
  }\n`
).join('\n')}

=== ${cfg.bRollTitle.toUpperCase()} ===
${bRollShotList.map((shot, idx) => `
${idx + 1}: ${shot.title}
${format === 'carousel' ? 'Style' : 'Camera Angle'}: ${shot.camera_angle}
${format === 'carousel' ? 'Slides' : 'Duration'}: ${shot.duration}
Tag: ${shot.vibe_tag}
Description: ${shot.description}
Assets:
  [IMAGE] Reference image: ${shot.title}
  [VIDEO] Video clip: ${shot.title}
`).join('\n')}

=== HOOK VARIATIONS ===
${hookVariations.map((hook, idx) => `[${hook.type}]: ${hook.hook}
Assets:
  [VIDEO] Hook delivery video: ${hook.type}
  [AUDIO] Hook voiceover: ${hook.type}
`).join('\n')}

=== ASSET SUMMARY (${totalAssets} total) ===
Script scene assets: ${sceneAssets}
B-roll assets: ${bRollAssetCount}
Hook assets: ${hookAssetCount}

=== ASSET GENERATION PROMPTS ===
${script?.scenes?.map((scene: any, idx: number) => {
  if (!scene.assets?.length) return '';
  return `\n--- ${cfg.sceneLabel} ${idx + 1} ---\n${scene.assets
    .map((a: any) => `[${a.type.toUpperCase()}] ${a.description}\nUsage: ${a.usage}\nPrompt: ${a.generationPrompt}`)
    .join('\n\n')}`;
}).filter(Boolean).join('\n')}
${bRollShotList.map((shot, idx) => {
  const assets = getBRollAssets(shot, idx);
  return `\n--- B-Roll: ${shot.title} ---\n${assets
    .map((a) => `[${a.type.toUpperCase()}] ${a.description}\nUsage: ${a.usage}\nPrompt: ${a.generationPrompt}`)
    .join('\n\n')}`;
}).join('\n')}
${hookVariations.map((hook, idx) => {
  const assets = getHookAssets(hook, idx);
  return `\n--- Hook: ${hook.type} ---\n${assets
    .map((a) => `[${a.type.toUpperCase()}] ${a.description}\nUsage: ${a.usage}\nPrompt: ${a.generationPrompt}`)
    .join('\n\n')}`;
}).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-sheet-${cfg.label.toLowerCase()}-${trendTitle.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Phase 1 recap badges
  const RecapBadges = () => (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sage/10 rounded-full">
        <FormatIcon className="w-3.5 h-3.5 text-sage" />
        <span className="text-sm font-medium text-sage">{cfg.label}</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-dusty-rose/10 rounded-full">
        <ToneIcon className="w-3.5 h-3.5 text-dusty-rose" />
        <span className="text-sm font-medium text-dusty-rose">{toneInfo.label}</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sage/10 rounded-full">
        <AngleIcon className="w-3.5 h-3.5 text-sage" />
        <span className="text-sm font-medium text-sage">{angleInfo.label}</span>
      </div>
    </div>
  );

  // Collapsible section header
  const SectionHeader = ({
    id, icon: Icon, title, preview, actions,
  }: {
    id: string; icon: any; title: string; preview: string; actions?: React.ReactNode;
  }) => {
    const isOpen = expandedSections.has(id);
    return (
      <button onClick={() => toggleSection(id)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-sage" />
          <h3 className="font-serif text-xl text-sage">{title}</h3>
          <span className="text-sm text-sage/40">{preview}</span>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <ChevronDown className={`w-5 h-5 text-sage/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
    );
  };

  // --- Pre-generation state ---
  if (!script && !isGenerating) {
    const hasFaceOption = !!creatorFaceUrl;
    const hasVoiceOption = !!creatorVoiceUrl;

    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white rounded-3xl shadow-soft p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <FormatIcon className="w-14 h-14 text-dusty-rose mx-auto mb-5" />
            <h2 className="font-serif text-3xl text-sage mb-3">
              Ready to Create Your {cfg.label}?
            </h2>
            <div className="flex justify-center mb-4"><RecapBadges /></div>
            <p className="text-sage/60 text-sm max-w-xl mx-auto">
              {format === 'carousel'
                ? "We'll generate a slide-by-slide script, visual guidelines, hook variations, and production assets."
                : format === 'story'
                ? "We'll generate a story sequence, supporting shots, hook variations, and production assets."
                : "We'll generate a dual-column script, B-roll shot list, hook variations, and production assets."}
            </p>
          </div>

          {/* Production Defaults Panel */}
          <div className="border border-sage/10 rounded-2xl p-6 mb-8 bg-sage/[0.02]">
            <div className="flex items-center gap-2 mb-5">
              <Settings2 className="w-4 h-4 text-sage/60" />
              <h3 className="text-sm font-semibold text-sage">Production Defaults</h3>
              <span className="text-xs text-sage/40">Auto-applied to all generated assets</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Face reference */}
              <div>
                <p className="text-[11px] font-semibold text-sage/50 uppercase tracking-widest mb-3">
                  Face / Appearance
                </p>
                <div className="space-y-2">
                  {hasFaceOption && (
                    <button
                      onClick={() => setGlobalFaceMode(globalFaceMode === 'creator' ? 'none' : 'creator')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                        globalFaceMode === 'creator'
                          ? 'border-sage bg-sage/5 text-sage'
                          : 'border-sage/10 hover:border-sage/25 text-sage/60'
                      }`}
                    >
                      <img src={creatorFaceUrl!} alt="My Face" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                      <span className="text-sm font-medium">My Face</span>
                      {globalFaceMode === 'creator' && <CheckCircle className="w-4 h-4 ml-auto text-sage flex-shrink-0" />}
                    </button>
                  )}
                  <button
                    onClick={() => customFaceInputRef.current?.click()}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                      globalFaceMode === 'upload'
                        ? 'border-sage bg-sage/5 text-sage'
                        : 'border-sage/10 hover:border-sage/25 text-sage/60'
                    }`}
                  >
                    <Upload className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">{customFaceRef ? customFaceRef.fileName : 'Upload photo or video'}</span>
                    {globalFaceMode === 'upload' && <CheckCircle className="w-4 h-4 ml-auto text-sage flex-shrink-0" />}
                  </button>
                  {globalFaceMode !== 'none' && (
                    <button
                      onClick={() => { setGlobalFaceMode('none'); setCustomFaceRef(null); }}
                      className="text-xs text-sage/40 hover:text-sage/70 pl-1 transition-colors"
                    >
                      × Clear selection
                    </button>
                  )}
                  {globalFaceMode === 'none' && !hasFaceOption && (
                    <p className="text-xs text-sage/35 pl-1">Upload a face reference above, or add one to your profile.</p>
                  )}
                  <input
                    ref={customFaceInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setCustomFaceRef({ id: `custom-face-${Date.now()}`, url, fileName: file.name, file, type: 'upload' });
                        setGlobalFaceMode('upload');
                      }
                      e.target.value = '';
                    }}
                  />
                </div>
              </div>

              {/* Voice reference */}
              <div>
                <p className="text-[11px] font-semibold text-sage/50 uppercase tracking-widest mb-3">
                  Voice / Audio
                </p>
                <div className="space-y-2">
                  {hasVoiceOption && (
                    <button
                      onClick={() => setGlobalVoiceMode(globalVoiceMode === 'creator' ? 'none' : 'creator')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                        globalVoiceMode === 'creator'
                          ? 'border-dusty-rose bg-dusty-rose/5 text-dusty-rose'
                          : 'border-sage/10 hover:border-sage/25 text-sage/60'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-dusty-rose/10 flex items-center justify-center flex-shrink-0">
                        <Mic className="w-3.5 h-3.5 text-dusty-rose" />
                      </div>
                      <span className="text-sm font-medium">My Voice</span>
                      {globalVoiceMode === 'creator' && <CheckCircle className="w-4 h-4 ml-auto text-dusty-rose flex-shrink-0" />}
                    </button>
                  )}
                  <button
                    onClick={() => customVoiceInputRef.current?.click()}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                      globalVoiceMode === 'upload'
                        ? 'border-dusty-rose bg-dusty-rose/5 text-dusty-rose'
                        : 'border-sage/10 hover:border-sage/25 text-sage/60'
                    }`}
                  >
                    <Upload className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">{customVoiceRef ? customVoiceRef.fileName : 'Upload audio sample'}</span>
                    {globalVoiceMode === 'upload' && <CheckCircle className="w-4 h-4 ml-auto text-dusty-rose flex-shrink-0" />}
                  </button>
                  {globalVoiceMode !== 'none' && (
                    <button
                      onClick={() => { setGlobalVoiceMode('none'); setCustomVoiceRef(null); }}
                      className="text-xs text-sage/40 hover:text-sage/70 pl-1 transition-colors"
                    >
                      × Clear selection
                    </button>
                  )}
                  {globalVoiceMode === 'none' && !hasVoiceOption && (
                    <p className="text-xs text-sage/35 pl-1">Upload a voice sample above, or add one to your profile.</p>
                  )}
                  <input
                    ref={customVoiceInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setCustomVoiceRef({ id: `custom-voice-${Date.now()}`, url, fileName: file.name, file, type: 'upload' });
                        setGlobalVoiceMode('upload');
                      }
                      e.target.value = '';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => handleGenerate(false)}
              className="bg-sage hover:bg-sage/90 text-cream font-medium py-4 px-10 rounded-2xl"
            >
              <Zap className="w-5 h-5 mr-2" />
              {cfg.generateLabel}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // --- Generating state ---
  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white rounded-3xl shadow-soft p-12 text-center">
          <Loader2 className="w-16 h-16 text-sage mx-auto mb-6 animate-spin" />
          <h2 className="font-serif text-3xl text-sage mb-4">
            {script ? 'Regenerating' : 'Generating'} Your {cfg.label} Assets...
          </h2>
          <div className="flex justify-center mb-4"><RecapBadges /></div>
          <p className="text-sage/70">{cfg.loadingLabel}</p>
        </Card>
      </div>
    );
  }

  // Count total assets across all sections
  const sceneAssetCount = (script?.scenes || []).reduce(
    (sum: number, s: any) => sum + (s.assets?.length || 0), 0
  );
  const bRollAssetCount = bRollShotList.length * 2;
  const hookAssetCount = hookVariations.length * 2;
  const totalAssets = sceneAssetCount + bRollAssetCount + hookAssetCount;

  // --- Results state ---
  const activeDefaultsCount = (globalFaceMode !== 'none' ? 1 : 0) + (globalVoiceMode !== 'none' ? 1 : 0);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <RecapBadges />
        <div className="flex items-center gap-2">
          {/* Active defaults summary */}
          {activeDefaultsCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cream border border-sage/10 rounded-xl">
              {globalFaceMode !== 'none' && (
                <div className="flex items-center gap-1 text-xs text-sage">
                  <UserIcon className="w-3 h-3" />
                  <span>{globalFaceMode === 'creator' ? 'My Face' : 'Custom face'}</span>
                </div>
              )}
              {globalFaceMode !== 'none' && globalVoiceMode !== 'none' && (
                <span className="text-sage/20">·</span>
              )}
              {globalVoiceMode !== 'none' && (
                <div className="flex items-center gap-1 text-xs text-dusty-rose">
                  <Mic className="w-3 h-3" />
                  <span>{globalVoiceMode === 'creator' ? 'My Voice' : 'Custom voice'}</span>
                </div>
              )}
            </div>
          )}
          {totalAssets > 0 && (
            <Button
              onClick={handleGenerateAllAssets}
              disabled={generatingAssets.size > 0}
              size="sm"
              className="bg-sage hover:bg-sage/90 text-cream rounded-xl gap-2"
            >
              {generatingAssets.size > 0 ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><Zap className="w-4 h-4" /> Generate All ({totalAssets})</>
              )}
            </Button>
          )}
          <Button
            onClick={() => handleGenerate(true)}
            variant="outline" size="sm"
            className="border-sage/20 hover:border-sage text-sage rounded-xl gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </Button>
        </div>
      </div>

      {/* OwnVoice critique badge */}
      {critiqueNotes && (
        <div className="flex items-center gap-2 px-4 py-2 bg-sage/5 border border-sage/10 rounded-2xl text-xs text-sage/70">
          <CheckCircle className="w-3.5 h-3.5 text-sage shrink-0" />
          <span><span className="font-medium text-sage">OwnVoice ✓</span> {critiqueNotes}</span>
        </div>
      )}

      {/* Sub-step progress bar */}
      <div className="flex items-center gap-3 px-1">
        {(['Hook & Script', 'Visual Selection', 'Preview'] as const).map((label, i) => {
          const step = (i + 1) as 1 | 2 | 3;
          const isActive = subStep === step;
          const isDone = subStep > step;
          return (
            <button
              key={label}
              onClick={() => setSubStep(step)}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isActive ? 'text-sage' : 'text-sage/40 hover:text-sage cursor-pointer'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${isActive ? 'bg-sage text-cream' : isDone ? 'bg-sage/20 text-sage' : 'bg-sage/10 text-sage/30'}`}>
                {isDone ? '✓' : step}
              </span>
              {label}
            </button>
          );
        }).reduce((acc: React.ReactNode[], el, i) => [
          ...acc,
          ...(i > 0 ? [<span key={`sep-${i}`} className="flex-1 h-px bg-sage/10" />] : []),
          el,
        ], [])}
      </div>

      {/* Script + Inline Assets */}
      <Card className="bg-white rounded-3xl shadow-soft p-6">
        <SectionHeader
          id="script"
          icon={FormatIcon}
          title={cfg.scriptTitle}
          preview={`${script.scenes.length} ${cfg.sceneLabel.toLowerCase()}s${sceneAssetCount > 0 ? ` · ${sceneAssetCount} assets` : ''}`}
          actions={
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                onClick={() => copyToClipboard(
                  script.scenes
                    .map((s: any, i: number) => `${cfg.sceneLabel} ${i + 1}\n${cfg.visualLabel}: ${s.visual}\n${cfg.audioLabel}: ${s.audio}`)
                    .join('\n\n'),
                  'script'
                )}
                variant="ghost" size="sm"
                className="text-sage/40 hover:text-sage hover:bg-sage/10 h-7 w-7 p-0"
              >
                {copiedItem === 'script' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
              {subStep === 1 && (
                <button
                  onClick={() => setSubStep(2)}
                  className="flex items-center gap-1 px-3 py-1 bg-sage text-cream rounded-lg text-xs font-medium hover:bg-sage/90 transition-colors"
                >
                  Choose Visuals <ChevronRight className="w-3 h-3" />
                </button>
              )}
              {subStep === 2 && (
                <button
                  onClick={() => setSubStep(3)}
                  className="flex items-center gap-1 px-3 py-1 bg-sage text-cream rounded-lg text-xs font-medium hover:bg-sage/90 transition-colors"
                >
                  Preview <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          }
        />

        {expandedSections.has('script') && (() => {
          const scenes = script.scenes;
          const totalScenes = scenes.length;
          const scene = scenes[currentSceneIdx];
          const gradientClass = format === 'carousel'
            ? 'bg-gradient-to-r from-dusty-rose/5 to-sage/5'
            : format === 'story'
            ? 'bg-gradient-to-r from-sage/5 to-sage/10'
            : 'bg-gradient-to-r from-sage/5 to-dusty-rose/5';

          return (
            <div className="mt-6">
              {/* Navigation bar */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setCurrentSceneIdx((i) => Math.max(0, i - 1))}
                  disabled={currentSceneIdx === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sage/15 text-sage/50 hover:text-sage hover:border-sage/30 disabled:opacity-30 disabled:cursor-default transition-all text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>

                {/* Dot indicators */}
                <div className="flex items-center gap-1.5">
                  {scenes.map((_: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSceneIdx(i)}
                      className={`rounded-full transition-all ${
                        i === currentSceneIdx
                          ? 'w-5 h-2 bg-sage'
                          : 'w-2 h-2 bg-sage/20 hover:bg-sage/40'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentSceneIdx((i) => Math.min(totalScenes - 1, i + 1))}
                  disabled={currentSceneIdx === totalScenes - 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sage/15 text-sage/50 hover:text-sage hover:border-sage/30 disabled:opacity-30 disabled:cursor-default transition-all text-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Current scene card */}
              <div className={`rounded-2xl overflow-hidden ${gradientClass}`}>
                {/* Scene columns */}
                <div className="grid grid-cols-2 gap-5 p-4">
                  <div>
                    <p className="text-xs font-semibold text-sage/60 uppercase tracking-wide mb-1.5">
                      {cfg.sceneLabel} {currentSceneIdx + 1} / {totalScenes} — {cfg.visualLabel}
                    </p>
                    <p className="text-sage text-sm leading-relaxed">{scene.visual}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-dusty-rose/60 uppercase tracking-wide mb-1.5">
                      {cfg.audioLabel}
                    </p>
                    <p className="text-sage text-sm leading-relaxed">{scene.audio}</p>
                  </div>
                </div>

                {/* Production: style context upload + single generate button — only in step 2+ */}
                {subStep >= 2 && scene.assets && scene.assets.length > 0 && (
                  <div className="border-t border-sage/10 px-4 pb-4 pt-3">
                    <div className="flex items-start justify-between gap-4">
                      {/* Style references — context for the AI */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-widest mb-1.5">
                          Style References
                          <span className="ml-1.5 font-normal text-sage/30 normal-case tracking-normal">
                            — images / clips to guide the AI style (optional)
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {(sceneReferences.get(currentSceneIdx) || []).map((ref) => (
                            <div key={ref.id} className="flex items-center gap-1.5 px-2 py-1 bg-sage/5 border border-sage/10 rounded-lg">
                              <Upload className="w-3 h-3 text-sage/40 flex-shrink-0" />
                              <span className="text-[11px] text-sage/70 max-w-[90px] truncate">{ref.fileName}</span>
                              <button
                                onClick={() => removeSceneReference(currentSceneIdx, ref.id)}
                                className="text-sage/30 hover:text-red-500 transition-colors flex-shrink-0"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => sceneFileInputRef.current?.click()}
                            className="flex items-center gap-1 px-2 py-1 border border-dashed border-sage/20 hover:border-sage/40 text-sage/40 hover:text-sage/60 rounded-lg text-[11px] transition-all"
                          >
                            <Plus className="w-3 h-3" />
                            Add reference
                          </button>
                          <input
                            ref={sceneFileInputRef}
                            type="file"
                            accept="image/*,video/*,audio/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) addSceneReference(currentSceneIdx, file);
                              e.target.value = '';
                            }}
                          />
                        </div>
                      </div>

                      {/* Single generate button for all assets in this scene */}
                      <button
                        onClick={() => handleGenerateScene(currentSceneIdx)}
                        disabled={generatingScene === currentSceneIdx || scene.assets.every((a: any) => generatedAssets.has(a.id))}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
                          generatingScene === currentSceneIdx
                            ? 'bg-sage/10 text-sage/40 cursor-wait'
                            : scene.assets.every((a: any) => generatedAssets.has(a.id))
                            ? 'bg-sage/5 text-sage/30 cursor-default'
                            : 'bg-sage hover:bg-sage/90 text-cream'
                        }`}
                      >
                        {generatingScene === currentSceneIdx ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                        ) : scene.assets.every((a: any) => generatedAssets.has(a.id)) ? (
                          <><CheckCircle className="w-3.5 h-3.5" /> All Done</>
                        ) : (
                          <><Zap className="w-3.5 h-3.5" /> Generate {cfg.sceneLabel}</>
                        )}
                      </button>
                    </div>

                    {/* Generated results — compact thumbnails with download/replace on hover */}
                    {scene.assets.some((a: any) => generatedAssets.has(a.id)) && (
                      <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-sage/5">
                        {scene.assets.map((asset: any) => {
                          const gen = generatedAssets.get(asset.id);
                          const TypeIcon = asset.type === 'video' ? Video : asset.type === 'audio' ? Headphones : Image;
                          return (
                            <div key={asset.id} className="relative group">
                              {gen ? (
                                <>
                                  <div
                                    className={asset.type === 'image' ? 'cursor-zoom-in' : ''}
                                    onClick={() => asset.type === 'image' && setLightboxUrl(gen.url)}
                                  >
                                    <AssetPreview url={gen.url} type={asset.type} className="w-14 h-14" />
                                  </div>
                                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => handleDownloadAsset(asset.id, gen)} title="Download" className="text-white hover:text-cream">
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                    {asset.type === 'image' && (
                                      <button onClick={() => setLightboxUrl(gen.url)} title="Zoom" className="text-white hover:text-cream">
                                        <Maximize2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div className="w-14 h-14 bg-sage/5 rounded-lg border-2 border-dashed border-sage/10 flex items-center justify-center">
                                  <TypeIcon className="w-4 h-4 text-sage/20" />
                                </div>
                              )}
                              <span className="absolute -bottom-1 -right-1 px-1 py-0.5 bg-sage text-cream text-[8px] font-bold rounded uppercase leading-none">
                                {asset.type.slice(0, 3)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Keyword refine + text overlay — Visual Selection step only */}
                    {subStep === 2 && (
                      <div className="mt-3 pt-3 border-t border-sage/5 space-y-2">
                        <div className="flex gap-2">
                          <input
                            value={sceneKeywords.get(currentSceneIdx) || ''}
                            onChange={(e) => setSceneKeywords((prev) => new Map(prev).set(currentSceneIdx, e.target.value))}
                            placeholder="Refine with keywords… e.g. golden hour, minimal, dark background"
                            onKeyDown={(e) => { if (e.key === 'Enter') handleKeywordRegenerate(currentSceneIdx); }}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-sage/15 text-xs focus:outline-none focus:border-sage text-sage"
                          />
                          <button
                            onClick={() => handleKeywordRegenerate(currentSceneIdx)}
                            disabled={generatingScene === currentSceneIdx}
                            className="px-3 py-1.5 bg-dusty-rose/10 hover:bg-dusty-rose/20 text-dusty-rose rounded-xl text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                          >
                            {generatingScene === currentSceneIdx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            Regenerate
                          </button>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sceneTextOverlay.get(currentSceneIdx) || false}
                            onChange={(e) => setSceneTextOverlay((prev) => new Map(prev).set(currentSceneIdx, e.target.checked))}
                            className="w-3.5 h-3.5 rounded accent-sage"
                          />
                          <span className="text-xs text-sage/60">Add script text on image (following your Visual Identity)</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Card>

      {/* Sub-step 1: Hook text preview */}
      {subStep === 1 && hookVariations.length > 0 && (
        <Card className="bg-white rounded-3xl shadow-soft p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-sage" />
            <h3 className="font-serif text-xl text-sage">Hook Variations</h3>
            <span className="text-sm text-sage/40">{hookVariations.length} options — choose your opener</span>
          </div>
          <div className="space-y-3">
            {hookVariations.map((variation, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl border border-sage/10 bg-gradient-to-r from-sage/5 to-dusty-rose/5 gap-3">
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 bg-dusty-rose/20 text-dusty-rose text-xs font-semibold rounded-full uppercase tracking-wide">{variation.type}</span>
                  <p className="text-sage text-sm leading-relaxed font-medium mt-1.5">{variation.hook}</p>
                </div>
                <Button onClick={() => copyToClipboard(variation.hook, `hook-${idx}`)} variant="ghost" size="sm" className="text-sage/40 hover:text-sage h-8 w-8 p-0 flex-shrink-0">
                  {copiedItem === `hook-${idx}` ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sub-step 1 navigation */}
      {subStep === 1 && (
        <div className="space-y-3">
          {onModify && <InlineModify placeholder="Modify the script or hooks…" onSubmit={onModify} />}
          <div className="flex justify-end">
            <button
              onClick={() => setSubStep(2)}
              className="flex items-center gap-2 px-6 py-3 bg-sage hover:bg-sage/90 text-cream rounded-2xl font-medium transition-colors text-sm"
            >
              Choose Visuals <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sub-step 2 navigation */}
      {subStep === 2 && (
        <div className="space-y-3">
          {onModify && <InlineModify placeholder="Adjust visuals or script…" onSubmit={onModify} />}
          <div className="flex justify-between">
            <button
              onClick={() => setSubStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 border border-sage/20 hover:border-sage text-sage rounded-2xl font-medium transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Script
            </button>
            <button
              onClick={() => setSubStep(3)}
              className="flex items-center gap-2 px-6 py-2.5 bg-sage hover:bg-sage/90 text-cream rounded-2xl font-medium transition-colors text-sm"
            >
              Preview <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sub-step 3: Phone preview + InlineModify + Advanced Assets accordion + Actions */}
      {subStep === 3 && (
        <>
          {/* Mobile phone frame preview */}
          {script?.scenes && script.scenes.length > 0 && (() => {
            const previewScenes = script.scenes;
            const previewScene = previewScenes[currentSceneIdx];
            const firstImageAsset = previewScene?.assets?.find(
              (a: any) => a.type === 'image' && generatedAssets.has(a.id)
            );
            const imageUrl = firstImageAsset ? generatedAssets.get(firstImageAsset.id)?.url : null;
            return (
              <div className="flex flex-col items-center gap-4 py-2">
                <p className="text-xs font-semibold text-sage/40 uppercase tracking-widest">Mobile Preview</p>
                <div className="relative w-[220px]">
                  {/* Phone shell */}
                  <div className="rounded-[32px] border-[3px] border-sage/20 bg-black shadow-soft-lg overflow-hidden">
                    {/* Notch */}
                    <div className="h-5 bg-black flex items-center justify-center">
                      <div className="w-12 h-1 rounded-full bg-white/10" />
                    </div>
                    {/* Screen — 9:16 */}
                    <div className="relative" style={{ aspectRatio: '9/16' }}>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Scene preview"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-sage/20 to-dusty-rose/20 flex items-center justify-center">
                          <p className="text-white/40 text-xs text-center px-4">
                            Generate an image in step 2 to preview
                          </p>
                        </div>
                      )}
                      {/* Voice-over overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-[11px] font-medium leading-snug line-clamp-3">
                          {previewScene?.audio || ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Scene navigation dots */}
                  <div className="flex justify-center gap-1.5 mt-3">
                    {previewScenes.map((_: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSceneIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === currentSceneIdx
                            ? 'bg-sage w-5'
                            : 'bg-sage/20 w-1.5 hover:bg-sage/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {onModify && <InlineModify placeholder="Final tweaks before publishing…" onSubmit={onModify} />}

          {/* Advanced Assets accordion — B-roll + Hook delivery */}
          {(cfg.bRollVisible && bRollShotList.length > 0) || hookVariations.length > 0 ? (
            <Card className="bg-white rounded-3xl shadow-soft p-6">
              <button
                onClick={() => setShowAdvancedAssets((v) => !v)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Camera className="w-5 h-5 text-sage" />
                  <h3 className="font-serif text-xl text-sage">Advanced Assets</h3>
                  <span className="text-sm text-sage/40">B-roll · Hook delivery</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-sage/40 transition-transform ${showAdvancedAssets ? 'rotate-180' : ''}`} />
              </button>

              {showAdvancedAssets && (
                <div className="mt-6 space-y-6">
                  {cfg.bRollVisible && bRollShotList.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-sage/50 uppercase tracking-wider mb-3">{cfg.bRollTitle}</h4>
                      <div className="space-y-3">
                        {bRollShotList.map((shot, idx) => (
                          <div key={idx} className="rounded-2xl border border-sage/10 overflow-hidden">
                            <div className="p-4 bg-gradient-to-br from-sage/5 via-cream/20 to-dusty-rose/5">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-sage text-cream rounded-lg flex items-center justify-center font-bold text-sm">{idx + 1}</div>
                                  <div>
                                    <h4 className="font-semibold text-sage">{shot.title}</h4>
                                    <div className="flex gap-1.5 mt-1">
                                      <span className="px-2 py-0.5 bg-dusty-rose/20 text-dusty-rose text-xs rounded-full">{shot.vibe_tag}</span>
                                      <span className="px-2 py-0.5 bg-sage/15 text-sage text-xs rounded-full">{shot.camera_angle}</span>
                                      <span className="px-2 py-0.5 bg-cream/50 text-sage/60 text-xs rounded-full">{shot.duration}</span>
                                    </div>
                                  </div>
                                </div>
                                <Button onClick={() => copyToClipboard(`${shot.title}\n${shot.description}\n${shot.camera_angle}\n${shot.duration}`, `shot-${idx}`)} variant="ghost" size="sm" className="text-sage/40 hover:text-sage h-8 w-8 p-0">
                                  {copiedItem === `shot-${idx}` ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                              </div>
                              <p className="text-sage/70 text-sm leading-relaxed pl-11">{shot.description}</p>
                            </div>
                            <div className="border-t border-sage/10 px-4 pb-3 pt-2 bg-white/50">
                              <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-widest mb-1">Assets</p>
                              <div className="divide-y divide-sage/5">{getBRollAssets(shot, idx).map((asset) => renderAssetRow(asset))}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {hookVariations.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-sage/50 uppercase tracking-wider mb-3">Hook Delivery Assets</h4>
                      <div className="space-y-3">
                        {hookVariations.map((variation, idx) => (
                          <div key={idx} className="rounded-2xl border border-sage/10 overflow-hidden">
                            <div className="p-4 bg-gradient-to-r from-sage/5 to-dusty-rose/5">
                              <div className="flex items-center justify-between mb-2">
                                <span className="px-2.5 py-0.5 bg-dusty-rose/20 text-dusty-rose text-xs font-semibold rounded-full uppercase tracking-wide">{variation.type}</span>
                                <Button onClick={() => copyToClipboard(variation.hook, `hook-${idx}`)} variant="ghost" size="sm" className="text-sage/40 hover:text-sage h-8 w-8 p-0">
                                  {copiedItem === `hook-${idx}` ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                              </div>
                              <p className="text-sage text-sm leading-relaxed font-medium">{variation.hook}</p>
                            </div>
                            <div className="border-t border-sage/10 px-4 pb-3 pt-2 bg-white/50">
                              <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-widest mb-1">Assets</p>
                              <div className="divide-y divide-sage/5">{getHookAssets(variation, idx).map((asset) => renderAssetRow(asset))}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ) : null}

          {/* Actions */}
          <div className="flex gap-4 pt-2">
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
        </>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-6"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-7 h-7" />
          </button>
          <img
            src={lightboxUrl}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
