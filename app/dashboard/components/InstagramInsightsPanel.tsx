'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Instagram,
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
import {
  connectInstagramAccount,
  syncInstagramData,
  disconnectInstagramAccount,
  type InstagramInsight,
  type InstagramPost,
} from '@/app/actions/instagram';
import { useRouter } from 'next/navigation';

interface Props {
  userId: string;
  instagramUsername: string | null;
  instagramConnectedAt: string | null;
  instagramLastSynced: string | null;
  insights: InstagramInsight[];
  topPosts: InstagramPost[];
}

// Mock data fallback
const MOCK_INSIGHTS: InstagramInsight[] = [
  {
    id: 'theme-1',
    user_id: '',
    insight_type: 'content_theme',
    title: 'Gut Health',
    description: '3 posts • 30% of your content',
    value: 'gut, digestion, microbiome',
    metric_value: 3,
    frequency: 3,
    confidence_score: 0.9,
    generated_at: new Date().toISOString(),
  },
  {
    id: 'theme-2',
    user_id: '',
    insight_type: 'content_theme',
    title: 'Nutrition',
    description: '4 posts • 40% of your content',
    value: 'nutrition, food, recipe',
    metric_value: 4,
    frequency: 4,
    confidence_score: 0.85,
    generated_at: new Date().toISOString(),
  },
  {
    id: 'theme-3',
    user_id: '',
    insight_type: 'content_theme',
    title: 'Hormones',
    description: '2 posts • 20% of your content',
    value: 'hormone, hormonal, pcos',
    metric_value: 2,
    frequency: 2,
    confidence_score: 0.8,
    generated_at: new Date().toISOString(),
  },
  {
    id: 'hashtag-1',
    user_id: '',
    insight_type: 'top_hashtag',
    title: '#wellness',
    description: 'You use this hashtag frequently in your content',
    value: 'wellness',
    metric_value: 7,
    frequency: 7,
    confidence_score: 0.95,
    generated_at: new Date().toISOString(),
  },
  {
    id: 'hashtag-2',
    user_id: '',
    insight_type: 'top_hashtag',
    title: '#guthealth',
    description: 'You use this hashtag frequently in your content',
    value: 'guthealth',
    metric_value: 5,
    frequency: 5,
    confidence_score: 0.9,
    generated_at: new Date().toISOString(),
  },
  {
    id: 'hashtag-3',
    user_id: '',
    insight_type: 'top_hashtag',
    title: '#nutrition',
    description: 'You use this hashtag frequently in your content',
    value: 'nutrition',
    metric_value: 6,
    frequency: 6,
    confidence_score: 0.88,
    generated_at: new Date().toISOString(),
  },
  {
    id: 'time-1',
    user_id: '',
    insight_type: 'best_posting_time',
    title: 'Best Time: 18:00',
    description: 'Evening wind-down time - highest engagement window',
    value: '18',
    metric_value: 18,
    frequency: 3,
    confidence_score: 0.7,
    generated_at: new Date().toISOString(),
  },
];

const MOCK_POSTS: InstagramPost[] = [
  {
    id: 'mock-post-1',
    caption: '5 simple gut health hacks that changed my life 🌿✨',
    media_type: 'CAROUSEL_ALBUM',
    media_url: 'https://picsum.photos/seed/post1/1080/1080',
    permalink: 'https://www.instagram.com/p/mock1/',
    post_timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    like_count: 3420,
    comment_count: 187,
    engagement_rate: 5.8,
    hashtags: ['guthealth', 'wellness', 'healthylifestyle', 'nutrition'],
    performance_score: 85.5,
  },
  {
    id: 'mock-post-2',
    caption: 'The truth about seed oils nobody talks about 👀',
    media_type: 'IMAGE',
    media_url: 'https://picsum.photos/seed/post2/1080/1080',
    permalink: 'https://www.instagram.com/p/mock2/',
    post_timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    like_count: 8930,
    comment_count: 542,
    engagement_rate: 8.2,
    hashtags: ['nutrition', 'health', 'healthyfats', 'wellness'],
    performance_score: 92.3,
  },
];

// Detailed explanations for each insight type
const INSIGHT_EXPLANATIONS: Record<string, { title: string; why: string; tips: string[] }> = {
  'Gut Health': {
    title: 'Why Gut Health Content Works',
    why: 'Gut health content performs well because it addresses a universal concern with clear, actionable solutions. Your audience responds to practical wellness advice they can implement immediately.',
    tips: [
      'Use carousel posts to break down complex gut health topics into digestible steps',
      'Include before/after stories or testimonials to build credibility',
      'Pair gut health advice with specific meal plans or recipes for maximum saves',
      'Address common myths (like "all bacteria are bad") to spark conversation',
    ],
  },
  'Nutrition': {
    title: 'Why Nutrition Content Drives Engagement',
    why: 'Nutrition posts drive engagement through visual appeal and shareability. People save these for later reference, boosting your reach and establishing you as a go-to resource.',
    tips: [
      'High-quality food photography is essential - invest in good lighting',
      'Create "What I Eat in a Day" content - it\'s highly relatable and shareable',
      'Include macro breakdowns or nutritional benefits in captions',
      'Post recipe carousels with step-by-step instructions for maximum saves',
    ],
  },
  'Hormones': {
    title: 'Why Hormone Content Resonates',
    why: 'Hormone health addresses an often-ignored topic. Your audience values education on this complex subject, driving saves and shares as they learn and want to reference later.',
    tips: [
      'Break down complex hormonal processes into simple, visual explanations',
      'Share personal experiences or client stories (with permission) for relatability',
      'Create content around hormone testing, symptoms, and natural remedies',
      'Address specific conditions like PCOS, thyroid issues, or cortisol imbalance',
    ],
  },
};

export function InstagramInsightsPanel({
  userId,
  instagramUsername,
  instagramConnectedAt,
  instagramLastSynced,
  insights,
  topPosts,
}: Props) {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [username, setUsername] = useState('');
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Use mock data if real data is empty
  const displayInsights = insights.length > 0 ? insights : MOCK_INSIGHTS;
  const displayPosts = topPosts.length > 0 ? topPosts : MOCK_POSTS;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsConnecting(true);

    try {
      await connectInstagramAccount(username.trim());
      setShowConnectForm(false);
      setUsername('');
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to connect Instagram');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);

    try {
      await syncInstagramData();
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to sync Instagram');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Instagram account?')) {
      return;
    }

    try {
      await disconnectInstagramAccount();
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to disconnect Instagram');
    }
  };

  // Not connected state
  if (!instagramUsername) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-soft p-8 border-2 border-purple-100">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Instagram className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-sage">Instagram Insights</h2>
              <p className="text-sage/60 text-sm">Analyze your content performance</p>
            </div>
          </div>
        </div>

        {!showConnectForm ? (
          <div className="text-center py-8">
            <p className="text-sage/70 mb-6 max-w-2xl mx-auto">
              Connect your Instagram account to get AI-powered insights about your content, discover what resonates with your audience, and find trending themes in your posts.
            </p>
            <Button
              onClick={() => setShowConnectForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl px-8 py-3"
            >
              <Link2 className="w-5 h-5 mr-2" />
              Connect Instagram Account
            </Button>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="max-w-md mx-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium text-sage mb-2">
                Instagram Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourusername"
                className="w-full px-4 py-3 rounded-xl border border-sage/20 focus:border-purple-500 focus:outline-none"
                required
              />
              <p className="text-xs text-sage/60 mt-2">
                Enter your public Instagram username (without @)
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isConnecting}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
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
                className="rounded-xl border-2 border-sage/20 hover:border-sage text-sage"
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
  const contentThemes = displayInsights.filter((i) => i.insight_type === 'content_theme');
  const topHashtags = displayInsights.filter((i) => i.insight_type === 'top_hashtag').slice(0, 5);
  const bestPostingTime = displayInsights.find((i) => i.insight_type === 'best_posting_time');

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-soft p-6 border-2 border-purple-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Instagram className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-sage">Instagram Insights</h2>
            <div className="flex items-center gap-2">
              <p className="text-sage/60 text-sm">@{instagramUsername}</p>
              {instagramLastSynced && (
                <span className="text-xs text-sage/50">
                  • Last synced {new Date(instagramLastSynced).toLocaleDateString()}
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
            className="text-sage hover:bg-purple-100"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:bg-purple-100"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={handleDisconnect}
            variant="ghost"
            size="sm"
            className="text-red-500 hover:bg-red-50"
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
        <div className="bg-white rounded-2xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold text-sage text-sm">Content Themes</h3>
          </div>
          <div className="space-y-2">
            {contentThemes.slice(0, 3).map((theme) => (
              <button
                key={theme.id}
                onClick={() => setExpandedInsight(expandedInsight === theme.id ? null : theme.id)}
                className="w-full text-left text-sm hover:bg-purple-50 p-2 rounded-lg transition-colors"
              >
                <p className="font-medium text-sage">{theme.title}</p>
                <p className="text-xs text-sage/60">{theme.frequency} posts</p>
              </button>
            ))}
          </div>
        </div>

        {/* Top Hashtags */}
        <div className="bg-white rounded-2xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold text-sage text-sm">Top Hashtags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {topHashtags.map((hashtag) => (
              <span
                key={hashtag.id}
                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
              >
                #{hashtag.value} ({hashtag.frequency})
              </span>
            ))}
          </div>
        </div>

        {/* Best Posting Time */}
        <div className="bg-white rounded-2xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold text-sage text-sm">Best Time</h3>
          </div>
          {bestPostingTime && (
            <div>
              <p className="text-2xl font-bold text-sage">{bestPostingTime.value}:00</p>
              <p className="text-xs text-sage/60 mt-1">{bestPostingTime.description}</p>
            </div>
          )}
        </div>

        {/* Top Performing Posts */}
        <div className="bg-white rounded-2xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold text-sage text-sm">Top Posts</h3>
          </div>
          <div className="space-y-2">
            {displayPosts.slice(0, 2).map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-sage/80 hover:text-purple-600 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  <span>{post.engagement_rate.toFixed(1)}% engagement</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Insight Detail */}
      {expandedInsight && INSIGHT_EXPLANATIONS[contentThemes.find(t => t.id === expandedInsight)?.title || ''] && (
        <div className="mb-6 bg-white rounded-2xl p-6 border-2 border-purple-200 animate-in slide-in-from-top">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h3 className="font-serif text-xl text-sage">
                {INSIGHT_EXPLANATIONS[contentThemes.find(t => t.id === expandedInsight)?.title || ''].title}
              </h3>
            </div>
            <button
              onClick={() => setExpandedInsight(null)}
              className="text-sage/60 hover:text-sage"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sage/80 mb-4 leading-relaxed">
            {INSIGHT_EXPLANATIONS[contentThemes.find(t => t.id === expandedInsight)?.title || ''].why}
          </p>

          <div className="bg-purple-50 rounded-xl p-4">
            <p className="font-semibold text-sage mb-3 text-sm">💡 Tips to Maximize This Content:</p>
            <ul className="space-y-2">
              {INSIGHT_EXPLANATIONS[contentThemes.find(t => t.id === expandedInsight)?.title || ''].tips.map((tip, idx) => (
                <li key={idx} className="text-sm text-sage/80 flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Why Your Best Content Works */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100">
        <h3 className="font-semibold text-sage mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          Why Your Best Content Performs
        </h3>
        <div className="space-y-4">
          {displayPosts.slice(0, 3).map((post, idx) => (
            <div key={post.id} className="p-4 bg-purple-50 rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-sage">#{idx + 1} Top Post</p>
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs text-sage/70 mb-3 line-clamp-2">{post.caption}</p>
              <div className="flex items-center gap-4 text-xs text-sage/60 mb-3">
                <span>❤️ {post.like_count.toLocaleString()}</span>
                <span>💬 {post.comment_count.toLocaleString()}</span>
                <span className="font-semibold text-purple-600">{post.engagement_rate.toFixed(1)}% engaged</span>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-sage/70 mb-2">Why it works:</p>
                <ul className="space-y-1 text-xs text-sage/80">
                  {post.engagement_rate > 7 && <li>• Strong audience connection drives high engagement</li>}
                  {post.media_type === 'CAROUSEL_ALBUM' && <li>• Carousel format keeps attention longer</li>}
                  {post.hashtags.length >= 4 && <li>• Strategic hashtag use expands reach</li>}
                  {post.comment_count / post.like_count > 0.05 && <li>• Sparked meaningful conversation</li>}
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
