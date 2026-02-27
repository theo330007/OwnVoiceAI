import { assetGenerator } from '@/lib/services/asset-generator.service';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, prompt, options, provider, referenceUrls } = body;

    if (!type || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: type, prompt' },
        { status: 400 }
      );
    }

    // Normalize any non-standard types (e.g. "overlay_graphic") the AI may hallucinate
    const validTypes = ['image', 'video', 'audio'];
    const normalizedType = validTypes.includes(type) ? type : 'image';

    const result = await assetGenerator.generateAsset(normalizedType, prompt, { ...options, referenceUrls }, provider);

    return NextResponse.json({ success: true, asset: result });
  } catch (error: any) {
    console.error('Asset generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Asset generation failed' },
      { status: 500 }
    );
  }
}
