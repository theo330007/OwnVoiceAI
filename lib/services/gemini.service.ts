import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing env.GEMINI_API_KEY');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class GeminiService {
  private textModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  private embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

  async generateText(prompt: string, systemInstruction?: string) {
    const chat = this.textModel.startChat({
      generationConfig: {
        maxOutputTokens: 8192, // Increased for more detailed trend data
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
