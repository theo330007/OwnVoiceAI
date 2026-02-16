'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Video,
  RefreshCw,
  TrendingUp,
  Hash,
  Clock,
  Sparkles,
  ExternalLink,
  Link2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  userId: string;
  tiktokUsername: string | null;
  tiktokConnectedAt: string | null;
  tiktokLastSynced: string | null;
}

// Mock TikTok data - always shown
const MOCK_TIKTOK_INSIGHTS = [
  {
    id: 'theme-1',
    type: 'content_theme',
    title: 'Quick Health Tips',
    description: '5 videos • 35% of your content',
    frequency: 5,
  },
  {
    id: 'theme-2',
    type: 'content_theme',
    title: 'Recipe Content',
    description: '4 videos • 30% of your content',
    frequency: 4,
  },
  {
    id: 'theme-3',
    type: 'content_theme',
    title: 'Day in the Life',
    description: '3 videos • 20% of your content',
    frequency: 3,
  },
  {
    id: 'hashtag-1',
    type: 'hashtag',
    title: '#fyp',
    value: 'fyp',
    frequency: 12,
  },
  {
    id: 'hashtag-2',
    type: 'hashtag',
    title: '#wellness',
    value: 'wellness',
    frequency: 9,
  },
  {
    id: 'hashtag-3',
    type: 'hashtag',
    title: '#healthtok',
    value: 'healthtok',
    frequency: 8,
  },
  {
    id: 'time-1',
    type: 'best_time',
    title: 'Best Time: 19:00',
    description: 'Evening scrollers - prime TikTok time',
    value: '19',
  },
];

const MOCK_TIKTOK_VIDEOS = [
  {
    id: 'video-1',
    caption: 'POV: You finally fixed your gut health 🌿',
    views: 245000,
    likes: 18900,
    comments: 432,
    shares: 1240,
    engagement_rate: 8.4,
    permalink: 'https://www.tiktok.com/@mock/video/1',
  },
  {
    id: 'video-2',
    caption: 'What I eat in a day for hormone balance',
    views: 189000,
    likes: 12300,
    comments: 287,
    shares: 890,
    engagement_rate: 7.2,
    permalink: 'https://www.tiktok.com/@mock/video/2',
  },
  {
    id: 'video-3',
    caption: '3 supplements that changed my life',
    views: 312000,
    likes: 24500,
    comments: 678,
    shares: 1820,
    engagement_rate: 8.7,
    permalink: 'https://www.tiktok.com/@mock/video/3',
  },
];

// Detailed explanations
const INSIGHT_EXPLANATIONS: Record<string, { title: string; why: string; tips: string[] }> = {
  'Quick Health Tips': {
    title: 'Why Quick Tips Dominate TikTok',
    why: 'Fast-paced, actionable health tips perform exceptionally well on TikTok because they match the platform\'s quick-scroll nature. Users save these for later reference, boosting your reach exponentially.',
    tips: [
      'Hook viewers in the first 0.5 seconds - TikTok attention spans are instant',
      'Use text overlays with numbered lists (1, 2, 3) for easy following',
      'End with a question or CTA to drive comments and engagement',
      'Repurpose top-performing tips into series for consistent content',
    ],
  },
  'Recipe Content': {
    title: 'Why Recipe Videos Get Millions of Views',
    why: 'Recipe content is highly shareable and gets saved repeatedly. TikTok\'s algorithm loves videos that get watched multiple times, making recipes perfect for virality.',
    tips: [
      'Show the final result in the first frame to hook viewers',
      'Use fast cuts and trending audio to maintain pace',
      'Include ingredient measurements in text overlays',
      'Post recipe carousels to increase watch time',
    ],
  },
  'Day in the Life': {
    title: 'Why DITL Content Builds Community',
    why: 'Day in the Life content creates parasocial relationships and authenticity. Viewers feel connected to your routine, building loyal followers who engage with all your content.',
    tips: [
      'Show morning/evening routines - highly relatable timeframes',
      'Include wellness habits throughout the day',
      'Use voiceover to explain your choices and build authority',
      'Keep it real - authenticity beats perfection on TikTok',
    ],
  },
};

export function TikTokInsightsPanel({
  userId,
  tiktokUsername,
  tiktokConnectedAt,
  tiktokLastSynced,
}: Props) {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [username, setUsername] = useState('');
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsConnecting(true);
    // Simulate connection
    setTimeout(() => {
      setShowConnectForm(false);
      setUsername('');
      setIsConnecting(false);
      router.refresh();
    }, 1000);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      router.refresh();
    }, 1000);
  };

  const handleDisconnect = () => {
    if (!confirm('Are you sure you want to disconnect your TikTok account?')) {
      return;
    }
    router.refresh();
  };

  // Not connected state
  if (!tiktokUsername) {
    return (
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl shadow-soft p-8 border-2 border-cyan-400">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-pink-500 rounded-2xl flex items-center justify-center">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-white">TikTok Insights</h2>
              <p className="text-gray-400 text-sm">Analyze your video performance</p>
            </div>
          </div>
        </div>

        {!showConnectForm ? (
          <div className="text-center py-8">
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Connect your TikTok account to get insights about your videos, discover what goes viral, and understand your audience engagement patterns.
            </p>
            <Button
              onClick={() => setShowConnectForm(true)}
              className="bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white rounded-2xl px-8 py-3"
            >
              <Link2 className="w-5 h-5 mr-2" />
              Connect TikTok Account
            </Button>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="max-w-md mx-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                TikTok Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@yourusername"
                className="w-full px-4 py-3 rounded-xl border border-cyan-400/20 bg-gray-800 text-white focus:border-cyan-400 focus:outline-none"
                required
              />
              <p className="text-xs text-gray-400 mt-2">
                Enter your public TikTok username
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isConnecting}
                className="flex-1 bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white rounded-xl"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowConnectForm(false);
                  setUsername('');
                }}
                variant="outline"
                className="rounded-xl border-2 border-gray-600 hover:border-cyan-400 text-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    );
  }

  // Connected state
  const contentThemes = MOCK_TIKTOK_INSIGHTS.filter((i) => i.type === 'content_theme');
  const topHashtags = MOCK_TIKTOK_INSIGHTS.filter((i) => i.type === 'hashtag');
  const bestPostingTime = MOCK_TIKTOK_INSIGHTS.find((i) => i.type === 'best_time');

  return (
    <Card className="bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl shadow-soft p-6 border-2 border-cyan-400">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-pink-500 rounded-2xl flex items-center justify-center">
            <Video className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-white">TikTok Insights</h2>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 text-sm">@{tiktokUsername}</p>
              {tiktokLastSynced && (
                <span className="text-xs text-gray-500">
                  • Last synced {new Date(tiktokLastSynced).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-800"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="ghost"
            size="sm"
            className="text-cyan-400 hover:bg-gray-800"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={handleDisconnect}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <>
      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Content Themes */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-cyan-400/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-white text-sm">Content Themes</h3>
          </div>
          <div className="space-y-2">
            {contentThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setExpandedInsight(expandedInsight === theme.id ? null : theme.id)}
                className="w-full text-left text-sm hover:bg-gray-700 p-2 rounded-lg transition-colors"
              >
                <p className="font-medium text-white">{theme.title}</p>
                <p className="text-xs text-gray-400">{theme.frequency} videos</p>
              </button>
            ))}
          </div>
        </div>

        {/* Top Hashtags */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-cyan-400/30">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-white text-sm">Top Hashtags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {topHashtags.map((hashtag) => (
              <span
                key={hashtag.id}
                className="px-2 py-1 bg-cyan-400/20 text-cyan-300 text-xs rounded-full border border-cyan-400/30"
              >
                #{hashtag.value} ({hashtag.frequency})
              </span>
            ))}
          </div>
        </div>

        {/* Best Posting Time */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-cyan-400/30">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-white text-sm">Best Time</h3>
          </div>
          {bestPostingTime && (
            <div>
              <p className="text-2xl font-bold text-white">{bestPostingTime.value}:00</p>
              <p className="text-xs text-gray-400 mt-1">{bestPostingTime.description}</p>
            </div>
          )}
        </div>

        {/* Top Videos */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-cyan-400/30">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-white text-sm">Top Videos</h3>
          </div>
          <div className="space-y-2">
            {MOCK_TIKTOK_VIDEOS.slice(0, 2).map((video) => (
              <a
                key={video.id}
                href={video.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-300 hover:text-cyan-400 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  <span>{(video.views / 1000).toFixed(0)}K views</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Insight Detail */}
      {expandedInsight && INSIGHT_EXPLANATIONS[contentThemes.find(t => t.id === expandedInsight)?.title || ''] && (
        <div className="mb-6 bg-gray-800 rounded-2xl p-6 border-2 border-cyan-400/50 animate-in slide-in-from-top">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="font-serif text-xl text-white">
                {INSIGHT_EXPLANATIONS[contentThemes.find(t => t.id === expandedInsight)?.title || ''].title}
              </h3>
            </div>
            <button
              onClick={() => setExpandedInsight(null)}
              className="text-gray-400 hover:text-white"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-300 mb-4 leading-relaxed">
            {INSIGHT_EXPLANATIONS[contentThemes.find(t => t.id === expandedInsight)?.title || ''].why}
          </p>

          <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-xl p-4">
            <p className="font-semibold text-white mb-3 text-sm">💡 Tips to Go Viral:</p>
            <ul className="space-y-2">
              {INSIGHT_EXPLANATIONS[contentThemes.find(t => t.id === expandedInsight)?.title || ''].tips.map((tip, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Why Your Best Videos Perform */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-cyan-400/30">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Why Your Best Videos Go Viral
        </h3>
        <div className="space-y-4">
          {MOCK_TIKTOK_VIDEOS.map((video, idx) => (
            <div key={video.id} className="p-4 bg-gray-900 rounded-xl border border-cyan-400/20">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-white">#{idx + 1} Top Video</p>
                <a
                  href={video.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">{video.caption}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                <span>👁️ {(video.views / 1000).toFixed(0)}K</span>
                <span>❤️ {(video.likes / 1000).toFixed(1)}K</span>
                <span>💬 {video.comments}</span>
                <span className="font-semibold text-cyan-400">{video.engagement_rate}% engaged</span>
              </div>
              <div className="bg-gray-950 rounded-lg p-3 border border-cyan-400/20">
                <p className="text-xs font-semibold text-gray-300 mb-2">Why it went viral:</p>
                <ul className="space-y-1 text-xs text-gray-400">
                  {video.engagement_rate > 8 && <li>• Hook in first 0.5s grabbed attention instantly</li>}
                  {video.shares > 1000 && <li>• Highly shareable format drove exponential reach</li>}
                  {video.comments > 400 && <li>• Sparked conversation and community engagement</li>}
                  <li>• Algorithm-friendly content with trending audio</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </Card>
  );
}
