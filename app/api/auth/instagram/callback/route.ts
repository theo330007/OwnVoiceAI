import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { instagramGraph } from '@/lib/services/instagram-graph.service';

/**
 * GET /api/auth/instagram/callback
 * Handles the OAuth callback from Facebook Login for Business.
 * Exchanges the code for tokens, finds the IG business account via the user's Facebook Page,
 * fetches the IG profile, and stores everything in DB.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/instagram/callback`;

  if (error || !code) {
    return NextResponse.redirect(`${origin}/profile?error=instagram_cancelled`);
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(`${origin}/auth/login`);
    }

    // 1. Exchange code for short-lived user token
    const { accessToken: shortToken } = await instagramGraph.exchangeCodeForToken(
      code,
      redirectUri
    );

    // 2. Exchange for long-lived user token (~60 days)
    const { accessToken: longToken, expiresIn } =
      await instagramGraph.exchangeForLongLivedToken(shortToken);

    // 3. Get Facebook Pages managed by this user
    let pagesRaw: any;
    try {
      const url = `https://graph.facebook.com/v21.0/me/accounts?access_token=${longToken}`;
      const res = await fetch(url);
      pagesRaw = await res.json();
    } catch (e: any) {
      pagesRaw = { fetchError: e.message };
    }

    const pages = pagesRaw?.data || [];
    const debugInfo = encodeURIComponent(JSON.stringify(pagesRaw).slice(0, 500));

    if (pages.length === 0) {
      return NextResponse.redirect(`${origin}/profile?error=no_facebook_page&debug=${debugInfo}`);
    }

    // 4. Find the IG Business Account linked to one of their pages
    let igUserId: string | null = null;
    let pageToken: string = pages[0].access_token;

    for (const page of pages) {
      const id = await instagramGraph.getIGBusinessAccountId(page.id, page.access_token);
      if (id) {
        igUserId = id;
        pageToken = page.access_token;
        break;
      }
    }

    if (!igUserId) {
      return NextResponse.redirect(`${origin}/profile?error=no_instagram_business`);
    }

    // 5. Fetch IG profile
    const profile = await instagramGraph.getProfile(igUserId, pageToken);

    // 6. Store in DB
    const supabase = await createClient();
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    await supabase
      .from('users')
      .update({
        instagram_user_id: igUserId,
        instagram_username: profile.username,
        instagram_access_token: pageToken,
        instagram_token_expires_at: tokenExpiresAt,
        instagram_profile_picture_url: profile.profile_picture_url,
        instagram_bio: profile.biography,
        instagram_follower_count: profile.followers_count,
        instagram_following_count: profile.follows_count,
        instagram_posts_count: profile.media_count,
        instagram_connected_at: new Date().toISOString(),
        instagram_last_synced_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    return NextResponse.redirect(`${origin}/profile?connected=true`);
  } catch (err: any) {
    console.error('Instagram OAuth callback error:', err.message);
    return NextResponse.redirect(`${origin}/profile?error=oauth_failed`);
  }
}
