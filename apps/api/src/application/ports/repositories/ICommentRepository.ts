import { type Comment } from '../../../domain/comments/index.js';

export interface ICommentRepository {
  findByThreadId(threadId: string): Promise<Comment[]>;
  findById(id: string): Promise<Comment | null>;
  create(data: { threadId: string; authorId: string | null; body: string }): Promise<Comment>;
  delete(id: string): Promise<void>;
  countByThread(threadId: string): Promise<number>;
  findAllWithContext(options?: {
    page?: number;
    pageSize?: number;
  }): Promise<{ comments: Array<Comment & { threadId: string }>; total: number }>;
}
