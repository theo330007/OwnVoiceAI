import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/instagram
 * Initiates the Facebook/Instagram OAuth flow.
 * The user is redirected to Facebook's login dialog.
 */
export async function GET(req: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    return NextResponse.json({ error: 'FACEBOOK_APP_ID is not configured' }, { status: 500 });
  }

  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/instagram/callback`;

  const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth');
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  // instagram_basic: read IG profile + media (requires Facebook Login for Business product)
  // pages_show_list: list Facebook Pages to find the linked IG business account
  // instagram_manage_insights: post-level reach and impressions
  authUrl.searchParams.set(
    'scope',
    'instagram_basic,pages_show_list,instagram_manage_insights'
  );
  authUrl.searchParams.set('response_type', 'code');

  return NextResponse.redirect(authUrl.toString());
}
