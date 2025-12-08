import { type PrismaClient } from '../prisma/index.js';
import { Comment } from '../../domain/comments/index.js';
import { type ICommentRepository } from '../../application/ports/repositories/ICommentRepository.js';

export class CommentRepositoryPrisma implements ICommentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByThreadId(threadId: string): Promise<Comment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
    });
    return comments.map((c) => this.toDomain(c));
  }

  async findById(id: string): Promise<Comment | null> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    return comment ? this.toDomain(comment) : null;
  }

  async create(data: { threadId: string; authorId: string | null; body: string }): Promise<Comment> {
    const comment = await this.prisma.comment.create({
      data: {
        threadId: data.threadId,
        authorId: data.authorId,
        body: data.body,
      },
    });
    return this.toDomain(comment);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } });
  }

  async countByThread(threadId: string): Promise<number> {
    return await this.prisma.comment.count({ where: { threadId } });
  }

  async findAllWithContext(
    options: { page?: number; pageSize?: number } = {}
  ): Promise<{ comments: Array<Comment & { threadId: string }>; total: number }> {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.comment.count(),
    ]);

    return {
      comments: comments.map((c) => this.toDomain(c)),
      total,
    };
  }

  private toDomain(
    comment: NonNullable<Awaited<ReturnType<PrismaClient['comment']['findUnique']>>>
  ): Comment {
    return new Comment({
      id: comment.id,
      threadId: comment.threadId,
      authorId: comment.authorId,
      body: comment.body,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    });
  }
}
