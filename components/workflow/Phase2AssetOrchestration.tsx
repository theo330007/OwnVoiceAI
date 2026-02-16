'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2, Video, Image, Zap, Copy, CheckCircle, ChevronDown,
  Download, Camera, Film, LayoutGrid, MessageCircle, GraduationCap, Flame,
  BookOpen, Lightbulb, Heart, TrendingUp, RefreshCw, Headphones, Upload,
  ChevronRight, X, User as UserIcon,
} from 'lucide-react';
import { generateProductionAssets } from '@/app/actions/workflows';

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
    audioLabel: 'Slide Copy',
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

interface Props {
  phase1Data: any;
  contentIdea: any;
  trendTitle: string;
  brandStyle?: string;
  onComplete: (data: any) => void;
  initialData?: any;
  chatMessages?: ChatMessage[];
  creatorFaceUrl?: string | null;
  creatorVoiceUrl?: string | null;
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
        <AssetPreview url={generated.url} type={assetType} />
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
  onComplete,
  initialData = {},
  chatMessages = [],
  creatorFaceUrl,
  creatorVoiceUrl,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState<any>(initialData.script || null);
  const [hookVariations, setHookVariations] = useState<any[]>(initialData.hookVariations || []);
  const [bRollShotList, setBRollShotList] = useState<any[]>(initialData.bRollShotList || []);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['script']));

  // Asset generation state
  const [generatedAssets, setGeneratedAssets] = useState<Map<string, GeneratedAssetResult>>(new Map());
  const [generatingAssets, setGeneratingAssets] = useState<Set<string>>(new Set());
  const [attachedReferences, setAttachedReferences] = useState<Map<string, AttachedReference[]>>(new Map());

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

      const refinementContext = isRegeneration ? buildRefinementContext() : '';

      const assets = await generateProductionAssets({
        trendTitle, contentIdea, contextInfo,
        brandStyle: brandStyle || '',
        contentFormat: format, toneStyle: tone, contentAngle: angle,
        refinementContext,
      });

      setScript(assets.script);
      setHookVariations(assets.hook_variations || []);
      setBRollShotList(assets.shot_list || []);
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

  // --- Asset handlers ---
  const handleGenerateAsset = async (assetId: string, prompt: string, type: string) => {
    setGeneratingAssets((prev) => new Set(prev).add(assetId));
    try {
      const refs = attachedReferences.get(assetId) || [];
      const referenceUrls = refs.map((r) => r.url).filter(Boolean);

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

  const handleDownloadAsset = async (assetId: string, generatedAsset: GeneratedAssetResult) => {
    try {
      const response = await fetch(generatedAsset.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      if (generatedAsset.source === 'upload' && generatedAsset.fileName) {
        a.download = generatedAsset.fileName;
      } else {
        const ext = generatedAsset.url.match(/\.(jpg|jpeg|png|gif|mp4|mov|mp3|wav)$/i)?.[1] || 'bin';
        a.download = `${assetId}.${ext}`;
      }
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white rounded-3xl shadow-soft p-12 text-center">
          <FormatIcon className="w-16 h-16 text-dusty-rose mx-auto mb-6" />
          <h2 className="font-serif text-3xl text-sage mb-4">
            Ready to Create Your {cfg.label}?
          </h2>
          <div className="flex justify-center mb-6"><RecapBadges /></div>
          <p className="text-sage/70 mb-8 max-w-2xl mx-auto">
            {format === 'carousel'
              ? "We'll generate a slide-by-slide script, visual guidelines, hook variations, and production assets for your carousel."
              : format === 'story'
              ? "We'll generate a story sequence, supporting shots, hook variations, and production assets for your stories."
              : "We'll generate a dual-column script, B-roll shot list, hook variations, and production assets for your reel."}
          </p>
          <Button
            onClick={() => handleGenerate(false)}
            className="bg-sage hover:bg-sage/90 text-cream font-medium py-4 px-8 rounded-2xl"
          >
            <Zap className="w-5 h-5 mr-2" />
            {cfg.generateLabel}
          </Button>
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
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <RecapBadges />
        <div className="flex items-center gap-2">
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
                <><Zap className="w-4 h-4" /> Generate All Assets ({totalAssets})</>
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

      {chatMessages.filter((m) => m.role === 'user').length > 0 && (
        <p className="text-xs text-sage/50 -mt-2">
          Your chat feedback will be used as refinement context
        </p>
      )}

      {/* Script + Inline Assets */}
      <Card className="bg-white rounded-3xl shadow-soft p-6">
        <SectionHeader
          id="script"
          icon={FormatIcon}
          title={cfg.scriptTitle}
          preview={`${script.scenes.length} ${cfg.sceneLabel.toLowerCase()}s${sceneAssetCount > 0 ? ` · ${sceneAssetCount} assets` : ''}`}
          actions={
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
            </div>
          }
        />

        {expandedSections.has('script') && (
          <div className="mt-6 space-y-4">
            {script.scenes.map((scene: any, idx: number) => (
              <div key={idx} className={`rounded-2xl overflow-hidden ${
                format === 'carousel'
                  ? 'bg-gradient-to-r from-dusty-rose/5 to-sage/5'
                  : format === 'story'
                  ? 'bg-gradient-to-r from-sage/5 to-sage/10'
                  : 'bg-gradient-to-r from-sage/5 to-dusty-rose/5'
              }`}>
                {/* Script columns */}
                <div className="grid grid-cols-2 gap-5 p-4">
                  <div>
                    <p className="text-xs font-semibold text-sage/60 uppercase tracking-wide mb-1.5">
                      {cfg.sceneLabel} {idx + 1} — {cfg.visualLabel}
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

                {/* Inline assets for this scene */}
                {scene.assets && scene.assets.length > 0 && (
                  <div className="border-t border-sage/10 px-4 pb-3 pt-2">
                    <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-widest mb-1">Assets</p>
                    <div className="divide-y divide-sage/5">
                      {scene.assets.map((asset: any) => renderAssetRow(asset))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* B-Roll / Visual Guidelines + Inline Assets */}
      {cfg.bRollVisible && bRollShotList.length > 0 && (
        <Card className="bg-white rounded-3xl shadow-soft p-6">
          <SectionHeader
            id="broll"
            icon={format === 'carousel' ? Image : Camera}
            title={cfg.bRollTitle}
            preview={`${bRollShotList.length} ${format === 'carousel' ? 'guidelines' : 'shots'} · ${bRollAssetCount} assets`}
          />
          {expandedSections.has('broll') && (
            <div className="mt-6 space-y-3">
              {bRollShotList.map((shot, idx) => (
                <div key={idx} className="rounded-2xl border border-sage/10 overflow-hidden">
                  {/* Shot info */}
                  <div className="p-4 bg-gradient-to-br from-sage/5 via-cream/20 to-dusty-rose/5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sage text-cream rounded-lg flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sage">{shot.title}</h4>
                          <div className="flex gap-1.5 mt-1">
                            <span className="px-2 py-0.5 bg-dusty-rose/20 text-dusty-rose text-xs rounded-full">{shot.vibe_tag}</span>
                            <span className="px-2 py-0.5 bg-sage/15 text-sage text-xs rounded-full">{shot.camera_angle}</span>
                            <span className="px-2 py-0.5 bg-cream/50 text-sage/60 text-xs rounded-full">{shot.duration}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(`${shot.title}\n${shot.description}\n${shot.camera_angle}\n${shot.duration}`, `shot-${idx}`)}
                        variant="ghost" size="sm" className="text-sage/40 hover:text-sage h-8 w-8 p-0"
                      >
                        {copiedItem === `shot-${idx}` ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sage/70 text-sm leading-relaxed pl-11">{shot.description}</p>
                  </div>

                  {/* B-roll asset slots */}
                  <div className="border-t border-sage/10 px-4 pb-3 pt-2 bg-white/50">
                    <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-widest mb-1">Assets</p>
                    <div className="divide-y divide-sage/5">
                      {getBRollAssets(shot, idx).map((asset) => renderAssetRow(asset))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Hook Variations + Inline Assets */}
      <Card className="bg-white rounded-3xl shadow-soft p-6">
        <SectionHeader
          id="hooks" icon={Zap} title="A/B Hook Testing"
          preview={`${hookVariations.length} variations · ${hookAssetCount} assets`}
        />
        {expandedSections.has('hooks') && (
          <div className="mt-6 space-y-3">
            {hookVariations.map((variation, idx) => (
              <div key={idx} className="rounded-2xl border border-sage/10 overflow-hidden">
                {/* Hook info */}
                <div className="p-4 bg-gradient-to-r from-sage/5 to-dusty-rose/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 bg-dusty-rose/20 text-dusty-rose text-xs font-semibold rounded-full uppercase tracking-wide">
                      {variation.type}
                    </span>
                    <Button
                      onClick={() => copyToClipboard(variation.hook, `hook-${idx}`)}
                      variant="ghost" size="sm" className="text-sage/40 hover:text-sage h-8 w-8 p-0"
                    >
                      {copiedItem === `hook-${idx}` ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-sage text-sm leading-relaxed font-medium">{variation.hook}</p>
                </div>

                {/* Hook asset slots */}
                <div className="border-t border-sage/10 px-4 pb-3 pt-2 bg-white/50">
                  <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-widest mb-1">Assets</p>
                  <div className="divide-y divide-sage/5">
                    {getHookAssets(variation, idx).map((asset) => renderAssetRow(asset))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

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
    </div>
  );
}
