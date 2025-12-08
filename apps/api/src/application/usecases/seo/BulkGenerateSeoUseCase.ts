import { type IGeminiGateway } from '../../ports/gateways/IGeminiGateway.js';
import {
  type IPageLocaleRepository,
  type IPageRepository,
} from '../../ports/repositories/index.js';
import { GenerateSeoMetadataUseCase } from './GenerateSeoMetadataUseCase.js';

export class BulkGenerateSeoUseCase {
  private readonly generateSeo: GenerateSeoMetadataUseCase;

  constructor(
    private readonly pageRepository: IPageRepository,
    private readonly pageLocaleRepository: IPageLocaleRepository,
    geminiGateway: IGeminiGateway
  ) {
    this.generateSeo = new GenerateSeoMetadataUseCase(pageLocaleRepository, geminiGateway);
  }

  async execute(contentLoader: (markdownPath: string) => Promise<string>) {
    const pages = await this.pageRepository.findAll();
    const locales = await this.pageLocaleRepository.findAll();
    const results = [];

    for (const locale of locales) {
      if (locale.geminiLocked) {
        results.push({ pageLocaleId: locale.id, skipped: true });
        continue;
      }
      try {
        const content = await contentLoader(locale.markdownPath);
        const result = await this.generateSeo.execute(locale.id, content);
        results.push({ pageLocaleId: locale.id, ...result });
      } catch (error) {
        results.push({
          pageLocaleId: locale.id,
          error: error instanceof Error ? error.message : 'Failed',
        });
      }
    }

    return { total: locales.length, results };
  }
}
