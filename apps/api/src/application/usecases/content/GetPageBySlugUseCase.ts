import { type IPageLocaleRepository } from '../../ports/repositories/IPageLocaleRepository.js';
import { type IPageRepository } from '../../ports/repositories/IPageRepository.js';
import { type SupportedLocale, createNotFoundError } from '@littlehelper/shared';

export interface GetPageBySlugInput {
  locale: SupportedLocale;
  slug: string;
}

export interface GetPageBySlugOutput {
  page: {
    id: string;
    shortId: string;
    parentId: string | null;
    headerImage: string | null;
  };
  locale: {
    id: string;
    locale: SupportedLocale;
    title: string;
    slug: string;
    summary: string | null;
    keywords: string[];
    markdownPath: string;
    headerImage: string | null;
  };
  breadcrumbs: Array<{
    title: string;
    slug: string;
    locale: SupportedLocale;
  }>;
}

export class GetPageBySlugUseCase {
  constructor(
    private readonly pageRepository: IPageRepository,
    private readonly pageLocaleRepository: IPageLocaleRepository
  ) {}

  async execute(input: GetPageBySlugInput): Promise<GetPageBySlugOutput> {
    const pageLocale = await this.pageLocaleRepository.findBySlug(input.locale, input.slug);

    if (!pageLocale) {
      throw createNotFoundError('Page');
    }

    const page = await this.pageRepository.findById(pageLocale.pageId);

    if (!page) {
      throw createNotFoundError('Page');
    }

    const breadcrumbs = await this.buildBreadcrumbs(page.id, input.locale);

    return {
      page: {
        id: page.id,
        shortId: page.shortId,
        parentId: page.parentId,
        headerImage: page.headerImage,
      },
      locale: {
        id: pageLocale.id,
        locale: pageLocale.locale,
        title: pageLocale.title,
        slug: pageLocale.slug,
        summary: pageLocale.summary,
        keywords: pageLocale.keywords,
        markdownPath: pageLocale.markdownPath,
        headerImage: pageLocale.headerImage,
      },
      breadcrumbs,
    };
  }

  private async buildBreadcrumbs(
    pageId: string,
    locale: SupportedLocale
  ): Promise<Array<{ title: string; slug: string; locale: SupportedLocale }>> {
    const breadcrumbs: Array<{ title: string; slug: string; locale: SupportedLocale }> = [];
    let currentPageId: string | null = pageId;

    while (currentPageId) {
      const page = await this.pageRepository.findById(currentPageId);
      if (!page) {
        break;
      }

      const locales = await this.pageLocaleRepository.findByPageId(page.id);
      const localeData = locales.find((l) => l.locale === locale) ?? locales[0];

      if (localeData) {
        breadcrumbs.unshift({
          title: localeData.title,
          slug: localeData.slug,
          locale: localeData.locale,
        });
      }

      currentPageId = page.parentId;
    }

    return breadcrumbs;
  }
}
