import { type IReleaseRepository } from '../../ports/repositories/IReleaseRepository.js';
import { createNotFoundError } from '@littlehelper/shared';

export class DeleteReleaseUseCase {
  constructor(private readonly releaseRepository: IReleaseRepository) {}

  async execute(tag: string): Promise<void> {
    const existing = await this.releaseRepository.findByTag(tag);
    if (!existing) {
      throw createNotFoundError('Release');
    }
    await this.releaseRepository.delete(tag);
  }
}
