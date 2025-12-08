import { type IRedirectRepository } from '../../ports/repositories/IRedirectRepository.js';
import { type SupportedLocale } from '@littlehelper/shared';

export interface CheckRedirectInput {
  locale: SupportedLocale;
  slug: string;
}

export interface CheckRedirectOutput {
  hasRedirect: boolean;
  newSlug?: string;
  newPath?: string;
}

export class CheckRedirectUseCase {
  constructor(private readonly redirectRepository: IRedirectRepository) {}

  async execute(input: CheckRedirectInput): Promise<CheckRedirectOutput> {
    const redirect = await this.redirectRepository.findByOldSlug(input.locale, input.slug);

    if (!redirect) {
      return { hasRedirect: false };
    }

    return {
      hasRedirect: true,
      newSlug: redirect.newSlug,
      newPath: `/${input.locale}/${redirect.newSlug}`,
    };
  }
}
