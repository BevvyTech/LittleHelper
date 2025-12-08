import { type IReleaseRepository } from '../../ports/repositories/IReleaseRepository.js';
import { createNotFoundError } from '@littlehelper/shared';

export class GetReleaseByTagUseCase {
  constructor(private readonly releaseRepository: IReleaseRepository) {}

  async execute(tag: string) {
    const release = await this.releaseRepository.findByTag(tag);
    if (!release) {
      throw createNotFoundError('Release');
    }
    const snapshots = await this.releaseRepository.getSnapshotByRelease(release.id);
    return { release, snapshots };
  }
}
