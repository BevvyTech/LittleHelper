import { type PrismaClient } from '../prisma/index.js';
import { Page } from '../../domain/content/Page.js';
import {
  type IPageRepository,
  type CreatePageData,
  type UpdatePageData,
} from '../../application/ports/repositories/IPageRepository.js';

export class PageRepositoryPrisma implements IPageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Page | null> {
    const page = await this.prisma.page.findUnique({ where: { id } });
    return page ? this.toDomain(page) : null;
  }

  async findByShortId(shortId: string): Promise<Page | null> {
    const page = await this.prisma.page.findUnique({ where: { shortId } });
    return page ? this.toDomain(page) : null;
  }

  async findAll(): Promise<Page[]> {
    const pages = await this.prisma.page.findMany({ orderBy: { createdAt: 'desc' } });
    return pages.map((p) => this.toDomain(p));
  }

  async findChildren(parentId: string): Promise<Page[]> {
    const pages = await this.prisma.page.findMany({
      where: { parentId },
      orderBy: { createdAt: 'asc' },
    });
    return pages.map((p) => this.toDomain(p));
  }

  async findRoots(): Promise<Page[]> {
    const pages = await this.prisma.page.findMany({
      where: { parentId: null },
      orderBy: { createdAt: 'asc' },
    });
    return pages.map((p) => this.toDomain(p));
  }

  async create(data: CreatePageData): Promise<Page> {
    const id = crypto.randomUUID().replace(/-/g, '').slice(0, 25);
    const shortId = Page.generateShortId(id);

    const page = await this.prisma.page.create({
      data: {
        id,
        shortId,
        parentId: data.parentId ?? null,
        headerImage: data.headerImage ?? null,
      },
    });
    return this.toDomain(page);
  }

  async update(id: string, data: UpdatePageData): Promise<Page> {
    const page = await this.prisma.page.update({
      where: { id },
      data: {
        parentId: data.parentId,
        headerImage: data.headerImage,
      },
    });
    return this.toDomain(page);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.page.delete({ where: { id } });
  }

  private toDomain(page: NonNullable<Awaited<ReturnType<PrismaClient['page']['findUnique']>>>): Page {
    return new Page({
      id: page.id,
      shortId: page.shortId,
      parentId: page.parentId,
      headerImage: page.headerImage,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    });
  }
}
