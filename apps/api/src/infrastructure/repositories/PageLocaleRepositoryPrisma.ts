import { type PrismaClient } from '../prisma/index.js';
import { PageLocale } from '../../domain/content/PageLocale.js';
import {
  type IPageLocaleRepository,
  type CreatePageLocaleData,
  type UpdatePageLocaleData,
} from '../../application/ports/repositories/IPageLocaleRepository.js';
import { type SupportedLocale } from '@littlehelper/shared';

export class PageLocaleRepositoryPrisma implements IPageLocaleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<PageLocale | null> {
    const locale = await this.prisma.pageLocale.findUnique({ where: { id } });
    return locale ? this.toDomain(locale) : null;
  }

  async findByPageId(pageId: string): Promise<PageLocale[]> {
    const locales = await this.prisma.pageLocale.findMany({
      where: { pageId },
      orderBy: { locale: 'asc' },
    });
    return locales.map((l) => this.toDomain(l));
  }

  async findBySlug(locale: SupportedLocale, slug: string): Promise<PageLocale | null> {
    const pageLocale = await this.prisma.pageLocale.findUnique({
      where: { locale_slug: { locale, slug } },
    });
    return pageLocale ? this.toDomain(pageLocale) : null;
  }

  async findAll(locale?: SupportedLocale): Promise<PageLocale[]> {
    const locales = await this.prisma.pageLocale.findMany({
      where: locale ? { locale } : undefined,
      orderBy: { title: 'asc' },
    });
    return locales.map((l) => this.toDomain(l));
  }

  async create(data: CreatePageLocaleData): Promise<PageLocale> {
    const locale = await this.prisma.pageLocale.create({
      data: {
        pageId: data.pageId,
        locale: data.locale,
        title: data.title,
        slug: data.slug,
        markdownPath: data.markdownPath,
        summary: data.summary ?? null,
        keywords: data.keywords ?? [],
        headerImage: data.headerImage ?? null,
        geminiLocked: data.geminiLocked ?? false,
      },
    });
    return this.toDomain(locale);
  }

  async update(id: string, data: UpdatePageLocaleData): Promise<PageLocale> {
    const locale = await this.prisma.pageLocale.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        keywords: data.keywords,
        headerImage: data.headerImage,
        markdownPath: data.markdownPath,
        geminiLocked: data.geminiLocked,
      },
    });
    return this.toDomain(locale);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pageLocale.delete({ where: { id } });
  }

  private toDomain(
    locale: NonNullable<Awaited<ReturnType<PrismaClient['pageLocale']['findUnique']>>>
  ): PageLocale {
    return new PageLocale({
      id: locale.id,
      pageId: locale.pageId,
      locale: locale.locale as SupportedLocale,
      title: locale.title,
      slug: locale.slug,
      summary: locale.summary,
      keywords: locale.keywords,
      markdownPath: locale.markdownPath,
      headerImage: locale.headerImage,
      geminiLocked: locale.geminiLocked,
      createdAt: locale.createdAt,
      updatedAt: locale.updatedAt,
    });
  }
}
