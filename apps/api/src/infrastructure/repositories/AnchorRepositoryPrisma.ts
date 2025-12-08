import { type PrismaClient } from '../prisma/index.js';
import { Anchor } from '../../domain/content/index.js';
import {
  type IAnchorRepository,
  type UpsertAnchorData,
} from '../../application/ports/repositories/IAnchorRepository.js';

export class AnchorRepositoryPrisma implements IAnchorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByPageLocaleId(pageLocaleId: string): Promise<Anchor[]> {
    const anchors = await this.prisma.anchor.findMany({
      where: { pageLocaleId },
      orderBy: { index: 'asc' },
    });
    return anchors.map((a) => this.toDomain(a));
  }

  async findByHash(pageLocaleId: string, hash: string): Promise<Anchor | null> {
    const anchor = await this.prisma.anchor.findFirst({ where: { pageLocaleId, hash } });
    return anchor ? this.toDomain(anchor) : null;
  }

  async upsertMany(anchors: UpsertAnchorData[]): Promise<Anchor[]> {
    const results: Anchor[] = [];
    for (const anchor of anchors) {
      const record = await this.prisma.anchor.upsert({
        where: { pageLocaleId_hash: { pageLocaleId: anchor.pageLocaleId, hash: anchor.hash } },
        update: {
          index: anchor.index,
          anchorId: anchor.anchorId,
          orphanedAt: null,
        },
        create: {
          pageLocaleId: anchor.pageLocaleId,
          anchorId: anchor.anchorId,
          hash: anchor.hash,
          index: anchor.index,
          orphanedAt: null,
        },
      });
      results.push(this.toDomain(record));
    }
    return results;
  }

  async markOrphaned(pageLocaleId: string, activeAnchorIds: string[]): Promise<void> {
    await this.prisma.anchor.updateMany({
      where: {
        pageLocaleId,
        anchorId: { notIn: activeAnchorIds },
        orphanedAt: null,
      },
      data: { orphanedAt: new Date() },
    });
  }

  async deleteOrphanedOlderThan(cutoff: Date): Promise<number> {
    const result = await this.prisma.anchor.deleteMany({
      where: { orphanedAt: { lt: cutoff } },
    });
    return result.count;
  }

  private toDomain(
    anchor: NonNullable<Awaited<ReturnType<PrismaClient['anchor']['findFirst']>>>
  ): Anchor {
    return new Anchor({
      id: anchor.id,
      pageLocaleId: anchor.pageLocaleId,
      anchorId: anchor.anchorId,
      hash: anchor.hash,
      index: anchor.index,
      orphanedAt: anchor.orphanedAt,
      createdAt: anchor.createdAt,
      updatedAt: anchor.updatedAt,
    });
  }
}
