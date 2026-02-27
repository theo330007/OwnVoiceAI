import { gemini } from './gemini.service';

export type AssetType = 'image' | 'video' | 'audio';

export interface GeneratedAsset {
  url: string;
  metadata?: {
    provider: string;
    modelUsed?: string;
    generationTime?: number;
  };
}

export interface AssetGenerationOptions {
  aspectRatio?: '1:1' | '9:16' | '16:9';
  duration?: number;
  quality?: 'draft' | 'standard' | 'high';
  referenceUrls?: string[];
}

export interface AssetGeneratorProvider {
  name: string;
  supportedTypes: AssetType[];
  generateAsset(
    type: AssetType,
    prompt: string,
    options?: AssetGenerationOptions
  ): Promise<GeneratedAsset>;
}

class MockAssetProvider implements AssetGeneratorProvider {
  name = 'mock';
  supportedTypes: AssetType[] = ['image', 'video', 'audio'];

  async generateAsset(
    type: AssetType,
    prompt: string,
    options?: AssetGenerationOptions
  ): Promise<GeneratedAsset> {
    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (type === 'image') {
      const seed = Math.random().toString(36).substring(2, 10);
      const [w, h] =
        options?.aspectRatio === '9:16'
          ? [720, 1280]
          : options?.aspectRatio === '16:9'
            ? [1280, 720]
            : [1080, 1080];

      return {
        url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
        metadata: { provider: 'mock', generationTime: 1500 },
      };
    }

    if (type === 'video') {
      return {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        metadata: { provider: 'mock', generationTime: 1500 },
      };
    }

    // audio
    return {
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      metadata: { provider: 'mock', generationTime: 1500 },
    };
  }
}

class GeminiAssetProvider implements AssetGeneratorProvider {
  name = 'gemini';
  supportedTypes: AssetType[] = ['image', 'video', 'audio'];

  async generateAsset(
    type: AssetType,
    prompt: string,
    options?: AssetGenerationOptions
  ): Promise<GeneratedAsset> {
    const start = Date.now();

    if (type === 'image') {
      const dataUrl = await gemini.generateImage(prompt, options?.aspectRatio);
      return {
        url: dataUrl,
        metadata: {
          provider: 'gemini',
          modelUsed: 'gemini-2.0-flash-exp-image-generation',
          generationTime: Date.now() - start,
        },
      };
    }

    // Video and audio generation not yet supported by Gemini — return placeholder
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (type === 'video') {
      return {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        metadata: { provider: 'gemini-fallback', generationTime: Date.now() - start },
      };
    }
    return {
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      metadata: { provider: 'gemini-fallback', generationTime: Date.now() - start },
    };
  }
}

class AssetGeneratorService {
  private providers = new Map<string, AssetGeneratorProvider>();
  private defaultProvider = 'gemini';

  constructor() {
    this.registerProvider(new MockAssetProvider());
    this.registerProvider(new GeminiAssetProvider());
  }

  registerProvider(provider: AssetGeneratorProvider) {
    this.providers.set(provider.name, provider);
  }

  setDefaultProvider(name: string) {
    if (!this.providers.has(name)) {
      throw new Error(`Provider not registered: ${name}`);
    }
    this.defaultProvider = name;
  }

  async generateAsset(
    type: AssetType,
    prompt: string,
    options?: AssetGenerationOptions,
    providerName?: string
  ): Promise<GeneratedAsset> {
    const provider = this.providers.get(providerName || this.defaultProvider);

    if (!provider) {
      throw new Error(`Provider not found: ${providerName || this.defaultProvider}`);
    }

    if (!provider.supportedTypes.includes(type)) {
      throw new Error(`Provider ${provider.name} does not support ${type} generation`);
    }

    return provider.generateAsset(type, prompt, options);
  }
}

export const assetGenerator = new AssetGeneratorService();
