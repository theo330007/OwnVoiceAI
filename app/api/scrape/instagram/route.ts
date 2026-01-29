import { scrapeInstagramTrends } from '@/app/actions/scraping';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hashtags, urls, layer = 'macro' } = body;

    if (!hashtags && !urls) {
      return NextResponse.json(
        { error: 'Either hashtags or urls must be provided' },
        { status: 400 }
      );
    }

    const result = await scrapeInstagramTrends({
      platform: 'instagram',
      hashtags,
      urls,
      layer,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Instagram scraping API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Scraping failed',
        trendsFound: 0,
        trendsAdded: 0,
      },
      { status: 500 }
    );
  }
}
