'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import {
  User, Save, Loader2, Briefcase, Building2, Globe, Target, Sparkles,
  Package, Users, Plus, X, Headphones, Eye,
  Star, Layers, RefreshCcw, CalendarDays,
  Instagram, Video, Youtube, CheckCircle2, XCircle, ExternalLink, BarChart2, AlertCircle, Link2,
} from 'lucide-react';
import { HotTopicsWidget, type UserNewsItem } from '@/app/dashboard/components/HotTopicsWidget';

// ── Niche taxonomy (Category → Sub-category → Micro-niche) ──────────────────
const NICHE_TAXONOMY: Record<string, Record<string, string[]>> = {
  'Health & Wellness': {
    'Nutrition': ['Fertility Nutrition', 'Gut Health', 'Weight Management', 'Hormonal Balance', 'Sports Nutrition', 'Plant-Based Diet', 'Anti-Inflammatory Eating'],
    'Fitness': ['Strength Training', 'Yoga & Pilates', 'Running', 'HIIT', 'Dance Fitness', 'Mobility & Flexibility'],
    'Mental Health': ['Anxiety & Stress', 'Sleep Optimization', 'Mindfulness & Meditation', 'Burnout Recovery', 'Emotional Resilience'],
    'Holistic Health': ['Ayurveda', 'Traditional Chinese Medicine', 'Functional Medicine', 'Naturopathy', 'Integrative Health'],
    "Women's Health": ['Cycle Syncing', 'Perimenopause & Menopause', 'Postpartum Recovery', 'Fertility & Conception'],
  },
  'Business & Career': {
    'Personal Branding': ['Instagram Growth', 'LinkedIn Authority', 'TikTok Marketing', 'YouTube Strategy', 'Podcast Building'],
    'Entrepreneurship': ['Online Business', 'Freelancing', 'Startups', 'E-commerce', 'Digital Products'],
    'Marketing': ['Content Marketing', 'Email Marketing', 'SEO', 'Social Media Strategy', 'Copywriting'],
    'Coaching & Consulting': ['Life Coaching', 'Business Coaching', 'Leadership', 'Career Transition', 'Executive Coaching'],
  },
  'Money & Finance': {
    'Investing': ['Stock Market', 'Real Estate Investing', 'ETF & Index Funds', 'Crypto', 'Options Trading'],
    'Financial Freedom': ['FIRE Movement', 'Debt Freedom', 'Budgeting', 'Passive Income'],
    'Wealth Building': ['Side Hustles', 'Wealth Mindset', 'Financial Literacy', 'Tax Strategy'],
  },
  'Relationships & Family': {
    'Dating & Love': ['Dating for Singles', 'Divorce Recovery', 'Conscious Relationships', 'Attachment Healing'],
    'Marriage & Partnership': ['Communication Skills', 'Intimacy & Connection', 'Conflict Resolution'],
    'Parenting': ['Baby & Toddler', 'Conscious Parenting', 'Teenage Years', 'Work-Life Balance'],
  },
  'Lifestyle & Culture': {
    'Travel': ['Digital Nomad', 'Budget Travel', 'Luxury Travel', 'Van Life', 'Solo Female Travel'],
    'Sustainability': ['Zero Waste Living', 'Slow Living', 'Eco-Friendly Lifestyle', 'Plant-Based Living'],
    'Fashion & Style': ['Sustainable Fashion', 'Capsule Wardrobe', 'Personal Styling', 'Minimalist Wardrobe'],
    'Food & Cooking': ['Meal Prep', 'Plant-Based Cooking', 'Baking & Pastry', 'Healthy Comfort Food'],
  },
  'Spirituality & Personal Growth': {
    'Spirituality': ['Law of Attraction', 'Human Design', 'Astrology', 'Energy Work & Reiki', 'Shadow Work'],
    'Personal Development': ['Mindset & Growth', 'Productivity Systems', 'Habit Building', 'Goal Achievement'],
    'Creativity': ['Journaling', 'Art & Creative Expression', 'Writing & Storytelling', 'Photography'],
  },
};

// Category labels with emoji for visual guidance
const CATEGORY_META = [
  { key: 'Health & Wellness',           emoji: '🌿' },
  { key: 'Business & Career',           emoji: '💼' },
  { key: 'Money & Finance',             emoji: '💰' },
  { key: 'Relationships & Family',      emoji: '💕' },
  { key: 'Lifestyle & Culture',         emoji: '✨' },
  { key: 'Spirituality & Personal Growth', emoji: '🌙' },
] as const;

const ALL_POST_OBJECTIVES = ['Visibility', 'Connection', 'Conversion', 'Education & Authority'] as const;

const CADENCE_OPTIONS = [
  { value: 3, label: '3×/week', description: 'Light' },
  { value: 4, label: '4×/week', description: 'Steady' },
  { value: 5, label: '5×/week', description: 'Active' },
  { value: 7, label: 'Daily',   description: 'Intensive' },
];

const MIX_PRESETS = [
  { label: 'Growth',    description: 'Audience first', value: { value: 70, authority: 20, sales: 10 } },
  { label: 'Balanced',  description: 'Steady engine',  value: { value: 50, authority: 30, sales: 20 } },
  { label: 'Launch',    description: 'Offer push',      value: { value: 35, authority: 25, sales: 40 } },
  { label: 'Authority', description: 'Expert-led',      value: { value: 30, authority: 60, sales: 10 } },
];

const OBJECTIVE_COLORS: Record<string, string> = {
  'Visibility': 'bg-sage/10 text-sage border border-sage/20',
  'Connection': 'bg-dusty-rose/10 text-dusty-rose border border-dusty-rose/20',
  'Conversion': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Education & Authority': 'bg-blue-50 text-blue-700 border border-blue-200',
};

// ── Component ────────────────────────────────────────────────────────────────
const INTEGRATION_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    gradient: 'from-purple-500 to-pink-500',
    description: 'Connect to enable niche trend analysis tailored to your content.',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Video,
    gradient: 'from-black to-gray-700',
    description: 'Cross-platform trend analysis.',
    comingSoon: true,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    gradient: 'from-red-500 to-red-700',
    description: 'Analyze long-form content performance.',
    comingSoon: true,
  },
];

const ERROR_MESSAGES: Record<string, string> = {
  instagram_cancelled: 'Instagram connection was cancelled.',
  no_facebook_page: 'No Facebook Page found. You need a Facebook Page linked to your Instagram Business/Creator account.',
  no_instagram_business: 'No Instagram Business or Creator account found. Make sure your IG account is set to Business or Creator.',
  oauth_failed: 'Something went wrong during Instagram connection. Please try again.',
};

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    business_name: '',
    website_url: '',
    // Niche funnel (Category > Sub-category > Micro-niche)
    niche_funnel: { category: '', subcategory: '', microniche: '' },
    // AI strategy fields
    persona: '',        // displayed as "Biography"
    niche: '',
    positioning: '',
    offering: '',       // stored as newline-separated bullets
    competitors: [] as string[],
    hot_news: '',
    target_audience: '',
    transformation: '',
    tone: '',           // kept for compat, not shown (covered by verbal_territory.tone)
    brand_words: [] as string[],
    preferred_formats: [] as string[],
    offer_types: [] as string[],
    content_pillars: [] as { title: string; description: string }[],
    visual_identity: '',
    verbal_territory: { tone: '', style: '', preferred_vocabulary: [] as string[], words_to_avoid: [] as string[] },
    post_objectives: [] as string[],
    // Editorial preferences
    editorial_cadence: 4 as number,
    editorial_mix: { value: 50, authority: 30, sales: 20 } as { value: number; authority: number; sales: number },
    editorial_mix_preset: 'Balanced' as string,
  });

  // Tag / pillar input state
  const [newCompetitor, setNewCompetitor] = useState('');
  const [newUseWord, setNewUseWord] = useState('');
  const [newAvoidWord, setNewAvoidWord] = useState('');
  const [newBrandWord, setNewBrandWord] = useState('');
  const [newFormat, setNewFormat] = useState('');
  const [newOfferType, setNewOfferType] = useState('');

  const [userNews, setUserNews] = useState<UserNewsItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'brand' | 'content' | 'connections'>('account');
  const [creatorFaceUrl, setCreatorFaceUrl] = useState<string | null>(null);
  const [creatorVoiceUrl, setCreatorVoiceUrl] = useState<string | null>(null);
  const [isUploadingFace, setIsUploadingFace] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const faceInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUser();
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    if (connected === 'true') setMessage({ type: 'success', text: 'Instagram connected successfully!' });
    else if (error) setMessage({ type: 'error', text: ERROR_MESSAGES[error] || 'Connection failed. Please try again.' });
  }, []);

  const buildFormData = (profile: any) => {
    const s = profile.metadata?.strategy || {};
    const storedFunnel = profile.metadata?.niche_funnel;
    const fallbackIndustries: string[] = profile.metadata?.industries || (profile.industry ? [profile.industry] : []);
    return {
      name: profile.name || '',
      email: profile.email || '',
      business_name: profile.business_name || '',
      website_url: profile.website_url || '',
      niche_funnel: storedFunnel || {
        category: fallbackIndustries[0] || '',
        subcategory: fallbackIndustries[1] || '',
        microniche: fallbackIndustries[2] || '',
      },
      persona: s.persona || '',
      niche: s.niche || '',
      positioning: s.positioning || '',
      offering: s.offering || '',
      competitors: s.competitors || profile.metadata?.competitors || [],
      hot_news: s.hot_news || '',
      target_audience: s.target_audience || '',
      transformation: s.transformation || '',
      tone: s.tone || '',
      brand_words: s.brand_words || [],
      preferred_formats: s.preferred_formats || [],
      offer_types: s.offer_types || [],
      content_pillars: s.content_pillars || [],
      visual_identity: s.visual_identity || '',
      verbal_territory: s.verbal_territory || { tone: '', style: '', preferred_vocabulary: [], words_to_avoid: [] },
      post_objectives: s.post_objectives || [],
      editorial_cadence: profile.metadata?.editorial_preferences?.cadence ?? 4,
      editorial_mix: profile.metadata?.editorial_preferences?.mix ?? { value: 50, authority: 30, sales: 20 },
      editorial_mix_preset: profile.metadata?.editorial_preferences?.mix_preset ?? 'Balanced',
    };
  };

  const loadUser = async () => {
    try {
      const supabase = createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) { router.push('/auth/login'); return; }

      const { data: profile, error: profileError } = await supabase
        .from('users').select('*').eq('id', authUser.id).single();
      if (profileError || !profile) { router.push('/auth/login'); return; }

      setUser(profile);
      setCreatorFaceUrl(profile.creator_face_url || null);
      setCreatorVoiceUrl(profile.creator_voice_url || null);
      setFormData(buildFormData(profile));
      setUserNews(profile.metadata?.user_news ?? []);
    } catch {
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectInstagram = async () => {
    setIsDisconnecting(true);
    try {
      const supabase = createClient();
      await supabase.from('users').update({
        instagram_username: null,
        instagram_user_id: null,
        instagram_access_token: null,
        instagram_token_expires_at: null,
        instagram_profile_picture_url: null,
        instagram_bio: null,
        instagram_follower_count: null,
        instagram_following_count: null,
        instagram_posts_count: null,
        instagram_connected_at: null,
        instagram_last_synced_at: null,
      }).eq('id', user.id);
      setUser((u: any) => ({ ...u, instagram_username: null }));
      setMessage({ type: 'success', text: 'Instagram disconnected.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to disconnect' });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { category, subcategory, microniche } = formData.niche_funnel;
      const derivedIndustries = [category, subcategory, microniche].filter(Boolean);

      const { error } = await supabase.from('users').update({
        name: formData.name,
        business_name: formData.business_name || null,
        industry: derivedIndustries[0] || null,
        website_url: formData.website_url || null,
        metadata: {
          ...(user.metadata || {}),
          industries: derivedIndustries.length ? derivedIndustries : (user.metadata?.industries || []),
          niche_funnel: formData.niche_funnel,
          editorial_preferences: {
            cadence: formData.editorial_cadence,
            mix: formData.editorial_mix,
            mix_preset: formData.editorial_mix_preset,
          },
          strategy: {
            persona: formData.persona || null,
            niche: formData.niche || null,
            positioning: formData.positioning || null,
            offering: formData.offering || null,
            competitors: formData.competitors,
            hot_news: formData.hot_news || null,
            target_audience: formData.target_audience || null,
            transformation: formData.transformation || null,
            tone: formData.tone || null,
            brand_words: formData.brand_words,
            preferred_formats: formData.preferred_formats,
            offer_types: formData.offer_types,
            content_pillars: formData.content_pillars,
            visual_identity: formData.visual_identity || null,
            verbal_territory: formData.verbal_territory,
            post_objectives: formData.post_objectives,
          },
        },
      }).eq('id', user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      await loadUser();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(buildFormData(user));
    setNewCompetitor(''); setNewUseWord(''); setNewAvoidWord('');
    setNewBrandWord(''); setNewFormat(''); setNewOfferType('');
    setIsEditing(false);
    setMessage(null);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setMessage(null);
    try {
      const res = await fetch('/api/onboarding/regenerate', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to regenerate');
      }
      setMessage({ type: 'success', text: 'Strategic profile refreshed!' });
      await loadUser();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to regenerate profile' });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCreatorAssetUpload = async (type: 'face' | 'voice', file: File) => {
    const setUploading = type === 'face' ? setIsUploadingFace : setIsUploadingVoice;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || (type === 'face' ? 'jpg' : 'mp3');
      const filePath = `${user.id}/${type}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('creator-assets').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('creator-assets').getPublicUrl(filePath);
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;
      const column = type === 'face' ? 'creator_face_url' : 'creator_voice_url';
      const { error: updateError } = await supabase.from('users').update({ [column]: urlWithCacheBust }).eq('id', user.id);
      if (updateError) throw updateError;
      if (type === 'face') setCreatorFaceUrl(urlWithCacheBust);
      else setCreatorVoiceUrl(urlWithCacheBust);
      setMessage({ type: 'success', text: `Creator ${type} updated!` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || `Failed to upload ${type}` });
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage animate-spin" />
      </div>
    );
  }

  // ── Shared style tokens ──────────────────────────────────────────────────
  const inputClass = "w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all resize-none";
  const smallInput = "w-full px-3 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none text-sm transition-colors";

  // ── Sub-components ───────────────────────────────────────────────────────
  const ReadableField = ({
    label, icon: Icon, value, placeholder, type = 'text', rows, onChange,
  }: { label: string; icon: any; value: string; placeholder: string; type?: string; rows?: number; onChange: (v: string) => void }) => (
    <div>
      <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-2">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      {isEditing
        ? rows
          ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={inputClass} />
          : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
        : <p className={`text-sage leading-relaxed ${!value ? 'text-sage/30 italic text-sm' : ''}`}>{value || placeholder}</p>
      }
    </div>
  );

  const TagPill = ({ value, color = 'sage', onRemove, strikethrough }: {
    value: string; color?: 'sage' | 'rose'; onRemove?: () => void; strikethrough?: boolean;
  }) => (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${color === 'rose' ? 'bg-dusty-rose/10 text-dusty-rose' : 'bg-sage/10 text-sage'} ${strikethrough ? 'line-through decoration-dusty-rose/50' : ''}`}>
      {value}
      {isEditing && onRemove && (
        <button type="button" onClick={onRemove} className="opacity-50 hover:opacity-100 transition-opacity">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );

  const TagInput = ({ placeholder, value, onChange, onAdd }: {
    placeholder: string; value: string; onChange: (v: string) => void; onAdd: () => void;
  }) => (
    <div className="flex gap-2 mt-2">
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={smallInput}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
      />
      <button type="button" onClick={onAdd} className="px-3 py-2 bg-sage/10 hover:bg-sage/20 text-sage rounded-xl transition-colors">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );

  // ── Derived values ───────────────────────────────────────────────────────
  const { category, subcategory, microniche } = formData.niche_funnel;
  const subcategoryOptions = category && NICHE_TAXONOMY[category] ? Object.keys(NICHE_TAXONOMY[category]) : [];
  const micronicheOptions = category && subcategory && NICHE_TAXONOMY[category]?.[subcategory] ? NICHE_TAXONOMY[category][subcategory] : [];
  // Offering as bullet lines
  const offeringLines = formData.offering.split('\n').filter(l => l.trim()).map(l => l.replace(/^[•\-*]\s*/, ''));

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream">
      <input ref={faceInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCreatorAssetUpload('face', f); e.target.value = ''; }} />
      <input ref={voiceInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCreatorAssetUpload('voice', f); e.target.value = ''; }} />

      <div className="px-8 py-8 max-w-5xl">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif text-4xl text-sage">Settings</h1>
            <p className="text-sage/50 text-sm mt-1">Manage your account, brand strategy and integrations</p>
          </div>
          {activeTab !== 'connections' && (
            isEditing ? (
              <div className="flex gap-3">
                <button onClick={handleCancel} disabled={isSaving} className="px-5 py-2.5 border border-sage/20 hover:border-sage/40 text-sage font-medium rounded-2xl transition-colors disabled:opacity-50">Cancel</button>
                <button onClick={handleSave} disabled={isSaving || !formData.name.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-sage hover:bg-sage/90 text-cream font-medium rounded-2xl transition-colors disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save changes
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-sage hover:bg-sage/90 text-cream font-medium rounded-2xl transition-colors">Edit</button>
            )
          )}
        </div>

        {/* ── Global message ── */}
        {message && (
          <div className={`flex items-start gap-3 rounded-2xl px-4 py-3 mb-6 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {message.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
            <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message.text}</p>
          </div>
        )}

        {/* ── Tab navigation ── */}
        <div className="flex gap-1 mb-8 bg-sage/5 rounded-2xl p-1 w-fit">
          {([
            { key: 'account',     label: 'Account',        icon: User },
            { key: 'brand',       label: 'Brand Strategy', icon: Sparkles },
            { key: 'content',     label: 'Content DNA',    icon: Layers },
            { key: 'connections', label: 'Connections',    icon: Link2 },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-white text-sage shadow-soft'
                  : 'text-sage/50 hover:text-sage hover:bg-white/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ══ TAB: Account ══════════════════════════════════════════════════════ */}
        {activeTab === 'account' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Identity */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-soft p-8">
                <h3 className="font-serif text-xl text-sage mb-6">Identity</h3>
                <div className="flex items-center gap-5 mb-8 pb-8 border-b border-sage/10">
                  <div className="w-16 h-16 bg-dusty-rose rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-serif text-2xl">{formData.name.charAt(0).toUpperCase() || 'U'}</span>
                  </div>
                  <div>
                    <p className="font-serif text-xl text-sage">{formData.name || 'Your Name'}</p>
                    {formData.business_name && <p className="text-sage/50 text-sm">{formData.business_name}</p>}
                    <p className="text-sage/40 text-xs">{formData.email}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <ReadableField label="Full Name" icon={User} value={formData.name} placeholder="Your name" onChange={(v) => setFormData({ ...formData, name: v })} />
                  <ReadableField label="Business Name" icon={Building2} value={formData.business_name} placeholder="Your brand name" onChange={(v) => setFormData({ ...formData, business_name: v })} />
                  <ReadableField label="Website" icon={Globe} value={formData.website_url} placeholder="https://..." type="url" onChange={(v) => setFormData({ ...formData, website_url: v })} />
                </div>
              </div>

              {/* Creator Assets */}
              <div className="bg-white rounded-3xl shadow-soft p-8">
                <h3 className="font-serif text-xl text-sage mb-2">Creator Assets</h3>
                <p className="text-sage/50 text-sm mb-6">Your profile picture and voice sample used across AI generation</p>
                <div className="flex gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-sage/5 border-2 border-dashed border-sage/15 flex items-center justify-center">
                      {creatorFaceUrl ? <img src={creatorFaceUrl} alt="Creator face" className="w-full h-full rounded-2xl object-cover" /> : <User className="w-6 h-6 text-sage/25" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-sage">Profile picture</p>
                      <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Coming soon</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-sage/5 border-2 border-dashed border-sage/15 flex items-center justify-center">
                      <Headphones className="w-6 h-6 text-sage/25" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-sage">Voice sample</p>
                      <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Coming soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account meta */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-soft p-6">
                <h3 className="font-serif text-lg text-sage mb-5">Account</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm text-sage">{formData.email}</p>
                  </div>
                  <div className="border-t border-sage/10" />
                  <div>
                    <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-1">Plan</p>
                    <span className="inline-block px-3 py-1 bg-sage/10 text-sage text-sm font-medium rounded-full capitalize">{user?.subscription_tier || 'Free'}</span>
                  </div>
                  <div className="border-t border-sage/10" />
                  <div>
                    <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-1">Member since</p>
                    <p className="text-sm text-sage">{user && new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              {formData.niche && (
                <div className="bg-white rounded-3xl shadow-soft p-6">
                  <h3 className="font-serif text-lg text-sage mb-3">Your Niche</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.niche_funnel.category && <span className="px-3 py-1 bg-sage/[0.06] text-sage text-sm rounded-full">{formData.niche_funnel.category}</span>}
                    {formData.niche_funnel.subcategory && <span className="px-3 py-1 bg-sage/[0.12] text-sage text-sm font-medium rounded-full">{formData.niche_funnel.subcategory}</span>}
                    {formData.niche_funnel.microniche && <span className="px-3 py-1 bg-dusty-rose/10 text-dusty-rose text-sm font-semibold rounded-full">{formData.niche_funnel.microniche}</span>}
                    {!formData.niche_funnel.category && <span className="text-sm text-sage/30 italic">Not set — go to Brand Strategy to configure</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB: Brand Strategy ═══════════════════════════════════════════════ */}
        {activeTab === 'brand' && (
          <div className="space-y-6">
            {/* Brand Anchor */}
            <div className="bg-white rounded-3xl shadow-soft p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif text-2xl text-sage">Brand Anchor</h3>
                    <span className="px-2 py-0.5 bg-sage/10 text-sage text-[10px] font-semibold rounded-full uppercase tracking-wider">AI-generated</span>
                  </div>
                  <p className="text-sage/50 text-sm">Your strategic positioning, synthesized from onboarding responses</p>
                </div>
                <button onClick={handleRegenerate} disabled={isRegenerating} className="flex items-center gap-2 px-3 py-2 bg-sage/10 hover:bg-sage/20 text-sage text-xs font-medium rounded-xl transition-colors disabled:opacity-50 shrink-0">
                  {isRegenerating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Refreshing…</> : <><RefreshCcw className="w-3.5 h-3.5" /> Refresh AI</>}
                </button>
              </div>
              <div className="space-y-8">
                <ReadableField label="Biography" icon={Sparkles} value={formData.persona} placeholder="Your brand biography and creator personality..." rows={3} onChange={(v) => setFormData({ ...formData, persona: v })} />
                <ReadableField label="Positioning" icon={Target} value={formData.positioning} placeholder="Your unique angle and differentiation..." rows={3} onChange={(v) => setFormData({ ...formData, positioning: v })} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ReadableField label="Niche" icon={Target} value={formData.niche} placeholder="Your niche..." onChange={(v) => setFormData({ ...formData, niche: v })} />
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-2">
                      <Package className="w-3.5 h-3.5" /> Offering
                    </label>
                    {isEditing ? (
                      <>
                        <textarea value={formData.offering} onChange={(e) => setFormData({ ...formData, offering: e.target.value })} placeholder={"Online courses\n1:1 coaching calls\nMonthly membership"} rows={4} className={inputClass} />
                        <p className="text-[10px] text-sage/40 mt-1">One item per line — displayed as bullets</p>
                      </>
                    ) : offeringLines.length > 0 ? (
                      <ul className="space-y-1.5">
                        {offeringLines.map((line, i) => (
                          <li key={i} className="flex items-start gap-2 text-sage">
                            <span className="mt-[7px] w-1.5 h-1.5 bg-sage/40 rounded-full shrink-0" />
                            <span className="leading-relaxed">{line}</span>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-sage/30 italic text-sm">Not set</p>}
                  </div>
                </div>
                <div className="border-t border-sage/10" />
                <ReadableField label="Target Audience" icon={Users} value={formData.target_audience} placeholder="Who is your ideal client?" rows={3} onChange={(v) => setFormData({ ...formData, target_audience: v })} />
                <ReadableField label="Transformation Promise" icon={Star} value={formData.transformation} placeholder="The before → after you deliver..." rows={2} onChange={(v) => setFormData({ ...formData, transformation: v })} />
              </div>
            </div>

            {/* Niche Funnel */}
            <div className="bg-white rounded-3xl shadow-soft p-8">
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="w-4 h-4 text-sage/40" />
                <h3 className="font-serif text-xl text-sage">Niche Funnel</h3>
              </div>
              {isEditing ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-2">1 · Category</p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_META.map(({ key, emoji }) => {
                        const isActive = category === key;
                        return (
                          <button key={key} type="button" onClick={() => setFormData({ ...formData, niche_funnel: { category: isActive ? '' : key, subcategory: '', microniche: '' } })}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isActive ? 'bg-sage text-cream border-sage shadow-sm' : 'bg-transparent text-sage/60 border-sage/20 hover:border-sage/50 hover:text-sage hover:bg-sage/5'}`}>
                            <span>{emoji}</span>{key}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {category && (
                    <div>
                      <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-2">2 · Focus Area <span className="ml-1.5 text-dusty-rose/60 normal-case font-normal">within {category}</span></p>
                      <div className="flex flex-wrap gap-2">
                        {subcategoryOptions.map((sub) => {
                          const isActive = subcategory === sub;
                          return (
                            <button key={sub} type="button" onClick={() => setFormData({ ...formData, niche_funnel: { ...formData.niche_funnel, subcategory: isActive ? '' : sub, microniche: '' } })}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isActive ? 'bg-dusty-rose/15 text-dusty-rose border-dusty-rose/30' : 'bg-transparent text-sage/60 border-sage/20 hover:border-dusty-rose/30 hover:text-dusty-rose/70 hover:bg-dusty-rose/5'}`}>
                              {sub}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {subcategory && (
                    <div>
                      <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-2">3 · Micro-niche</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {micronicheOptions.map((micro) => {
                          const isActive = microniche === micro;
                          return (
                            <button key={micro} type="button" onClick={() => setFormData({ ...formData, niche_funnel: { ...formData.niche_funnel, microniche: isActive ? '' : micro } })}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isActive ? 'bg-dusty-rose text-cream border-dusty-rose shadow-sm' : 'bg-transparent text-sage/60 border-sage/20 hover:border-dusty-rose/30 hover:text-dusty-rose/70 hover:bg-dusty-rose/5'}`}>
                              {micro}
                            </button>
                          );
                        })}
                      </div>
                      <input value={microniche && !micronicheOptions.includes(microniche) ? microniche : ''} onChange={(e) => setFormData({ ...formData, niche_funnel: { ...formData.niche_funnel, microniche: e.target.value } })} placeholder="Or type a custom micro-niche…" className={`${smallInput} text-sage/70 placeholder:text-sage/30`} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  {category ? <><span className="px-3 py-1 bg-sage/[0.06] text-sage text-sm rounded-full">{category}</span>{subcategory && <span className="text-sage/30 text-xs">›</span>}</> : null}
                  {subcategory ? <><span className="px-3 py-1 bg-sage/[0.12] text-sage text-sm font-medium rounded-full">{subcategory}</span>{microniche && <span className="text-sage/30 text-xs">›</span>}</> : null}
                  {microniche ? <span className="px-3 py-1 bg-dusty-rose/10 text-dusty-rose text-sm font-semibold rounded-full">{microniche}</span> : null}
                  {!category && <span className="text-sm text-sage/30 italic">Not set</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB: Content DNA ══════════════════════════════════════════════════ */}
        {activeTab === 'content' && (
          <div className="space-y-6">

            {/* Content Pillars */}
            <div className="bg-white rounded-3xl shadow-soft p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif text-xl text-sage">Content Pillars</h3>
                  <p className="text-sage/50 text-sm mt-0.5">The recurring themes that define your editorial identity</p>
                </div>
                <Link href="/editorial" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage/8 hover:bg-sage/15 text-sage text-xs font-medium border border-sage/15 transition-colors">
                  <CalendarDays className="w-3.5 h-3.5" /> Editorial Calendar
                </Link>
              </div>
              <div className="space-y-3">
                {formData.content_pillars.map((pillar, idx) => (
                  <div key={idx} className="p-4 bg-sage/[0.03] rounded-2xl border border-sage/10">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <span className="w-5 h-5 mt-2.5 bg-dusty-rose/15 text-dusty-rose text-xs font-semibold rounded-full flex items-center justify-center shrink-0">{idx + 1}</span>
                          <input value={pillar.title} onChange={(e) => { const updated = [...formData.content_pillars]; updated[idx] = { ...updated[idx], title: e.target.value }; setFormData({ ...formData, content_pillars: updated }); }} placeholder="Pillar title..." className="flex-1 px-3 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none text-sm font-medium" />
                          <button type="button" onClick={() => setFormData({ ...formData, content_pillars: formData.content_pillars.filter((_, i) => i !== idx) })} className="text-sage/30 hover:text-red-400 transition-colors p-2"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="pl-7">
                          <input value={pillar.description} onChange={(e) => { const updated = [...formData.content_pillars]; updated[idx] = { ...updated[idx], description: e.target.value }; setFormData({ ...formData, content_pillars: updated }); }} placeholder="Short description..." className="w-full px-3 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none text-sm text-sage/70" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 mt-0.5 bg-dusty-rose/15 text-dusty-rose text-xs font-semibold rounded-full flex items-center justify-center shrink-0">{idx + 1}</span>
                        <div>
                          <p className="text-sm font-semibold text-sage">{pillar.title}</p>
                          {pillar.description && <p className="text-xs text-sage/50 mt-0.5 leading-relaxed">{pillar.description}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isEditing && formData.content_pillars.length < 5 && (
                  <button type="button" onClick={() => setFormData({ ...formData, content_pillars: [...formData.content_pillars, { title: '', description: '' }] })} className="w-full py-3 border-2 border-dashed border-sage/15 hover:border-sage/30 text-sage/40 hover:text-sage/60 text-sm rounded-2xl transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add Pillar
                  </button>
                )}
                {!isEditing && formData.content_pillars.length === 0 && <p className="text-sm text-sage/30 italic">No pillars defined yet</p>}
              </div>
            </div>

            {/* Voice & Style */}
            <div className="bg-white rounded-3xl shadow-soft p-8">
              <h3 className="font-serif text-xl text-sage mb-2">Voice & Style</h3>
              <p className="text-sage/50 text-sm mb-6">Your verbal territory — the words and tone that define your brand voice</p>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-1.5">Tone</p>
                    {isEditing ? <input value={formData.verbal_territory.tone} onChange={(e) => setFormData({ ...formData, verbal_territory: { ...formData.verbal_territory, tone: e.target.value } })} placeholder="e.g. Expert, warm, occasionally provocative" className={inputClass} />
                    : formData.verbal_territory.tone ? <p className="text-sage italic font-medium">{formData.verbal_territory.tone}</p> : <p className="text-sage/30 italic text-sm">Not set</p>}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-1.5">Style</p>
                    {isEditing ? <textarea value={formData.verbal_territory.style} onChange={(e) => setFormData({ ...formData, verbal_territory: { ...formData.verbal_territory, style: e.target.value } })} placeholder="e.g. Story-driven, science-backed and conversational" rows={2} className={inputClass} />
                    : formData.verbal_territory.style ? <p className="text-sage leading-relaxed">{formData.verbal_territory.style}</p> : <p className="text-sage/30 italic text-sm">Not set</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-2">Words to use</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.verbal_territory.preferred_vocabulary.map((w, i) => <TagPill key={i} value={w} color="sage" onRemove={() => setFormData({ ...formData, verbal_territory: { ...formData.verbal_territory, preferred_vocabulary: formData.verbal_territory.preferred_vocabulary.filter((_, j) => j !== i) } })} />)}
                      {!isEditing && formData.verbal_territory.preferred_vocabulary.length === 0 && <span className="text-sm text-sage/30 italic">Not set</span>}
                    </div>
                    {isEditing && <TagInput placeholder="Add a word..." value={newUseWord} onChange={setNewUseWord} onAdd={() => { if (newUseWord.trim()) { setFormData({ ...formData, verbal_territory: { ...formData.verbal_territory, preferred_vocabulary: [...formData.verbal_territory.preferred_vocabulary, newUseWord.trim()] } }); setNewUseWord(''); }}} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-2">Words to avoid</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.verbal_territory.words_to_avoid.map((w, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-dusty-rose/10 text-dusty-rose line-through decoration-dusty-rose/50">
                          {w}
                          {isEditing && <button type="button" onClick={() => setFormData({ ...formData, verbal_territory: { ...formData.verbal_territory, words_to_avoid: formData.verbal_territory.words_to_avoid.filter((_, j) => j !== i) } })} className="opacity-50 hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>}
                        </span>
                      ))}
                      {!isEditing && formData.verbal_territory.words_to_avoid.length === 0 && <span className="text-sm text-sage/30 italic">Not set</span>}
                    </div>
                    {isEditing && <TagInput placeholder="Add a word to avoid..." value={newAvoidWord} onChange={setNewAvoidWord} onAdd={() => { if (newAvoidWord.trim()) { setFormData({ ...formData, verbal_territory: { ...formData.verbal_territory, words_to_avoid: [...formData.verbal_territory.words_to_avoid, newAvoidWord.trim()] } }); setNewAvoidWord(''); }}} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Post Objectives + Visual Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-soft p-6">
                <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-4">
                  <Target className="w-3.5 h-3.5" /> Post Objectives
                </label>
                <div className="flex flex-wrap gap-2">
                  {isEditing ? ALL_POST_OBJECTIVES.map((obj) => {
                    const isActive = formData.post_objectives.includes(obj);
                    return (
                      <button key={obj} type="button" onClick={() => { const updated = isActive ? formData.post_objectives.filter((o) => o !== obj) : [...formData.post_objectives, obj]; setFormData({ ...formData, post_objectives: updated }); }}
                        className={`px-4 py-2 rounded-2xl text-sm font-medium border transition-all ${isActive ? OBJECTIVE_COLORS[obj] : 'bg-transparent text-sage/40 border-sage/15 hover:border-sage/30 hover:text-sage/60'}`}>
                        {obj}
                      </button>
                    );
                  }) : formData.post_objectives.length > 0 ? formData.post_objectives.map((obj, i) => (
                    <span key={i} className={`px-4 py-2 rounded-2xl text-sm font-medium ${OBJECTIVE_COLORS[obj] || 'bg-sage/10 text-sage border border-sage/20'}`}>{obj}</span>
                  )) : <span className="text-sm text-sage/30 italic">Not set</span>}
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-soft p-6">
                <div className="mb-4">
                  <h3 className="font-serif text-lg text-sage">Visual Identity</h3>
                  <p className="text-sage/50 text-xs mt-0.5">Brand aesthetic for AI image generation</p>
                </div>
                {isEditing ? <textarea value={formData.visual_identity} onChange={(e) => setFormData({ ...formData, visual_identity: e.target.value })} rows={3} placeholder="e.g. Sage green & dusty rose palette, clean serif titles, airy editorial aesthetic" className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none transition-all text-sm text-sage resize-none" />
                : formData.visual_identity ? <p className="text-sm text-sage/80 leading-relaxed">{formData.visual_identity}</p>
                : <p className="text-sm text-sage/30 italic">Not set</p>}
              </div>
            </div>

            {/* Editorial Preferences */}
          <div className="bg-white rounded-3xl shadow-soft p-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-serif text-xl text-sage">Editorial Preferences</h3>
                <p className="text-sage/50 text-sm mt-0.5">Default cadence and content mix used when generating your calendar and ideas</p>
              </div>
              <Link href="/editorial" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage/8 hover:bg-sage/15 text-sage text-xs font-medium border border-sage/15 transition-colors">
                <CalendarDays className="w-3.5 h-3.5" /> Open Calendar
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cadence */}
              <div>
                <p className="text-xs font-semibold text-sage/50 uppercase tracking-wider mb-3">Posting Cadence</p>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {CADENCE_OPTIONS.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setFormData({ ...formData, editorial_cadence: opt.value })}
                        className={`px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                          formData.editorial_cadence === opt.value
                            ? 'bg-sage text-cream border-sage shadow-sm'
                            : 'bg-transparent text-sage/60 border-sage/20 hover:border-sage/40 hover:text-sage'
                        }`}>
                        {opt.label} <span className="text-[10px] opacity-60 ml-1">{opt.description}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-xl text-sm font-medium bg-sage text-cream">
                      {CADENCE_OPTIONS.find(o => o.value === formData.editorial_cadence)?.label ?? `${formData.editorial_cadence}×/week`}
                    </span>
                    <span className="text-sm text-sage/50">
                      {CADENCE_OPTIONS.find(o => o.value === formData.editorial_cadence)?.description}
                    </span>
                  </div>
                )}
              </div>
              {/* Content Mix */}
              <div>
                <p className="text-xs font-semibold text-sage/50 uppercase tracking-wider mb-3">Content Mix</p>
                {isEditing ? (
                  <>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {MIX_PRESETS.map(preset => (
                        <button key={preset.label} type="button"
                          onClick={() => setFormData({ ...formData, editorial_mix: preset.value, editorial_mix_preset: preset.label })}
                          className={`px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                            formData.editorial_mix_preset === preset.label
                              ? 'bg-dusty-rose text-white border-dusty-rose shadow-sm'
                              : 'bg-transparent text-sage/60 border-sage/20 hover:border-sage/40 hover:text-sage'
                          }`}>
                          {preset.label} <span className="text-[10px] opacity-60 ml-1">{preset.description}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-xl text-sm font-medium bg-dusty-rose text-white">
                      {formData.editorial_mix_preset || 'Balanced'}
                    </span>
                  </div>
                )}
                <div className="mt-3 flex rounded-full overflow-hidden h-1.5">
                  <div className="bg-sage transition-all duration-300" style={{ width: `${formData.editorial_mix.value}%` }} />
                  <div className="bg-blue-400 transition-all duration-300" style={{ width: `${formData.editorial_mix.authority}%` }} />
                  <div className="bg-dusty-rose transition-all duration-300" style={{ width: `${formData.editorial_mix.sales}%` }} />
                </div>
                <div className="mt-1.5 flex gap-4 text-[10px] text-sage/50">
                  <span><span className="inline-block w-1.5 h-1.5 bg-sage rounded-full mr-1 align-middle" />{formData.editorial_mix.value}% Value</span>
                  <span><span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mr-1 align-middle" />{formData.editorial_mix.authority}% Authority</span>
                  <span><span className="inline-block w-1.5 h-1.5 bg-dusty-rose rounded-full mr-1 align-middle" />{formData.editorial_mix.sales}% Sales</span>
                </div>
              </div>
            </div>
          </div>

          {/* Keywords & Formats */}
            <div className="bg-white rounded-3xl shadow-soft p-8">
              <h3 className="font-serif text-xl text-sage mb-6">Keywords & Formats</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-3"><Sparkles className="w-3.5 h-3.5" /> Brand Words</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.brand_words.map((w, i) => <TagPill key={i} value={w} color="rose" onRemove={() => setFormData({ ...formData, brand_words: formData.brand_words.filter((_, j) => j !== i) })} />)}
                    {!isEditing && formData.brand_words.length === 0 && <span className="text-sm text-sage/30 italic">Not set</span>}
                  </div>
                  {isEditing && <TagInput placeholder="Add a brand word..." value={newBrandWord} onChange={setNewBrandWord} onAdd={() => { if (newBrandWord.trim()) { setFormData({ ...formData, brand_words: [...formData.brand_words, newBrandWord.trim()] }); setNewBrandWord(''); }}} />}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-3"><Eye className="w-3.5 h-3.5" /> Preferred Formats</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferred_formats.map((f, i) => <TagPill key={i} value={f} onRemove={() => setFormData({ ...formData, preferred_formats: formData.preferred_formats.filter((_, j) => j !== i) })} />)}
                    {!isEditing && formData.preferred_formats.length === 0 && <span className="text-sm text-sage/30 italic">Not set</span>}
                  </div>
                  {isEditing && <TagInput placeholder="Add a format..." value={newFormat} onChange={setNewFormat} onAdd={() => { if (newFormat.trim()) { setFormData({ ...formData, preferred_formats: [...formData.preferred_formats, newFormat.trim()] }); setNewFormat(''); }}} />}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-3"><Package className="w-3.5 h-3.5" /> Offer Types</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.offer_types.map((o, i) => <TagPill key={i} value={o} onRemove={() => setFormData({ ...formData, offer_types: formData.offer_types.filter((_, j) => j !== i) })} />)}
                    {!isEditing && formData.offer_types.length === 0 && <span className="text-sm text-sage/30 italic">Not set</span>}
                  </div>
                  {isEditing && <TagInput placeholder="Add an offer type..." value={newOfferType} onChange={setNewOfferType} onAdd={() => { if (newOfferType.trim()) { setFormData({ ...formData, offer_types: [...formData.offer_types, newOfferType.trim()] }); setNewOfferType(''); }}} />}
                </div>
              </div>
            </div>

            {/* Competitors */}
            <div className="bg-white rounded-3xl shadow-soft p-8">
              <h3 className="font-serif text-xl text-sage mb-2">Competitors & Inspiration</h3>
              <p className="text-sage/50 text-sm mb-5">Accounts or brands that inspire your content strategy</p>
              {formData.competitors.length > 0 && (
                <div className="space-y-2 mb-3">
                  {formData.competitors.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-sage/5 rounded-xl text-sm text-sage">
                      <Globe className="w-3.5 h-3.5 text-sage/40 shrink-0" />
                      <span className="truncate flex-1">{link}</span>
                      {isEditing && <button type="button" onClick={() => setFormData({ ...formData, competitors: formData.competitors.filter((_, i) => i !== idx) })} className="text-sage/40 hover:text-red-500 transition-colors shrink-0"><X className="w-3.5 h-3.5" /></button>}
                    </div>
                  ))}
                </div>
              )}
              {isEditing && (
                <div className="flex gap-2">
                  <input type="text" value={newCompetitor} onChange={(e) => setNewCompetitor(e.target.value)} placeholder="@handle or URL..." className="flex-1 px-3 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none text-sm" onKeyDown={(e) => { if (e.key === 'Enter' && newCompetitor.trim()) { e.preventDefault(); setFormData({ ...formData, competitors: [...formData.competitors, newCompetitor.trim()] }); setNewCompetitor(''); }}} />
                  <button type="button" onClick={() => { if (newCompetitor.trim()) { setFormData({ ...formData, competitors: [...formData.competitors, newCompetitor.trim()] }); setNewCompetitor(''); }}} className="px-3 py-2 bg-sage/10 hover:bg-sage/20 text-sage rounded-xl transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
              )}
              {!isEditing && formData.competitors.length === 0 && <p className="text-sm text-sage/30 italic">No competitors added yet</p>}
            </div>
          </div>
        )}

        {/* ══ TAB: Connections ══════════════════════════════════════════════════ */}
        {activeTab === 'connections' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hot Topics */}
            <div>
              <HotTopicsWidget initialUserNews={userNews} />
            </div>

            {/* Integrations */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="w-4 h-4 text-sage/50" />
                <h3 className="font-serif text-xl text-sage">Integrations</h3>
              </div>
              <p className="text-sage/50 text-sm mb-6">Connect your social platforms to unlock analytics and trend scraping</p>

              <div className="space-y-4">
                {INTEGRATION_PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  const isInstagram = platform.id === 'instagram';
                  const isConnected = isInstagram && !!user?.instagram_username;

                  return (
                    <div key={platform.id} className={`rounded-2xl border p-5 ${platform.comingSoon ? 'border-warm-border opacity-50' : 'border-warm-border'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-sage">{platform.name}</span>
                            {platform.comingSoon ? (
                              <span className="text-[10px] px-2 py-0.5 bg-sage/10 text-sage/50 rounded-full">Coming soon</span>
                            ) : isConnected ? (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Connected
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-sage/5 text-sage/40 rounded-full">
                                <XCircle className="w-2.5 h-2.5" /> Not connected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-sage/50 leading-relaxed">{platform.description}</p>
                          {isInstagram && (
                            <div className="mt-3">
                              {isConnected ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-sage/60 font-medium">@{user.instagram_username}</span>
                                  <a href={`https://instagram.com/${user.instagram_username}`} target="_blank" rel="noopener noreferrer" className="p-1 text-sage/40 hover:text-sage transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>
                                  <Link href="/integrations/instagram" className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-50 text-xs font-medium transition-colors">
                                    <BarChart2 className="w-3 h-3" /> Analytics
                                  </Link>
                                  <button onClick={handleDisconnectInstagram} disabled={isDisconnecting} className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium transition-colors disabled:opacity-60">
                                    {isDisconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />} Disconnect
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <a href="/api/auth/instagram" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium hover:opacity-90 transition-opacity">
                                    <Instagram className="w-3.5 h-3.5" /> Connect with Instagram
                                  </a>
                                  <p className="text-[11px] text-sage/40">Requires a Business or Creator account linked to a Facebook Page.</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
