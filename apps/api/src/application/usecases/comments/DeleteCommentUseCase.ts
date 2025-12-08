import { type ICommentRepository } from '../../ports/repositories/ICommentRepository.js';
import { createForbiddenError, createNotFoundError } from '@littlehelper/shared';

export class DeleteCommentUseCase {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(commentId: string, userId: string, isAdmin: boolean): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw createNotFoundError('Comment');
    }

    if (comment.authorId !== userId && !isAdmin) {
      throw createForbiddenError();
    }

    await this.commentRepository.delete(commentId);
  }
}
