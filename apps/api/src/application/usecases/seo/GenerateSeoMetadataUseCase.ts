import { type IGeminiGateway } from '../../ports/gateways/IGeminiGateway.js';
import { type IPageLocaleRepository } from '../../ports/repositories/IPageLocaleRepository.js';
import { createNotFoundError } from '@littlehelper/shared';

export class GenerateSeoMetadataUseCase {
  constructor(
    private readonly pageLocaleRepository: IPageLocaleRepository,
    private readonly geminiGateway: IGeminiGateway
  ) {}

  async execute(pageLocaleId: string, content: string) {
    const pageLocale = await this.pageLocaleRepository.findById(pageLocaleId);
    if (!pageLocale) {
      throw createNotFoundError('Page locale');
    }

    if (pageLocale.geminiLocked) {
      return { skipped: true };
    }

    const seo = await this.geminiGateway.generateSeoMetadata(content);
    await this.pageLocaleRepository.update(pageLocale.id, {
      summary: seo.summary,
      keywords: seo.keywords,
    });

    return { skipped: false, seo };
  }
}
