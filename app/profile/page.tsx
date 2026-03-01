'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import {
  User, Save, Loader2, Briefcase, Building2, Globe, Target, Sparkles,
  Package, Users, Newspaper, Plus, X, Camera, Headphones, Upload, Eye,
  MessageSquare, Star, Layers, RefreshCcw, CalendarDays,
} from 'lucide-react';

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

const OBJECTIVE_COLORS: Record<string, string> = {
  'Visibility': 'bg-sage/10 text-sage border border-sage/20',
  'Connection': 'bg-dusty-rose/10 text-dusty-rose border border-dusty-rose/20',
  'Conversion': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Education & Authority': 'bg-blue-50 text-blue-700 border border-blue-200',
};

// ── Component ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
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
  });

  // Tag / pillar input state
  const [newCompetitor, setNewCompetitor] = useState('');
  const [newUseWord, setNewUseWord] = useState('');
  const [newAvoidWord, setNewAvoidWord] = useState('');
  const [newBrandWord, setNewBrandWord] = useState('');
  const [newFormat, setNewFormat] = useState('');
  const [newOfferType, setNewOfferType] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [creatorFaceUrl, setCreatorFaceUrl] = useState<string | null>(null);
  const [creatorVoiceUrl, setCreatorVoiceUrl] = useState<string | null>(null);
  const [isUploadingFace, setIsUploadingFace] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const faceInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadUser(); }, []);

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
    } catch {
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
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
  const hasEditorialContent = formData.content_pillars.length > 0 || formData.verbal_territory?.tone || formData.verbal_territory?.preferred_vocabulary?.length > 0 || formData.post_objectives?.length > 0;

  // Offering as bullet lines
  const offeringLines = formData.offering.split('\n').filter(l => l.trim()).map(l => l.replace(/^[•\-*]\s*/, ''));

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      {/* Hidden file inputs — rendered once */}
      <input ref={faceInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCreatorAssetUpload('face', f); e.target.value = ''; }} />
      <input ref={voiceInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCreatorAssetUpload('voice', f); e.target.value = ''; }} />

      <div className="max-w-6xl mx-auto">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl text-sage mb-1">My Profile</h1>
            <p className="text-sage/50 text-sm">Manage your account and brand strategy</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button onClick={handleCancel} disabled={isSaving} className="px-6 py-2.5 border border-sage/20 hover:border-sage/40 text-sage font-medium rounded-2xl transition-colors disabled:opacity-50">Cancel</button>
                <button onClick={handleSave} disabled={isSaving || !formData.name.trim()} className="flex items-center gap-2 px-6 py-2.5 bg-sage hover:bg-sage/90 text-cream font-medium rounded-2xl transition-colors disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-sage hover:bg-sage/90 text-cream font-medium rounded-2xl transition-colors">Edit Profile</button>
            )}
          </div>
        </div>

        {message && (
          <div className={`rounded-2xl px-4 py-3 mb-6 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message.text}</p>
          </div>
        )}

        {/* ── Identity Bar ── */}
        <div className="bg-white rounded-3xl shadow-soft p-5 mb-6 flex flex-wrap items-center gap-5">
          <div className="w-16 h-16 bg-dusty-rose rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-serif text-2xl">{formData.name.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          <div className="flex-1 min-w-[140px]">
            <p className="font-serif text-xl text-sage leading-tight">{formData.name || 'Your Name'}</p>
            {formData.business_name && <p className="text-sage/50 text-sm">{formData.business_name}</p>}
            <p className="text-sage/40 text-xs">{formData.email}</p>
            {formData.niche && (
              <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-dusty-rose/10 text-dusty-rose text-[11px] font-medium rounded-full">{formData.niche}</span>
            )}
          </div>
          <div className="hidden md:block w-px h-12 bg-sage/10 shrink-0" />
          <div className="hidden md:block shrink-0 text-sm">
            <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider">Member since</p>
            <p className="text-sage font-medium">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
            <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mt-2">Plan</p>
            <p className="text-sage font-medium capitalize">{user.subscription_tier || 'Free'}</p>
          </div>
          <div className="hidden lg:block w-px h-12 bg-sage/10 shrink-0" />
          {/* Creator Assets inline on desktop */}
          <div className="hidden lg:flex items-center gap-5 shrink-0">
            <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider">Creator Assets</p>
            <div className="flex items-center gap-2">
              {creatorFaceUrl ? <img src={creatorFaceUrl} alt="Face" className="w-10 h-10 rounded-full object-cover border-2 border-sage/10" /> : <div className="w-10 h-10 rounded-full bg-sage/5 border-2 border-dashed border-sage/15 flex items-center justify-center"><User className="w-4 h-4 text-sage/25" /></div>}
              <button onClick={() => faceInputRef.current?.click()} disabled={isUploadingFace} className="flex items-center gap-1 px-2.5 py-1.5 bg-sage/10 hover:bg-sage/20 text-sage text-[11px] font-medium rounded-xl transition-colors disabled:opacity-50">
                {isUploadingFace ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Upload className="w-3 h-3" /> Face</>}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {creatorVoiceUrl ? <div className="w-10 h-10 rounded-full bg-dusty-rose/10 border-2 border-dusty-rose/20 flex items-center justify-center"><Headphones className="w-4 h-4 text-dusty-rose" /></div> : <div className="w-10 h-10 rounded-full bg-sage/5 border-2 border-dashed border-sage/15 flex items-center justify-center"><Headphones className="w-4 h-4 text-sage/25" /></div>}
              <button onClick={() => voiceInputRef.current?.click()} disabled={isUploadingVoice} className="flex items-center gap-1 px-2.5 py-1.5 bg-sage/10 hover:bg-sage/20 text-sage text-[11px] font-medium rounded-xl transition-colors disabled:opacity-50">
                {isUploadingVoice ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Upload className="w-3 h-3" /> Voice</>}
              </button>
            </div>
          </div>
        </div>

        {/* ── Main 2-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ══ Left: Brand Intelligence (2/3) ══════════════════════════════ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Brand Anchor */}
            <div className="bg-white rounded-3xl shadow-soft p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif text-2xl text-sage">Brand Anchor</h3>
                    <span className="px-2 py-0.5 bg-sage/10 text-sage text-[10px] font-semibold rounded-full uppercase tracking-wider">AI-generated</span>
                  </div>
                  <p className="text-sage/50 text-sm">Your strategic brand positioning, synthesized from onboarding</p>
                </div>
                <button onClick={handleRegenerate} disabled={isRegenerating} className="flex items-center gap-2 px-3 py-2 bg-sage/10 hover:bg-sage/20 text-sage text-xs font-medium rounded-xl transition-colors disabled:opacity-50 shrink-0">
                  {isRegenerating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Refreshing…</> : <><RefreshCcw className="w-3.5 h-3.5" /> Refresh AI</>}
                </button>
              </div>

              <div className="space-y-8">
                {/* Biography (was Persona) */}
                <ReadableField label="Biography" icon={Sparkles} value={formData.persona} placeholder="Your brand biography and creator personality..." rows={3} onChange={(v) => setFormData({ ...formData, persona: v })} />

                {/* Positioning */}
                <ReadableField label="Positioning" icon={Target} value={formData.positioning} placeholder="Your unique angle and differentiation..." rows={3} onChange={(v) => setFormData({ ...formData, positioning: v })} />

                {/* Niche + Offering */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ReadableField label="Niche" icon={Target} value={formData.niche} placeholder="Your niche..." onChange={(v) => setFormData({ ...formData, niche: v })} />

                  {/* Offering — bullet display */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-2">
                      <Package className="w-3.5 h-3.5" /> Offering
                    </label>
                    {isEditing ? (
                      <>
                        <textarea
                          value={formData.offering}
                          onChange={(e) => setFormData({ ...formData, offering: e.target.value })}
                          placeholder={"Online courses\n1:1 coaching calls\nMonthly membership"}
                          rows={4}
                          className={inputClass}
                        />
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
                    ) : (
                      <p className="text-sage/30 italic text-sm">Not set</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-sage/10" />

                <ReadableField label="Target Audience" icon={Users} value={formData.target_audience} placeholder="Who is your ideal client?" rows={3} onChange={(v) => setFormData({ ...formData, target_audience: v })} />
                <ReadableField label="Transformation Promise" icon={Star} value={formData.transformation} placeholder="The before → after you deliver..." rows={2} onChange={(v) => setFormData({ ...formData, transformation: v })} />
              </div>
            </div>

            {/* Editorial Positioning — fully editable */}
            {(hasEditorialContent || isEditing) && (
              <div className="bg-white rounded-3xl shadow-soft p-8">
                <div className="flex items-center gap-2 mb-8">
                  <h3 className="font-serif text-2xl text-sage">Editorial Positioning</h3>
                  <span className="px-2 py-0.5 bg-dusty-rose/10 text-dusty-rose text-[10px] font-semibold rounded-full uppercase tracking-wider">AI-identified · Editable</span>
                  <Link
                    href="/editorial"
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage/8 hover:bg-sage/15 text-sage text-xs font-medium border border-sage/15 transition-colors"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    Monthly Editorial Calendar
                  </Link>
                </div>

                <div className="space-y-8">

                  {/* Content Pillars */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-3">
                      <Layers className="w-3.5 h-3.5" /> Content Pillars
                    </label>
                    <div className="space-y-3">
                      {formData.content_pillars.map((pillar, idx) => (
                        <div key={idx} className="p-4 bg-sage/[0.03] rounded-2xl border border-sage/10">
                          {isEditing ? (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <span className="w-5 h-5 mt-2.5 bg-dusty-rose/15 text-dusty-rose text-xs font-semibold rounded-full flex items-center justify-center shrink-0">{idx + 1}</span>
                                <input
                                  value={pillar.title}
                                  onChange={(e) => {
                                    const updated = [...formData.content_pillars];
                                    updated[idx] = { ...updated[idx], title: e.target.value };
                                    setFormData({ ...formData, content_pillars: updated });
                                  }}
                                  placeholder="Pillar title..."
                                  className="flex-1 px-3 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none text-sm font-medium"
                                />
                                <button type="button" onClick={() => setFormData({ ...formData, content_pillars: formData.content_pillars.filter((_, i) => i !== idx) })} className="text-sage/30 hover:text-red-400 transition-colors p-2">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="pl-7">
                                <input
                                  value={pillar.description}
                                  onChange={(e) => {
                                    const updated = [...formData.content_pillars];
                                    updated[idx] = { ...updated[idx], description: e.target.value };
                                    setFormData({ ...formData, content_pillars: updated });
                                  }}
                                  placeholder="Short description..."
                                  className="w-full px-3 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none text-sm text-sage/70"
                                />
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
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, content_pillars: [...formData.content_pillars, { title: '', description: '' }] })}
                          className="w-full py-3 border-2 border-dashed border-sage/15 hover:border-sage/30 text-sage/40 hover:text-sage/60 text-sm rounded-2xl transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Add Pillar
                        </button>
                      )}
                      {!isEditing && formData.content_pillars.length === 0 && (
                        <p className="text-sm text-sage/30 italic">No pillars defined yet</p>
                      )}
                    </div>
                  </div>

                  {/* Verbal Territory */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-4">
                      <MessageSquare className="w-3.5 h-3.5" /> Verbal Territory
                    </label>
                    <div className="space-y-5">
                      {/* Tone */}
                      <div>
                        <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-1.5">Tone</p>
                        {isEditing ? (
                          <input value={formData.verbal_territory.tone} onChange={(e) => setFormData({ ...formData, verbal_territory: { ...formData.verbal_territory, tone: e.target.value } })} placeholder="e.g. Expert, warm, occasionally provocative" className={inputClass} />
                        ) : formData.verbal_territory.tone ? (
                          <p className="text-sage italic font-medium">{formData.verbal_territory.tone}</p>
                        ) : (
                          <p className="text-sage/30 italic text-sm">Not set</p>
                        )}
                      </div>
                      {/* Style */}
                      <div>
                        <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-1.5">Style</p>
                        {isEditing ? (
                          <textarea value={formData.verbal_territory.style} onChange={(e) => setFormData({ ...formData, verbal_territory: { ...formData.verbal_territory, style: e.target.value } })} placeholder="e.g. Story-driven, science-backed and conversational" rows={2} className={inputClass} />
                        ) : formData.verbal_territory.style ? (
                          <p className="text-sage leading-relaxed">{formData.verbal_territory.style}</p>
                        ) : (
                          <p className="text-sage/30 italic text-sm">Not set</p>
                        )}
                      </div>
                      {/* Use → */}
                      <div>
                        <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-2">Use →</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.verbal_territory.preferred_vocabulary.map((w, i) => (
                            <TagPill key={i} value={w} color="sage" onRemove={() => setFormData({ ...formData, verbal_territory: { ...formData.verbal_territory, preferred_vocabulary: formData.verbal_territory.preferred_vocabulary.filter((_, j) => j !== i) } })} />
                          ))}
                          {!isEditing && formData.verbal_territory.preferred_vocabulary.length === 0 && <span className="text-sm text-sage/30 italic">Not set</span>}
                        </div>
                        {isEditing && <TagInput placeholder="Add a word to use..." value={newUseWord} onChange={setNewUseWord} onAdd={() => { if (newUseWord.trim()) { setFormData({ ...formData, verbal_territory: { ...formData.verbal_territory, preferred_vocabulary: [...formData.verbal_territory.preferred_vocabulary, newUseWord.trim()] } }); setNewUseWord(''); } }} />}
                      </div>
                      {/* Avoid → */}
                      <div>
                        <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-2">Avoid →</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.verbal_territory.words_to_avoid.map((w, i) => (
                            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-dusty-rose/10 text-dusty-rose line-through decoration-dusty-rose/50">
                              {w}
                              {isEditing && <button type="button" onClick={() => setFormData({ ...formData, verbal_territory: { ...formData.verbal_territory, words_to_avoid: formData.verbal_territory.words_to_avoid.filter((_, j) => j !== i) } })} className="opacity-50 hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>}
                            </span>
                          ))}
                          {!isEditing && formData.verbal_territory.words_to_avoid.length === 0 && <span className="text-sm text-sage/30 italic">Not set</span>}
                        </div>
                        {isEditing && <TagInput placeholder="Add a word to avoid..." value={newAvoidWord} onChange={setNewAvoidWord} onAdd={() => { if (newAvoidWord.trim()) { setFormData({ ...formData, verbal_territory: { ...formData.verbal_territory, words_to_avoid: [...formData.verbal_territory.words_to_avoid, newAvoidWord.trim()] } }); setNewAvoidWord(''); } }} />}
                      </div>
                    </div>
                  </div>

                  {/* Post Objectives — toggle buttons when editing */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-3">
                      <Target className="w-3.5 h-3.5" /> Post Objectives
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {isEditing ? (
                        ALL_POST_OBJECTIVES.map((obj) => {
                          const isActive = formData.post_objectives.includes(obj);
                          return (
                            <button
                              key={obj}
                              type="button"
                              onClick={() => {
                                const updated = isActive
                                  ? formData.post_objectives.filter((o) => o !== obj)
                                  : [...formData.post_objectives, obj];
                                setFormData({ ...formData, post_objectives: updated });
                              }}
                              className={`px-4 py-2 rounded-2xl text-sm font-medium border transition-all ${isActive ? OBJECTIVE_COLORS[obj] : 'bg-transparent text-sage/40 border-sage/15 hover:border-sage/30 hover:text-sage/60'}`}
                            >
                              {obj}
                            </button>
                          );
                        })
                      ) : formData.post_objectives.length > 0 ? (
                        formData.post_objectives.map((obj, i) => (
                          <span key={i} className={`px-4 py-2 rounded-2xl text-sm font-medium ${OBJECTIVE_COLORS[obj] || 'bg-sage/10 text-sage border border-sage/20'}`}>{obj}</span>
                        ))
                      ) : (
                        <span className="text-sm text-sage/30 italic">Not set</span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Visual Identity */}
            <div className="bg-white rounded-3xl shadow-soft p-8">
              <div className="mb-4">
                <h3 className="font-serif text-xl text-sage">Visual Identity</h3>
                <p className="text-sage/50 text-sm mt-0.5">Brand aesthetic for image generation guidance</p>
              </div>
              {isEditing ? (
                <textarea value={formData.visual_identity} onChange={(e) => setFormData({ ...formData, visual_identity: e.target.value })} rows={3} placeholder="e.g. Sage green & dusty rose palette, clean serif titles, soft grain texture, airy editorial aesthetic" className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all text-sm text-sage resize-none" />
              ) : formData.visual_identity ? (
                <p className="text-sm text-sage/80 leading-relaxed">{formData.visual_identity}</p>
              ) : (
                <p className="text-sm text-sage/30 italic">Not set — describe your brand aesthetic to guide AI image generation</p>
              )}
            </div>

          </div>

          {/* ══ Right Sidebar: Info & Keywords (1/3) ═══════════════════════ */}
          <div className="space-y-6">

            {/* Your Information */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h3 className="font-serif text-lg text-sage mb-5">Your Information</h3>
              <div className="space-y-5">
                <ReadableField label="Full Name" icon={User} value={formData.name} placeholder="Your name" onChange={(v) => setFormData({ ...formData, name: v })} />
                <ReadableField label="Business Name" icon={Building2} value={formData.business_name} placeholder="Your brand name" onChange={(v) => setFormData({ ...formData, business_name: v })} />
                <ReadableField label="Website" icon={Globe} value={formData.website_url} placeholder="https://..." type="url" onChange={(v) => setFormData({ ...formData, website_url: v })} />
              </div>
            </div>

            {/* Niche Funnel */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-4 h-4 text-sage/40" />
                <h3 className="text-xs font-semibold text-sage/50 uppercase tracking-wider">Niche Funnel</h3>
              </div>
              {isEditing ? (
                <div className="space-y-5">

                  {/* Step 1 — Category (always visible) */}
                  <div>
                    <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-2">
                      1 · Category
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_META.map(({ key, emoji }) => {
                        const isActive = category === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              niche_funnel: { category: isActive ? '' : key, subcategory: '', microniche: '' },
                            })}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              isActive
                                ? 'bg-sage text-cream border-sage shadow-sm'
                                : 'bg-transparent text-sage/60 border-sage/20 hover:border-sage/50 hover:text-sage hover:bg-sage/5'
                            }`}
                          >
                            <span>{emoji}</span>
                            {key}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2 — Sub-category (dynamic, appears after category picked) */}
                  {category && (
                    <div>
                      <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-2">
                        2 · Focus Area
                        <span className="ml-1.5 text-dusty-rose/60 normal-case font-normal">within {category}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {subcategoryOptions.map((sub) => {
                          const isActive = subcategory === sub;
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                niche_funnel: { ...formData.niche_funnel, subcategory: isActive ? '' : sub, microniche: '' },
                              })}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                isActive
                                  ? 'bg-dusty-rose/15 text-dusty-rose border-dusty-rose/30'
                                  : 'bg-transparent text-sage/60 border-sage/20 hover:border-dusty-rose/30 hover:text-dusty-rose/70 hover:bg-dusty-rose/5'
                              }`}
                            >
                              {sub}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 3 — Micro-niche (tags + custom free input) */}
                  {subcategory && (
                    <div>
                      <p className="text-[10px] font-semibold text-sage/40 uppercase tracking-wider mb-2">
                        3 · Micro-niche
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {micronicheOptions.map((micro) => {
                          const isActive = microniche === micro;
                          return (
                            <button
                              key={micro}
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                niche_funnel: { ...formData.niche_funnel, microniche: isActive ? '' : micro },
                              })}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                isActive
                                  ? 'bg-sage/15 text-sage border-sage/30 font-semibold'
                                  : 'bg-transparent text-sage/55 border-sage/15 hover:border-sage/35 hover:text-sage/80 hover:bg-sage/5'
                              }`}
                            >
                              {micro}
                            </button>
                          );
                        })}
                      </div>
                      <input
                        value={micronicheOptions.includes(microniche) ? '' : microniche}
                        onChange={(e) => setFormData({
                          ...formData,
                          niche_funnel: { ...formData.niche_funnel, microniche: e.target.value },
                        })}
                        placeholder="Or type a custom micro-niche…"
                        className={`${smallInput} text-sage/70 placeholder:text-sage/30`}
                      />
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

            {/* Keywords & Metadata */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h3 className="font-serif text-lg text-sage mb-5">Keywords & Metadata</h3>
              <div className="space-y-5">

                {/* Brand Words */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> Brand Words
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.brand_words.map((w, i) => <TagPill key={i} value={w} color="rose" onRemove={() => setFormData({ ...formData, brand_words: formData.brand_words.filter((_, j) => j !== i) })} />)}
                    {!isEditing && formData.brand_words.length === 0 && <span className="text-sm text-sage/30 italic">Not set</span>}
                  </div>
                  {isEditing && <TagInput placeholder="Add a brand word..." value={newBrandWord} onChange={setNewBrandWord} onAdd={() => { if (newBrandWord.trim()) { setFormData({ ...formData, brand_words: [...formData.brand_words, newBrandWord.trim()] }); setNewBrandWord(''); } }} />}
                </div>

                {/* Preferred Formats */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-2">
                    <Eye className="w-3.5 h-3.5" /> Preferred Formats
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferred_formats.map((f, i) => <TagPill key={i} value={f} onRemove={() => setFormData({ ...formData, preferred_formats: formData.preferred_formats.filter((_, j) => j !== i) })} />)}
                    {!isEditing && formData.preferred_formats.length === 0 && <span className="text-sm text-sage/30 italic">Not set</span>}
                  </div>
                  {isEditing && <TagInput placeholder="Add a format..." value={newFormat} onChange={setNewFormat} onAdd={() => { if (newFormat.trim()) { setFormData({ ...formData, preferred_formats: [...formData.preferred_formats, newFormat.trim()] }); setNewFormat(''); } }} />}
                </div>

                {/* Offer Types */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-2">
                    <Package className="w-3.5 h-3.5" /> Offer Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.offer_types.map((o, i) => <TagPill key={i} value={o} onRemove={() => setFormData({ ...formData, offer_types: formData.offer_types.filter((_, j) => j !== i) })} />)}
                    {!isEditing && formData.offer_types.length === 0 && <span className="text-sm text-sage/30 italic">Not set</span>}
                  </div>
                  {isEditing && <TagInput placeholder="Add an offer type..." value={newOfferType} onChange={setNewOfferType} onAdd={() => { if (newOfferType.trim()) { setFormData({ ...formData, offer_types: [...formData.offer_types, newOfferType.trim()] }); setNewOfferType(''); } }} />}
                </div>

              </div>
            </div>

            {/* Creator Assets — visible on mobile/tablet */}
            <div className="lg:hidden bg-white rounded-3xl shadow-soft p-6">
              <h3 className="text-xs font-semibold text-sage/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Camera className="w-3.5 h-3.5" /> Creator Assets
              </h3>
              <div className="flex gap-6">
                <div className="flex items-center gap-3">
                  {creatorFaceUrl ? <img src={creatorFaceUrl} alt="Face" className="w-12 h-12 rounded-full object-cover border-2 border-sage/10" /> : <div className="w-12 h-12 rounded-full bg-sage/5 border-2 border-dashed border-sage/15 flex items-center justify-center"><User className="w-5 h-5 text-sage/25" /></div>}
                  <button onClick={() => faceInputRef.current?.click()} disabled={isUploadingFace} className="flex items-center gap-1.5 px-3 py-1.5 bg-sage/10 hover:bg-sage/20 text-sage text-xs font-medium rounded-xl transition-colors disabled:opacity-50">
                    {isUploadingFace ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading</> : <><Upload className="w-3 h-3" /> {creatorFaceUrl ? 'Change' : 'Face'}</>}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {creatorVoiceUrl ? <div className="w-12 h-12 rounded-full bg-dusty-rose/10 border-2 border-dusty-rose/20 flex items-center justify-center"><Headphones className="w-5 h-5 text-dusty-rose" /></div> : <div className="w-12 h-12 rounded-full bg-sage/5 border-2 border-dashed border-sage/15 flex items-center justify-center"><Headphones className="w-5 h-5 text-sage/25" /></div>}
                  <button onClick={() => voiceInputRef.current?.click()} disabled={isUploadingVoice} className="flex items-center gap-1.5 px-3 py-1.5 bg-sage/10 hover:bg-sage/20 text-sage text-xs font-medium rounded-xl transition-colors disabled:opacity-50">
                    {isUploadingVoice ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading</> : <><Upload className="w-3 h-3" /> {creatorVoiceUrl ? 'Change' : 'Voice'}</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Competitors / Inspiration */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h3 className="text-xs font-semibold text-sage/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> Competitors / Inspiration
              </h3>
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
                  <input type="text" value={newCompetitor} onChange={(e) => setNewCompetitor(e.target.value)} placeholder="@handle or URL..." className="flex-1 px-3 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none text-sm" onKeyDown={(e) => { if (e.key === 'Enter' && newCompetitor.trim()) { e.preventDefault(); setFormData({ ...formData, competitors: [...formData.competitors, newCompetitor.trim()] }); setNewCompetitor(''); } }} />
                  <button type="button" onClick={() => { if (newCompetitor.trim()) { setFormData({ ...formData, competitors: [...formData.competitors, newCompetitor.trim()] }); setNewCompetitor(''); } }} className="px-3 py-2 bg-sage/10 hover:bg-sage/20 text-sage rounded-xl transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
              )}
              {!isEditing && formData.competitors.length === 0 && <p className="text-sm text-sage/30 italic">No competitors added yet</p>}
            </div>

            {/* My Hot Topics */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <ReadableField label="My Hot Topics" icon={Newspaper} value={formData.hot_news} placeholder="Current topics and trends relevant to your audience..." rows={5} onChange={(v) => setFormData({ ...formData, hot_news: v })} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
