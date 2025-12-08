import { type ICommentThreadRepository } from '../../ports/repositories/ICommentThreadRepository.js';
import { type ICommentRepository } from '../../ports/repositories/ICommentRepository.js';
import { Comment } from '../../../domain/comments/Comment.js';
import { createValidationError } from '@littlehelper/shared';

export interface CreateCommentInput {
  anchorId: string;
  pageLocaleId: string;
  body: string;
  userId: string | null;
}

export class CreateCommentUseCase {
  constructor(
    private readonly threadRepository: ICommentThreadRepository,
    private readonly commentRepository: ICommentRepository
  ) {}

  async execute(input: CreateCommentInput) {
    const validation = Comment.validateBody(input.body);
    if (!validation.valid) {
      throw createValidationError({ body: validation.error ?? 'Invalid comment' });
    }

    let thread = await this.threadRepository.findByAnchorId(input.anchorId);
    if (!thread) {
      thread = await this.threadRepository.create({
        anchorId: input.anchorId,
        pageLocaleId: input.pageLocaleId,
        createdById: input.userId,
      });
    }

    const comment = await this.commentRepository.create({
      threadId: thread.id,
      authorId: input.userId,
      body: input.body,
    });

    return { thread, comment };
  }
}
