import { type PrismaClient } from '../prisma/index.js';
import { Redirect } from '../../domain/redirects/Redirect.js';
import {
  type IRedirectRepository,
  type CreateRedirectData,
} from '../../application/ports/repositories/IRedirectRepository.js';
import { type SupportedLocale } from '@littlehelper/shared';

export class RedirectRepositoryPrisma implements IRedirectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByOldSlug(locale: SupportedLocale, oldSlug: string): Promise<Redirect | null> {
    const redirect = await this.prisma.redirect.findFirst({
      where: { locale, oldSlug },
      orderBy: { createdAt: 'desc' },
    });
    return redirect ? this.toDomain(redirect) : null;
  }

  async findAll(locale?: SupportedLocale): Promise<Redirect[]> {
    const redirects = await this.prisma.redirect.findMany({
      where: locale ? { locale } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return redirects.map((r) => this.toDomain(r));
  }

  async create(data: CreateRedirectData): Promise<Redirect> {
    const redirect = await this.prisma.redirect.create({
      data: {
        oldSlug: data.oldSlug,
        newSlug: data.newSlug,
        locale: data.locale,
      },
    });
    return this.toDomain(redirect);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.redirect.delete({ where: { id } });
  }

  async deleteByOldSlug(locale: SupportedLocale, oldSlug: string): Promise<void> {
    await this.prisma.redirect.deleteMany({ where: { locale, oldSlug } });
  }

  private toDomain(
    redirect: NonNullable<Awaited<ReturnType<PrismaClient['redirect']['findFirst']>>>
  ): Redirect {
    return new Redirect({
      id: redirect.id,
      oldSlug: redirect.oldSlug,
      newSlug: redirect.newSlug,
      locale: redirect.locale as SupportedLocale,
      createdAt: redirect.createdAt,
    });
  }
}
