'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { User, Mail, Save, Loader2, Briefcase, Building2, Globe, Target, Sparkles, Package, Users, Newspaper, Plus, X, Camera, Headphones, Upload } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    business_name: '',
    industry: '',
    bio: '',
    website_url: '',
    persona: '',
    niche: '',
    positioning: '',
    offering: '',
    competitors: [] as string[],
    hot_news: '',
  });
  const [newCompetitor, setNewCompetitor] = useState('');
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

      // Fetch user profile from users table
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
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        business_name: profile.business_name || '',
        industry: profile.industry || '',
        bio: profile.bio || '',
        website_url: profile.website_url || '',
        persona: profile.persona || '',
        niche: profile.niche || '',
        positioning: profile.positioning || '',
        offering: profile.offering || '',
        competitors: profile.competitors || [],
        hot_news: profile.hot_news || '',
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
          industry: formData.industry || null,
          bio: formData.bio || null,
          website_url: formData.website_url || null,
          persona: formData.persona || null,
          niche: formData.niche || null,
          positioning: formData.positioning || null,
          offering: formData.offering || null,
          competitors: formData.competitors,
          hot_news: formData.hot_news || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);

      // Reload user data
      await loadUser();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      business_name: user.business_name || '',
      industry: user.industry || '',
      bio: user.bio || '',
      website_url: user.website_url || '',
      persona: user.persona || '',
      niche: user.niche || '',
      positioning: user.positioning || '',
      offering: user.offering || '',
      competitors: user.competitors || [],
      hot_news: user.hot_news || '',
    });
    setNewCompetitor('');
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

      console.log('Uploading to:', filePath, 'File size:', file.size, 'Type:', file.type);

      // List buckets to debug
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      console.log('Available buckets:', buckets, 'Error:', bucketsError);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('creator-assets')
        .upload(filePath, file, { upsert: true });

      console.log('Upload result:', uploadData, 'Error:', uploadError);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('creator-assets')
        .getPublicUrl(filePath);

      // Add cache-busting param
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

  const inputClass = "w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all disabled:bg-sage/5 disabled:cursor-not-allowed";
  const textareaClass = `${inputClass} resize-none`;

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header with actions */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl text-sage mb-2">My Profile</h1>
            <p className="text-sage/70">Manage your account and strategy</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-2.5 border border-sage/20 hover:border-sage/40 text-sage font-medium rounded-2xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !formData.name.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-sage hover:bg-sage/90 text-cream font-medium rounded-2xl transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-sage hover:bg-sage/90 text-cream font-medium rounded-2xl transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`rounded-2xl px-4 py-3 mb-6 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar Card */}
            <div className="bg-white rounded-3xl shadow-soft p-6 text-center">
              <div className="w-24 h-24 bg-dusty-rose rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-serif text-4xl">
                  {formData.name.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <h2 className="font-serif text-2xl text-sage">{formData.name || 'User'}</h2>
              <p className="text-sage/60 text-sm mt-1">{formData.email}</p>
              {formData.niche && (
                <span className="inline-block mt-3 px-3 py-1 bg-dusty-rose/10 text-dusty-rose text-xs font-medium rounded-full">
                  {formData.niche}
                </span>
              )}
            </div>

            {/* Account Info Card */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h3 className="font-medium text-sage mb-4 text-sm uppercase tracking-wide">Account</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-sage/60">Member since</span>
                  <span className="text-sage font-medium">
                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sage/60">Subscription</span>
                  <span className="text-sage font-medium capitalize">{user.subscription_tier || 'Free'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sage/60">Account ID</span>
                  <span className="text-sage font-mono text-xs">{user.id.slice(0, 8)}...</span>
                </div>
              </div>
            </div>

            {/* Creator Assets Card */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h3 className="font-medium text-sage mb-4 text-sm uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Creator Assets
                </div>
              </h3>
              <p className="text-xs text-sage/50 mb-4">Upload your face and voice to quickly use them in content workflows</p>

              <div className="space-y-4">
                {/* Face Upload */}
                <div>
                  <label className="text-xs font-medium text-sage/70 mb-2 block">My Face</label>
                  <div className="flex items-center gap-3">
                    {creatorFaceUrl ? (
                      <img src={creatorFaceUrl} alt="Creator face" className="w-16 h-16 rounded-full object-cover border-2 border-sage/10" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-sage/5 border-2 border-dashed border-sage/15 flex items-center justify-center">
                        <User className="w-6 h-6 text-sage/25" />
                      </div>
                    )}
                    <div className="flex-1">
                      <button
                        onClick={() => faceInputRef.current?.click()}
                        disabled={isUploadingFace}
                        className="flex items-center gap-2 px-3 py-2 bg-sage/10 hover:bg-sage/20 text-sage text-sm font-medium rounded-xl transition-colors disabled:opacity-50 w-full justify-center"
                      >
                        {isUploadingFace ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                        ) : (
                          <><Upload className="w-3.5 h-3.5" /> {creatorFaceUrl ? 'Change Photo' : 'Upload Photo'}</>
                        )}
                      </button>
                      <input
                        ref={faceInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCreatorAssetUpload('face', file);
                          e.target.value = '';
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Voice Upload */}
                <div>
                  <label className="text-xs font-medium text-sage/70 mb-2 block">My Voice</label>
                  <div className="flex items-center gap-3">
                    {creatorVoiceUrl ? (
                      <div className="w-16 h-16 rounded-full bg-dusty-rose/10 border-2 border-dusty-rose/20 flex items-center justify-center flex-shrink-0">
                        <Headphones className="w-6 h-6 text-dusty-rose" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-sage/5 border-2 border-dashed border-sage/15 flex items-center justify-center flex-shrink-0">
                        <Headphones className="w-6 h-6 text-sage/25" />
                      </div>
                    )}
                    <div className="flex-1 space-y-1.5">
                      {creatorVoiceUrl && (
                        <audio src={creatorVoiceUrl} controls className="w-full h-8 [&::-webkit-media-controls-panel]:bg-sage/5 [&::-webkit-media-controls-panel]:rounded-lg" />
                      )}
                      <button
                        onClick={() => voiceInputRef.current?.click()}
                        disabled={isUploadingVoice}
                        className="flex items-center gap-2 px-3 py-2 bg-sage/10 hover:bg-sage/20 text-sage text-sm font-medium rounded-xl transition-colors disabled:opacity-50 w-full justify-center"
                      >
                        {isUploadingVoice ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                        ) : (
                          <><Upload className="w-3.5 h-3.5" /> {creatorVoiceUrl ? 'Change Voice' : 'Upload Voice'}</>
                        )}
                      </button>
                      <input
                        ref={voiceInputRef}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCreatorAssetUpload('voice', file);
                          e.target.value = '';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Competitors Card */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h3 className="font-medium text-sage mb-4 text-sm uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Concurrents
                </div>
              </h3>
              {formData.competitors.length > 0 && (
                <div className="space-y-2 mb-3">
                  {formData.competitors.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-sage/5 rounded-xl text-sm text-sage">
                      <Globe className="w-3.5 h-3.5 text-sage/40 shrink-0" />
                      <span className="truncate flex-1">{link}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.competitors.filter((_, i) => i !== idx);
                            setFormData({ ...formData, competitors: updated });
                          }}
                          className="text-sage/40 hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newCompetitor}
                    onChange={(e) => setNewCompetitor(e.target.value)}
                    placeholder="instagram.com/..."
                    className="flex-1 px-3 py-2 rounded-xl border border-sage/20 focus:border-sage focus:outline-none text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCompetitor.trim()) {
                        e.preventDefault();
                        setFormData({ ...formData, competitors: [...formData.competitors, newCompetitor.trim()] });
                        setNewCompetitor('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCompetitor.trim()) {
                        setFormData({ ...formData, competitors: [...formData.competitors, newCompetitor.trim()] });
                        setNewCompetitor('');
                      }
                    }}
                    className="px-3 py-2 bg-sage/10 hover:bg-sage/20 text-sage rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
              {!isEditing && formData.competitors.length === 0 && (
                <p className="text-sm text-sage/40 italic">No competitors added yet</p>
              )}
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info Card */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h3 className="font-serif text-xl text-sage mb-5">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-sage mb-2">
                    <div className="flex items-center gap-2"><User className="w-4 h-4" /> Full Name <span className="text-red-500">*</span></div>
                  </label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!isEditing} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage mb-2">
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</div>
                  </label>
                  <input type="email" value={formData.email} disabled className={`${inputClass} bg-sage/5 cursor-not-allowed`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage mb-2">
                    <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Business Name</div>
                  </label>
                  <input type="text" value={formData.business_name} onChange={(e) => setFormData({ ...formData, business_name: e.target.value })} disabled={!isEditing} placeholder="e.g., Fertile Ground Wellness" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage mb-2">
                    <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Industry</div>
                  </label>
                  <select value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} disabled={!isEditing} className={inputClass}>
                    <option value="">Select industry...</option>
                    <option value="fertility">Fertility</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="wellness">Wellness</option>
                    <option value="fitness">Fitness</option>
                    <option value="mentalhealth">Mental Health</option>
                    <option value="motherhood">Motherhood</option>
                    <option value="beauty">Beauty</option>
                    <option value="health">Health</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-sage mb-2">
                    <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> Website URL</div>
                  </label>
                  <input type="url" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} disabled={!isEditing} placeholder="https://yourwebsite.com" className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-sage mb-2">Bio</label>
                  <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} disabled={!isEditing} placeholder="Tell us about yourself and your content goals..." rows={3} className={textareaClass} />
                </div>
              </div>
            </div>

            {/* Strategy Card */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <div className="mb-5">
                <h3 className="font-serif text-xl text-sage">Strategy Profile</h3>
                <p className="text-sm text-sage/50 mt-1">Helps the AI understand your brand for better content</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-sage mb-2">
                    <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Persona</div>
                  </label>
                  <textarea value={formData.persona} onChange={(e) => setFormData({ ...formData, persona: e.target.value })} disabled={!isEditing} placeholder="Your creator persona..." rows={4} className={textareaClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage mb-2">
                    <div className="flex items-center gap-2"><Package className="w-4 h-4" /> Offering</div>
                  </label>
                  <textarea value={formData.offering} onChange={(e) => setFormData({ ...formData, offering: e.target.value })} disabled={!isEditing} placeholder="Products, services, programs..." rows={4} className={textareaClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage mb-2">
                    <div className="flex items-center gap-2"><Target className="w-4 h-4" /> Niche</div>
                  </label>
                  <input type="text" value={formData.niche} onChange={(e) => setFormData({ ...formData, niche: e.target.value })} disabled={!isEditing} placeholder="e.g., Natural fertility & hormonal health" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage mb-2">
                    <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Positionnement</div>
                  </label>
                  <input type="text" value={formData.positioning} onChange={(e) => setFormData({ ...formData, positioning: e.target.value })} disabled={!isEditing} placeholder="Your unique angle..." className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-sage mb-2">
                    <div className="flex items-center gap-2"><Newspaper className="w-4 h-4" /> Hot News</div>
                  </label>
                  <textarea value={formData.hot_news} onChange={(e) => setFormData({ ...formData, hot_news: e.target.value })} disabled={!isEditing} placeholder="Current hot topics, news, or trends relevant to your audience..." rows={3} className={textareaClass} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
