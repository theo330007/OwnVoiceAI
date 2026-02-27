import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing env.GEMINI_API_KEY');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const genAIv2 = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class GeminiService {
  private textModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  private embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

  async generateText(prompt: string, systemInstruction?: string) {
    const chat = this.textModel.startChat({
      generationConfig: {
        maxOutputTokens: 16384,
        temperature: 0.7,
      },
      ...(systemInstruction && { systemInstruction }),
    });

    const result = await chat.sendMessage(prompt);
    return result.response.text();
  }

  async streamText(prompt: string, systemInstruction?: string) {
    const chat = this.textModel.startChat({
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
      },
      ...(systemInstruction && { systemInstruction }),
    });

    const result = await chat.sendMessageStream(prompt);
    return result.stream;
  }

  /**
   * Generate an image using Gemini Nano Banana (gemini-2.5-flash-image).
   * Returns a base64 data URL ready to display in an <img> tag.
   */
  async generateImage(prompt: string, aspectRatio?: '1:1' | '9:16' | '16:9'): Promise<string> {
    const fullPrompt = aspectRatio
      ? `${prompt} Aspect ratio: ${aspectRatio}.`
      : prompt;

    const response = await genAIv2.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: fullPrompt,
    });

    const parts = (response as any).candidates?.[0]?.content?.parts;
    if (!parts?.length) throw new Error('Gemini returned no image candidate');

    for (const part of parts) {
      if (part.inlineData) {
        const { data, mimeType } = part.inlineData;
        return `data:${mimeType};base64,${data}`;
      }
    }

    throw new Error('Gemini image response contained no inline image data');
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const result = await this.embedModel.embedContent(text);
    return result.embedding.values;
  }

  async batchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings = await Promise.all(
      texts.map((text) => this.generateEmbedding(text))
    );
    return embeddings;
  }
}

export const gemini = new GeminiService();
