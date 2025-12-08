import { type ICommentThreadRepository } from '../../ports/repositories/ICommentThreadRepository.js';
import { type ICommentRepository } from '../../ports/repositories/ICommentRepository.js';

export class GetCommentsForPageUseCase {
  constructor(
    private readonly threadRepository: ICommentThreadRepository,
    private readonly commentRepository: ICommentRepository
  ) {}

  async execute(pageLocaleId: string) {
    const threads = await this.threadRepository.findByPageLocaleId(pageLocaleId);
    const results = [];
    for (const thread of threads) {
      const comments = await this.commentRepository.findByThreadId(thread.id);
      results.push({ thread, comments });
    }
    return results;
  }
}
