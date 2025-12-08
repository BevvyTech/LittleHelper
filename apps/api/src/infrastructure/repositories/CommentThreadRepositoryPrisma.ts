import { type PrismaClient } from '../prisma/index.js';
import { CommentThread } from '../../domain/comments/index.js';
import { type ICommentThreadRepository } from '../../application/ports/repositories/ICommentThreadRepository.js';

export class CommentThreadRepositoryPrisma implements ICommentThreadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByAnchorId(anchorId: string): Promise<CommentThread | null> {
    const thread = await this.prisma.commentThread.findUnique({ where: { anchorId } });
    return thread ? this.toDomain(thread) : null;
  }

  async findById(id: string): Promise<CommentThread | null> {
    const thread = await this.prisma.commentThread.findUnique({ where: { id } });
    return thread ? this.toDomain(thread) : null;
  }

  async findByPageLocaleId(pageLocaleId: string): Promise<CommentThread[]> {
    const threads = await this.prisma.commentThread.findMany({
      where: { pageLocaleId },
      orderBy: { createdAt: 'asc' },
    });
    return threads.map((t) => this.toDomain(t));
  }

  async create(data: {
    pageLocaleId: string;
    anchorId: string;
    createdById: string | null;
  }): Promise<CommentThread> {
    const thread = await this.prisma.commentThread.create({
      data: {
        pageLocaleId: data.pageLocaleId,
        anchorId: data.anchorId,
        createdById: data.createdById,
      },
    });
    return this.toDomain(thread);
  }

  private toDomain(
    thread: NonNullable<Awaited<ReturnType<PrismaClient['commentThread']['findUnique']>>>
  ): CommentThread {
    return new CommentThread({
      id: thread.id,
      pageLocaleId: thread.pageLocaleId,
      anchorId: thread.anchorId,
      createdById: thread.createdById,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    });
  }
}
