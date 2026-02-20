'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { User, Mail, Save, Loader2, Briefcase, Building2, Globe, Target, Sparkles, Package, Users, Newspaper, Plus, X, Camera, Headphones, Upload, Heart, Shield, Eye, MessageCircle, Lightbulb, Star } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    business_name: '',
    industries: [] as string[],
    bio: '',
    website_url: '',
    // Strategy fields
    persona: '',
    niche: '',
    positioning: '',
    offering: '',
    competitors: [] as string[],
    hot_news: '',
    target_audience: '',
    transformation: '',
    core_belief: '',
    opposition: '',
    tone: '',
    brand_words: [] as string[],
    content_boundaries: '',
    preferred_formats: [] as string[],
    vision_statement: '',
    offer_types: [] as string[],
    offer_price: '',
  });
  const [newCompetitor, setNewCompetitor] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [creatorFaceUrl, setCreatorFaceUrl] = useState<string | null>(null);
  const [creatorVoiceUrl, setCreatorVoiceUrl] = useState<string | null>(null);
  const [isUploadingFace, setIsUploadingFace] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const faceInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/auth/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        router.push('/auth/login');
        return;
      }

      setUser(profile);
      setCreatorFaceUrl(profile.creator_face_url || null);
      setCreatorVoiceUrl(profile.creator_voice_url || null);
      const s = profile.metadata?.strategy || {};
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        business_name: profile.business_name || '',
        industries: profile.metadata?.industries || (profile.industry ? [profile.industry] : []),
        bio: profile.bio || '',
        website_url: profile.website_url || '',
        persona: s.persona || '',
        niche: s.niche || '',
        positioning: s.positioning || '',
        offering: s.offering || '',
        competitors: s.competitors || profile.metadata?.competitors || [],
        hot_news: s.hot_news || '',
        target_audience: s.target_audience || '',
        transformation: s.transformation || '',
        core_belief: s.core_belief || '',
        opposition: s.opposition || '',
        tone: s.tone || '',
        brand_words: s.brand_words || [],
        content_boundaries: s.content_boundaries || '',
        preferred_formats: s.preferred_formats || [],
        vision_statement: s.vision_statement || '',
        offer_types: s.offer_types || [],
        offer_price: s.offer_price || '',
      });
    } catch (error) {
      console.error('Failed to load user:', error);
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

      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          business_name: formData.business_name || null,
          industry: formData.industries[0] || null,
          bio: formData.bio || null,
          website_url: formData.website_url || null,
          metadata: {
            ...(user.metadata || {}),
            industries: formData.industries,
            strategy: {
              persona: formData.persona || null,
              niche: formData.niche || null,
              positioning: formData.positioning || null,
              offering: formData.offering || null,
              competitors: formData.competitors,
              hot_news: formData.hot_news || null,
              target_audience: formData.target_audience || null,
              transformation: formData.transformation || null,
              core_belief: formData.core_belief || null,
              opposition: formData.opposition || null,
              tone: formData.tone || null,
              brand_words: formData.brand_words,
              content_boundaries: formData.content_boundaries || null,
              preferred_formats: formData.preferred_formats,
              vision_statement: formData.vision_statement || null,
              offer_types: formData.offer_types,
              offer_price: formData.offer_price || null,
            },
          },
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      await loadUser();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const s = user.metadata?.strategy || {};
    setFormData({
      name: user.name || '',
      email: user.email || '',
      business_name: user.business_name || '',
      industries: user.metadata?.industries || (user.industry ? [user.industry] : []),
      bio: user.bio || '',
      website_url: user.website_url || '',
      persona: s.persona || '',
      niche: s.niche || '',
      positioning: s.positioning || '',
      offering: s.offering || '',
      competitors: s.competitors || user.metadata?.competitors || [],
      hot_news: s.hot_news || '',
      target_audience: s.target_audience || '',
      transformation: s.transformation || '',
      core_belief: s.core_belief || '',
      opposition: s.opposition || '',
      tone: s.tone || '',
      brand_words: s.brand_words || [],
      content_boundaries: s.content_boundaries || '',
      preferred_formats: s.preferred_formats || [],
      vision_statement: s.vision_statement || '',
      offer_types: s.offer_types || [],
      offer_price: s.offer_price || '',
    });
    setNewCompetitor('');
    setNewIndustry('');
    setIsEditing(false);
    setMessage(null);
  };

  const handleCreatorAssetUpload = async (type: 'face' | 'voice', file: File) => {
    const setUploading = type === 'face' ? setIsUploadingFace : setIsUploadingVoice;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || (type === 'face' ? 'jpg' : 'mp3');
      const filePath = `${user.id}/${type}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('creator-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('creator-assets')
        .getPublicUrl(filePath);

      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      const column = type === 'face' ? 'creator_face_url' : 'creator_voice_url';
      const { error: updateError } = await supabase
        .from('users')
        .update({ [column]: urlWithCacheBust })
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (type === 'face') setCreatorFaceUrl(urlWithCacheBust);
      else setCreatorVoiceUrl(urlWithCacheBust);

      setMessage({ type: 'success', text: `Creator ${type} updated successfully!` });
    } catch (error: any) {
      console.error(`Failed to upload creator ${type}:`, error);
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

  const inputClass = "w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:py-1";
  const textareaClass = `${inputClass} resize-none`;

  // Read-only text display vs editable input
  const ReadableField = ({ label, icon: Icon, value, placeholder, type = 'text', rows, onChange }: {
    label: string; icon: any; value: string; placeholder: string; type?: string; rows?: number;
    onChange: (val: string) => void;
  }) => (
    <div>
      <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-2">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      {isEditing ? (
        rows ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={textareaClass} />
        ) : (
          <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
        )
      ) : (
        <p className={`text-sage leading-relaxed ${!value ? 'text-sage/30 italic text-sm' : ''}`}>
          {value || placeholder}
        </p>
      )}
    </div>
  );

  const TagList = ({ items, color = 'sage' }: { items: string[]; color?: string }) => (
    <div className="flex flex-wrap gap-2">
      {items.length > 0 ? items.map((item, idx) => (
        <span key={idx} className={`px-3 py-1.5 ${color === 'rose' ? 'bg-dusty-rose/10 text-dusty-rose' : 'bg-sage/10 text-sage'} text-sm font-medium rounded-full`}>
          {item}
        </span>
      )) : (
        <span className="text-sm text-sage/30 italic">Not set</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-serif text-4xl text-sage mb-2">My Profile</h1>
            <p className="text-sage/60">Manage your account and brand strategy</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button onClick={handleCancel} disabled={isSaving} className="px-6 py-2.5 border border-sage/20 hover:border-sage/40 text-sage font-medium rounded-2xl transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={isSaving || !formData.name.trim() || formData.industries.length === 0} className="flex items-center gap-2 px-6 py-2.5 bg-sage hover:bg-sage/90 text-cream font-medium rounded-2xl transition-colors disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-sage hover:bg-sage/90 text-cream font-medium rounded-2xl transition-colors">
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className={`rounded-2xl px-4 py-3 mb-6 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message.text}</p>
          </div>
        )}

        {/* Top Row: Profile Summary + Creator Assets */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-soft p-6 flex items-center gap-5">
            <div className="w-20 h-20 bg-dusty-rose rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-serif text-3xl">{formData.name.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-2xl text-sage truncate">{formData.name || 'User'}</h2>
              <p className="text-sage/50 text-sm truncate">{formData.email}</p>
              {formData.niche && (
                <span className="inline-block mt-2 px-3 py-1 bg-dusty-rose/10 text-dusty-rose text-xs font-medium rounded-full">
                  {formData.niche}
                </span>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <h3 className="text-xs font-semibold text-sage/50 uppercase tracking-wider mb-3">Account</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-sage/50">Since</span><span className="text-sage font-medium">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span></div>
              <div className="flex justify-between"><span className="text-sage/50">Plan</span><span className="text-sage font-medium capitalize">{user.subscription_tier || 'Free'}</span></div>
            </div>
          </div>

          {/* Creator Assets */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-soft p-6">
            <h3 className="text-xs font-semibold text-sage/50 uppercase tracking-wider mb-3 flex items-center gap-2"><Camera className="w-3.5 h-3.5" /> Creator Assets</h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                {creatorFaceUrl ? (
                  <img src={creatorFaceUrl} alt="Face" className="w-12 h-12 rounded-full object-cover border-2 border-sage/10" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-sage/5 border-2 border-dashed border-sage/15 flex items-center justify-center">
                    <User className="w-5 h-5 text-sage/25" />
                  </div>
                )}
                <button onClick={() => faceInputRef.current?.click()} disabled={isUploadingFace} className="flex items-center gap-1.5 px-3 py-1.5 bg-sage/10 hover:bg-sage/20 text-sage text-xs font-medium rounded-xl transition-colors disabled:opacity-50">
                  {isUploadingFace ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading</> : <><Upload className="w-3 h-3" /> {creatorFaceUrl ? 'Change' : 'Upload Face'}</>}
                </button>
                <input ref={faceInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleCreatorAssetUpload('face', file); e.target.value = ''; }} />
              </div>
              <div className="flex items-center gap-3">
                {creatorVoiceUrl ? (
                  <div className="w-12 h-12 rounded-full bg-dusty-rose/10 border-2 border-dusty-rose/20 flex items-center justify-center"><Headphones className="w-5 h-5 text-dusty-rose" /></div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-sage/5 border-2 border-dashed border-sage/15 flex items-center justify-center"><Headphones className="w-5 h-5 text-sage/25" /></div>
                )}
                <button onClick={() => voiceInputRef.current?.click()} disabled={isUploadingVoice} className="flex items-center gap-1.5 px-3 py-1.5 bg-sage/10 hover:bg-sage/20 text-sage text-xs font-medium rounded-xl transition-colors disabled:opacity-50">
                  {isUploadingVoice ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading</> : <><Upload className="w-3 h-3" /> {creatorVoiceUrl ? 'Change' : 'Upload Voice'}</>}
                </button>
                <input ref={voiceInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleCreatorAssetUpload('voice', file); e.target.value = ''; }} />
              </div>
            </div>
          </div>
        </div>

        {/* General Info */}
        <div className="bg-white rounded-3xl shadow-soft p-8 mb-6">
          <h3 className="font-serif text-xl text-sage mb-6">General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReadableField label="Full Name" icon={User} value={formData.name} placeholder="Your name" onChange={(v) => setFormData({ ...formData, name: v })} />
            <ReadableField label="Business Name" icon={Building2} value={formData.business_name} placeholder="Your brand name" onChange={(v) => setFormData({ ...formData, business_name: v })} />
            <ReadableField label="Website" icon={Globe} value={formData.website_url} placeholder="https://..." type="url" onChange={(v) => setFormData({ ...formData, website_url: v })} />

            {/* Industries — multi-tag, required */}
            <div className={`md:col-span-3 rounded-2xl p-4 transition-colors ${formData.industries.length === 0 ? 'bg-red-50 border border-red-200' : 'bg-transparent'}`}>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1">
                <Briefcase className={`w-3.5 h-3.5 ${formData.industries.length === 0 ? 'text-red-500' : 'text-sage/50'}`} />
                <span className={formData.industries.length === 0 ? 'text-red-600' : 'text-sage/50'}>Industries</span>
                <span className="text-red-500 font-bold">*</span>
                {formData.industries.length === 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-semibold rounded-full uppercase tracking-wide">
                    Required — enables trend scraping
                  </span>
                )}
              </label>

              {formData.industries.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 mt-2">
                  {formData.industries.map((ind, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-dusty-rose/10 text-dusty-rose text-sm font-medium rounded-full">
                      {ind}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, industries: formData.industries.filter((_, i) => i !== idx) })}
                          className="text-dusty-rose/50 hover:text-dusty-rose transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {isEditing ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    placeholder="e.g. Wellness, Nutrition, Fitness..."
                    className={`flex-1 px-3 py-2 rounded-xl border focus:outline-none text-sm transition-colors ${
                      formData.industries.length === 0
                        ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-white'
                        : 'border-sage/20 focus:border-sage'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newIndustry.trim()) {
                        e.preventDefault();
                        setFormData({ ...formData, industries: [...formData.industries, newIndustry.trim()] });
                        setNewIndustry('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newIndustry.trim()) {
                        setFormData({ ...formData, industries: [...formData.industries, newIndustry.trim()] });
                        setNewIndustry('');
                      }
                    }}
                    className="px-3 py-2 bg-sage/10 hover:bg-sage/20 text-sage rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : formData.industries.length === 0 ? (
                <p className="text-red-400 italic text-sm mt-1">
                  Add at least one industry to unlock trend scraping in your dashboard
                </p>
              ) : null}
            </div>

            <div className="md:col-span-3">
              <ReadableField label="Bio" icon={User} value={formData.bio} placeholder="Tell us about yourself..." rows={2} onChange={(v) => setFormData({ ...formData, bio: v })} />
            </div>
          </div>
        </div>

        {/* Strategy Profile — 2 column readable layout */}
        <div className="bg-white rounded-3xl shadow-soft p-8 mb-6">
          <div className="mb-8">
            <h3 className="font-serif text-2xl text-sage">Strategy Profile</h3>
            <p className="text-sage/50 mt-1">AI-generated from your onboarding answers</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            <ReadableField label="Persona" icon={Sparkles} value={formData.persona} placeholder="Your creator persona..." rows={3} onChange={(v) => setFormData({ ...formData, persona: v })} />
            <ReadableField label="Positioning" icon={Target} value={formData.positioning} placeholder="Your unique angle..." rows={3} onChange={(v) => setFormData({ ...formData, positioning: v })} />
            <ReadableField label="Niche" icon={Target} value={formData.niche} placeholder="Your niche..." onChange={(v) => setFormData({ ...formData, niche: v })} />
            <ReadableField label="Offering" icon={Package} value={formData.offering} placeholder="Your core offer..." rows={2} onChange={(v) => setFormData({ ...formData, offering: v })} />
          </div>
        </div>

        {/* Audience & Transformation */}
        <div className="bg-white rounded-3xl shadow-soft p-8 mb-6">
          <div className="mb-8">
            <h3 className="font-serif text-2xl text-sage">Audience & Transformation</h3>
            <p className="text-sage/50 mt-1">Who you serve and what you promise</p>
          </div>

          <div className="space-y-8">
            <ReadableField label="Target Audience" icon={Users} value={formData.target_audience} placeholder="Who is your ideal client?" rows={3} onChange={(v) => setFormData({ ...formData, target_audience: v })} />
            <ReadableField label="Transformation Promise" icon={Star} value={formData.transformation} placeholder="The before → after you deliver..." rows={2} onChange={(v) => setFormData({ ...formData, transformation: v })} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              <ReadableField label="Core Belief" icon={Heart} value={formData.core_belief} placeholder="Your strongest conviction..." rows={2} onChange={(v) => setFormData({ ...formData, core_belief: v })} />
              <ReadableField label="What You Stand Against" icon={Shield} value={formData.opposition} placeholder="Industry norms you oppose..." rows={2} onChange={(v) => setFormData({ ...formData, opposition: v })} />
            </div>

            <ReadableField label="Vision Statement" icon={Lightbulb} value={formData.vision_statement} placeholder="Your mission in one powerful sentence..." rows={2} onChange={(v) => setFormData({ ...formData, vision_statement: v })} />
          </div>
        </div>

        {/* Content DNA */}
        <div className="bg-white rounded-3xl shadow-soft p-8 mb-6">
          <div className="mb-8">
            <h3 className="font-serif text-2xl text-sage">Content DNA</h3>
            <p className="text-sage/50 mt-1">Your brand voice and content style</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            <ReadableField label="Tone" icon={MessageCircle} value={formData.tone} placeholder="e.g., Expert, warm, provocative..." onChange={(v) => setFormData({ ...formData, tone: v })} />
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Brand Words
              </label>
              <TagList items={formData.brand_words} color="rose" />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-2">
                <Eye className="w-3.5 h-3.5" /> Preferred Formats
              </label>
              <TagList items={formData.preferred_formats} />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-sage/50 uppercase tracking-wider mb-2">
                <Package className="w-3.5 h-3.5" /> Offer Types
              </label>
              <TagList items={formData.offer_types} />
            </div>

            <ReadableField label="Content Boundaries" icon={Shield} value={formData.content_boundaries} placeholder="What you refuse to do..." rows={2} onChange={(v) => setFormData({ ...formData, content_boundaries: v })} />
            <ReadableField label="Price Point" icon={Briefcase} value={formData.offer_price} placeholder="e.g., $297 USD" onChange={(v) => setFormData({ ...formData, offer_price: v })} />
          </div>
        </div>

        {/* Competitors & Trends side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Competitors */}
          <div className="bg-white rounded-3xl shadow-soft p-8">
            <h3 className="text-xs font-semibold text-sage/50 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Competitors / Inspiration
            </h3>
            {formData.competitors.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.competitors.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-sage/5 rounded-xl text-sm text-sage">
                    <Globe className="w-3.5 h-3.5 text-sage/40 shrink-0" />
                    <span className="truncate flex-1">{link}</span>
                    {isEditing && (
                      <button type="button" onClick={() => setFormData({ ...formData, competitors: formData.competitors.filter((_, i) => i !== idx) })} className="text-sage/40 hover:text-red-500 transition-colors shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <input type="text" value={newCompetitor} onChange={(e) => setNewCompetitor(e.target.value)} placeholder="@handle or URL..."
                  className="flex-1 px-3 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none text-sm"
                  onKeyDown={(e) => { if (e.key === 'Enter' && newCompetitor.trim()) { e.preventDefault(); setFormData({ ...formData, competitors: [...formData.competitors, newCompetitor.trim()] }); setNewCompetitor(''); } }}
                />
                <button type="button" onClick={() => { if (newCompetitor.trim()) { setFormData({ ...formData, competitors: [...formData.competitors, newCompetitor.trim()] }); setNewCompetitor(''); } }} className="px-3 py-2 bg-sage/10 hover:bg-sage/20 text-sage rounded-xl transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
            {!isEditing && formData.competitors.length === 0 && (
              <p className="text-sm text-sage/30 italic">No competitors added yet</p>
            )}
          </div>

          {/* Hot Topics */}
          <div className="bg-white rounded-3xl shadow-soft p-8">
            <ReadableField label="Trends & Hot Topics" icon={Newspaper} value={formData.hot_news} placeholder="Current topics relevant to your audience..." rows={4} onChange={(v) => setFormData({ ...formData, hot_news: v })} />
          </div>
        </div>
      </div>
    </div>
  );
}
