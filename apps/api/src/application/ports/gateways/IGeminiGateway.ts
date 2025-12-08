export interface SeoMetadata {
  summary: string;
  keywords: string[];
}

export interface IGeminiGateway {
  testConnection(): Promise<{ success: boolean; error?: string }>;
  generateSummary(content: string): Promise<string>;
  generateKeywords(content: string): Promise<string[]>;
  generateSeoMetadata(content: string): Promise<SeoMetadata>;
}
