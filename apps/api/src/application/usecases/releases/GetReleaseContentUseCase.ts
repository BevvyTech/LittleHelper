import { type IGithubTagGateway } from '../../ports/gateways/IGithubGateway.js';
import { type IReleaseRepository } from '../../ports/repositories/IReleaseRepository.js';
import { createNotFoundError } from '@littlehelper/shared';
import path from 'node:path';
import fs from 'node:fs/promises';

export class GetReleaseContentUseCase {
  constructor(
    private readonly releaseRepository: IReleaseRepository,
    private readonly githubTagGateway: IGithubTagGateway
  ) {}

  async execute(tag: string, pageLocaleId: string, markdownPath: string) {
    const release = await this.releaseRepository.findByTag(tag);
    if (!release) {
      throw createNotFoundError('Release');
    }

    const snapshots = await this.releaseRepository.getSnapshotByRelease(release.id);
    const snapshot = snapshots.find((s) => s.pageLocaleId === pageLocaleId);
    if (!snapshot) {
      throw createNotFoundError('Release snapshot');
    }

    const workingDir = path.resolve('.github-releases', tag);
    await fs.mkdir(workingDir, { recursive: true });
    if (this.githubTagGateway.prepareRepo) {
      await this.githubTagGateway.prepareRepo(workingDir);
    }
    await this.githubTagGateway.checkoutTag(workingDir, tag);
    const content = await this.githubTagGateway.readFile(workingDir, markdownPath);

    return { release, snapshot, content };
  }
}
