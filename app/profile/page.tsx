'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { User, Mail, Save, Loader2, Briefcase, Building2, Globe } from 'lucide-react';

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
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        business_name: profile.business_name || '',
        industry: profile.industry || '',
        bio: profile.bio || '',
        website_url: profile.website_url || '',
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
    });
    setIsEditing(false);
    setMessage(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-sage mb-3">My Profile</h1>
          <p className="text-sage/70">Manage your account information and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-soft p-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-sage/10">
            <div className="w-20 h-20 bg-dusty-rose rounded-full flex items-center justify-center">
              <span className="text-white font-serif text-3xl">
                {formData.name.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className="font-serif text-2xl text-sage mb-1">{formData.name || 'User'}</h2>
              <p className="text-sage/60 text-sm">{formData.email}</p>
              {formData.industry && (
                <p className="text-dusty-rose text-sm font-medium mt-1 capitalize">{formData.industry}</p>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all disabled:bg-sage/5 disabled:cursor-not-allowed"
                required
              />
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 bg-sage/5 cursor-not-allowed"
              />
              <p className="text-xs text-sage/50 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Business Name
                </div>
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., Fertile Ground Wellness"
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all disabled:bg-sage/5 disabled:cursor-not-allowed"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Industry
                </div>
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all disabled:bg-sage/5 disabled:cursor-not-allowed"
              >
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
              {!formData.industry && !isEditing && (
                <p className="text-xs text-sage/50 mt-1">
                  Add your industry to enable personalized Instagram trend scraping
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                placeholder="Tell us about yourself and your content goals..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all disabled:bg-sage/5 disabled:cursor-not-allowed resize-none"
              />
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium text-sage mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website URL
                </div>
              </label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                disabled={!isEditing}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 rounded-2xl border border-sage/20 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all disabled:bg-sage/5 disabled:cursor-not-allowed"
              />
            </div>

            {/* Message */}
            {message && (
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <p
                  className={`text-sm ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !formData.name.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-sage hover:bg-sage/90 text-cream font-medium py-3 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1 border border-sage/20 hover:border-sage/40 text-sage font-medium py-3 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-sage hover:bg-sage/90 text-cream font-medium py-3 rounded-2xl transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-8 pt-8 border-t border-sage/10">
            <h3 className="font-medium text-sage mb-4">Account Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-sage/60">Member since</span>
                <span className="text-sage font-medium">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sage/60">Subscription</span>
                <span className="text-sage font-medium capitalize">
                  {user.subscription_tier || 'Free'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sage/60">Account ID</span>
                <span className="text-sage font-mono text-xs">
                  {user.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
