'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Instagram, Video, Youtube, CheckCircle2, XCircle, Loader2, Link2, ExternalLink } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  icon: React.ElementType;
  gradient: string;
  description: string;
  comingSoon?: boolean;
}

const PLATFORMS: Platform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    gradient: 'from-purple-500 to-pink-500',
    description: 'Connect your Instagram account to enable niche trend scraping tailored to your content.',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Video,
    gradient: 'from-black to-gray-700',
    description: 'Sync your TikTok profile for cross-platform trend analysis.',
    comingSoon: true,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    gradient: 'from-red-500 to-red-700',
    description: 'Link your YouTube channel to analyze long-form content performance.',
    comingSoon: true,
  },
];

export default function IntegrationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [instagramUsername, setInstagramUsername] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const supabase = createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) { router.push('/auth/login'); return; }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!profile) { router.push('/auth/login'); return; }

      setUser(profile);
      setInstagramUsername(profile.instagram_username || '');
      setInputValue(profile.instagram_username || '');
    } catch {
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    const username = inputValue.replace('@', '').trim();
    if (!username) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update({ instagram_username: username })
        .eq('id', user.id);
      if (error) throw error;
      setInstagramUsername(username);
      setMessage({ type: 'success', text: `@${username} connected successfully!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to connect Instagram' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update({ instagram_username: null })
        .eq('id', user.id);
      if (error) throw error;
      setInstagramUsername('');
      setInputValue('');
      setMessage({ type: 'success', text: 'Instagram disconnected.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to disconnect' });
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-sage rounded-2xl flex items-center justify-center">
              <Link2 className="w-4 h-4 text-cream" />
            </div>
            <h1 className="font-serif text-4xl text-sage">Integrations</h1>
          </div>
          <p className="text-sage/50 ml-12">
            Connect your social platforms to unlock trend scraping and cross-platform analytics.
          </p>
        </div>

        {message && (
          <div
            className={`rounded-2xl px-4 py-3 mb-6 ${
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

        {/* Platform cards */}
        <div className="space-y-4">
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            const isInstagram = platform.id === 'instagram';
            const isConnected = isInstagram && !!instagramUsername;

            return (
              <div
                key={platform.id}
                className={`bg-white rounded-3xl border p-6 transition-all ${
                  platform.comingSoon
                    ? 'border-warm-border opacity-60'
                    : 'border-warm-border shadow-soft'
                }`}
              >
                <div className="flex items-start gap-5">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-semibold text-sage text-lg">{platform.name}</h2>
                      {platform.comingSoon ? (
                        <span className="px-2.5 py-0.5 bg-sage/10 text-sage/50 text-xs font-medium rounded-full">
                          Coming soon
                        </span>
                      ) : isConnected ? (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 bg-sage/5 text-sage/40 text-xs font-medium rounded-full">
                          <XCircle className="w-3 h-3" />
                          Not connected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-sage/50 mb-4">{platform.description}</p>

                    {/* Instagram connection UI */}
                    {isInstagram && (
                      <>
                        {isConnected ? (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-sage/5 rounded-2xl flex-1">
                              <Instagram className="w-4 h-4 text-sage/40" />
                              <span className="text-sm font-medium text-sage">@{instagramUsername}</span>
                            </div>
                            <a
                              href={`https://instagram.com/${instagramUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-sage/40 hover:text-sage transition-colors"
                              title="View on Instagram"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={handleDisconnect}
                              disabled={isDisconnecting}
                              className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-60"
                            >
                              {isDisconnecting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 flex-1 border border-warm-border rounded-2xl px-4 py-2.5 focus-within:border-sage/40 transition-colors bg-white">
                              <span className="text-sage/40 text-sm">@</span>
                              <input
                                type="text"
                                value={inputValue.replace('@', '')}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                                placeholder="your_instagram_handle"
                                className="flex-1 bg-transparent text-sm text-sage placeholder:text-sage/30 focus:outline-none"
                              />
                            </div>
                            <button
                              onClick={handleConnect}
                              disabled={isSaving || !inputValue.trim()}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                            >
                              {isSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Instagram className="w-3.5 h-3.5" />
                              )}
                              Connect
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
