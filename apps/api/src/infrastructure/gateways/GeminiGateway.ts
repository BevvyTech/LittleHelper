import { GoogleGenerativeAI } from '@google/generative-ai';
import { createExternalServiceError } from '@littlehelper/shared';
import { type IGeminiGateway, type SeoMetadata } from '../../application/ports/gateways/IGeminiGateway.js';

export class GeminiGateway implements IGeminiGateway {
  private readonly modelName = 'gemini-pro';

  constructor(private readonly apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is missing');
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.generateSummary('Test content for connectivity.');
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async generateSummary(content: string): Promise<string> {
    const prompt = `Summarize this documentation in 1-2 sentences for SEO meta description (max 160 chars): ${content}`;
    const response = await this.generateText(prompt);
    return response.slice(0, 160);
  }

  async generateKeywords(content: string): Promise<string[]> {
    const prompt = `Extract 5-10 SEO keywords from this documentation as a JSON array: ${content}`;
    const response = await this.generateText(prompt);
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        return parsed.map((kw) => String(kw));
      }
    } catch {
      // fall through
    }
    return response
      .split(',')
      .map((kw) => kw.trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  async generateSeoMetadata(content: string): Promise<SeoMetadata> {
    const [summary, keywords] = await Promise.all([
      this.generateSummary(content),
      this.generateKeywords(content),
    ]);
    return { summary, keywords };
  }

  private async generateText(prompt: string): Promise<string> {
    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text() ?? '';
      return text.trim();
    } catch (error) {
      throw createExternalServiceError('Gemini', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
