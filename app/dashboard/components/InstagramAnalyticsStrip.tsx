'use client';

import { useState } from 'react';
import { Instagram, RefreshCw, Users, Heart, MessageCircle, Clock, TrendingUp, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { syncInstagramData, type InstagramInsight, type InstagramPost } from '@/app/actions/instagram';
import { useRouter } from 'next/navigation';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_INSIGHTS: InstagramInsight[] = [
  { id: 'b1', insight_type: 'best_posting_time', title: 'Best Time', description: 'Evening wind-down — highest engagement window', value: '18', metric_value: 18, frequency: 3, confidence_score: 0.7, generated_at: '' },
];

const MOCK_POSTS: InstagramPost[] = [
  { id: 'p1', caption: '5 simple gut health hacks that changed my life 🌿', media_type: 'CAROUSEL_ALBUM', media_url: '', permalink: 'https://instagram.com', post_timestamp: '', like_count: 3420, comment_count: 187, engagement_rate: 5.8, hashtags: [], performance_score: 85 },
  { id: 'p2', caption: 'The truth about seed oils nobody talks about 👀',    media_type: 'IMAGE',          media_url: '', permalink: 'https://instagram.com', post_timestamp: '', like_count: 8930, comment_count: 542, engagement_rate: 8.2, hashtags: [], performance_score: 92 },
];

const MOCK_FOLLOWER_COUNT = 58200;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  instagramUsername: string | null;
  instagramLastSynced: string | null;
  followerCount?: number | null;
  insights: InstagramInsight[];
  topPosts: InstagramPost[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InstagramAnalyticsStrip({ instagramUsername, instagramLastSynced, followerCount, insights, topPosts }: Props) {
  const router = useRouter();
  const [isSyncing, setIsSyncing]   = useState(false);
  const [syncError, setSyncError]   = useState<string | null>(null);
  const [syncDone, setSyncDone]     = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncDone(false);
    try {
      await syncInstagramData();
      setSyncDone(true);
      router.refresh();
    } catch (err: any) {
      setSyncError(err?.message || 'Sync failed — try again');
    } finally {
      setIsSyncing(false);
    }
  };

  const isMock         = insights.length === 0 && topPosts.length === 0;
  const displayPosts   = isMock ? MOCK_POSTS    : topPosts;
  const displayFollowers = (isMock ? MOCK_FOLLOWER_COUNT : followerCount) ?? null;
  const bestTime       = (isMock ? MOCK_INSIGHTS : insights).find(i => i.insight_type === 'best_posting_time');

  const avgLikes    = displayPosts.length > 0 ? Math.round(displayPosts.reduce((s, p) => s + p.like_count,       0) / displayPosts.length) : null;
  const avgComments = displayPosts.length > 0 ? Math.round(displayPosts.reduce((s, p) => s + p.comment_count,    0) / displayPosts.length) : null;
  const avgER       = displayPosts.length > 0 ? (displayPosts.reduce((s, p) => s + p.engagement_rate, 0) / displayPosts.length).toFixed(1) : null;

  const syncedAgo = instagramLastSynced
    ? (() => {
        const diffH = Math.floor((Date.now() - new Date(instagramLastSynced).getTime()) / 3_600_000);
        if (diffH < 1)  return 'just now';
        if (diffH < 24) return `${diffH}h ago`;
        return `${Math.floor(diffH / 24)}d ago`;
      })()
    : null;

  // ── Not connected ─────────────────────────────────────────────────────────
  if (!instagramUsername) {
    return (
      <div className="bg-white border border-warm-border rounded-2xl shadow-soft px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Instagram className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-sage">Instagram Analytics</p>
            <p className="text-xs text-sage/50">Connect your account to see performance insights</p>
          </div>
        </div>
        <Link
          href="/integrations"
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-xl hover:opacity-90 transition-opacity flex-shrink-0"
        >
          Connect Instagram <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  // ── Connected ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-warm-border rounded-2xl shadow-soft overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-sage/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Instagram className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-sage">@{instagramUsername}</span>
            {syncedAgo && !isMock && <span className="text-[11px] text-sage/40">· synced {syncedAgo}</span>}
            {isMock && <span className="text-[10px] text-sage/30 bg-sage/5 px-2 py-0.5 rounded-full">sample data</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {syncError  && <span className="text-[11px] text-red-500">{syncError}</span>}
          {syncDone && !syncError && <span className="text-[11px] text-green-600">Synced!</span>}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 text-[11px] text-sage/50 hover:text-sage transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing…' : 'Sync'}
          </button>
          <Link
            href="/integrations/instagram"
            className="flex items-center gap-1 text-[11px] text-dusty-rose hover:text-dusty-rose/70 transition-colors"
          >
            Full analysis <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-4 divide-x divide-sage/[0.06]">

        {/* Followers */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold text-sage/40 uppercase tracking-widest">Followers</span>
          </div>
          {displayFollowers != null
            ? <p className="text-2xl font-bold text-sage leading-none">{fmtNum(displayFollowers)}</p>
            : <p className="text-xs text-sage/30">—</p>
          }
        </div>

        {/* Avg engagement rate */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold text-sage/40 uppercase tracking-widest">Avg ER</span>
          </div>
          {avgER != null ? (
            <>
              <p className="text-2xl font-bold text-sage leading-none mb-1">{avgER}%</p>
              <p className="text-[11px] text-sage/40">engagement rate</p>
            </>
          ) : <p className="text-xs text-sage/30">—</p>}
        </div>

        {/* Avg likes + comments */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Heart className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold text-sage/40 uppercase tracking-widest">Avg Post</span>
          </div>
          {avgLikes != null ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-sage/25" />
                <span className="text-sm font-bold text-sage">{fmtNum(avgLikes)}</span>
                <span className="text-[10px] text-sage/40">likes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-3 h-3 text-sage/25" />
                <span className="text-sm font-bold text-sage">{avgComments != null ? fmtNum(avgComments) : '—'}</span>
                <span className="text-[10px] text-sage/40">comments</span>
              </div>
            </div>
          ) : <p className="text-xs text-sage/30">—</p>}
        </div>

        {/* Best posting time */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold text-sage/40 uppercase tracking-widest">Best Time</span>
          </div>
          {bestTime ? (
            <>
              <p className="text-2xl font-bold text-sage leading-none mb-1">{bestTime.value}:00</p>
              <p className="text-[11px] text-sage/50 leading-snug">{bestTime.description}</p>
            </>
          ) : <p className="text-xs text-sage/30">—</p>}
        </div>

      </div>

      {/* Top posts */}
      <div className="border-t border-sage/[0.06] px-5 py-3">
        <p className="text-[10px] font-bold text-sage/30 uppercase tracking-widest mb-2.5">Top posts</p>
        <div className="space-y-2">
          {displayPosts.slice(0, 2).map((post, i) => (
            <div key={post.id} className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-purple-300 flex-shrink-0 w-4">#{i + 1}</span>
              <p className="text-[11px] text-sage flex-1 min-w-0 truncate">{post.caption}</p>
              <div className="flex items-center gap-3 flex-shrink-0 text-[10px] text-sage/50">
                <span>❤️ {post.like_count.toLocaleString()}</span>
                <span>💬 {post.comment_count.toLocaleString()}</span>
                <span className="font-semibold text-purple-600">{post.engagement_rate.toFixed(1)}%</span>
                <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-sage/30 hover:text-sage/60 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
