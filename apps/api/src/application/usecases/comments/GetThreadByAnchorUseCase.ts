import { type ICommentThreadRepository } from '../../ports/repositories/ICommentThreadRepository.js';
import { type ICommentRepository } from '../../ports/repositories/ICommentRepository.js';

export interface GetThreadByAnchorInput {
  anchorId: string;
  pageLocaleId: string;
  userId?: string | null;
}

export class GetThreadByAnchorUseCase {
  constructor(
    private readonly threadRepository: ICommentThreadRepository,
    private readonly commentRepository: ICommentRepository
  ) {}

  async execute(input: GetThreadByAnchorInput) {
    let thread = await this.threadRepository.findByAnchorId(input.anchorId);

    if (!thread) {
      thread = await this.threadRepository.create({
        anchorId: input.anchorId,
        pageLocaleId: input.pageLocaleId,
        createdById: input.userId ?? null,
      });
    }

    const comments = await this.commentRepository.findByThreadId(thread.id);
    return { thread, comments };
  }
}
