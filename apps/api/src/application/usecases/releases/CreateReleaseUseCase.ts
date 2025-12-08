import { type IReleaseRepository, type IPageLocaleRepository } from '../../ports/repositories/index.js';
import { type IGithubTagGateway } from '../../ports/gateways/IGithubGateway.js';
import { Release } from '../../../domain/releases/Release.js';
import { createConflictError, createValidationError } from '@littlehelper/shared';

export interface CreateReleaseInput {
  tag: string;
  name: string;
  description?: string | null;
  workingDir: string;
}

export class CreateReleaseUseCase {
  constructor(
    private readonly releaseRepository: IReleaseRepository,
    private readonly pageLocaleRepository: IPageLocaleRepository,
    private readonly githubTagGateway: IGithubTagGateway
  ) {}

  async execute(input: CreateReleaseInput) {
    if (!Release.validateTag(input.tag)) {
      throw createValidationError({ tag: 'Invalid tag format' });
    }

    const existing = await this.releaseRepository.findByTag(input.tag);
    if (existing) {
      throw createConflictError('Release tag already exists');
    }

    if (this.githubTagGateway.prepareRepo) {
      await this.githubTagGateway.prepareRepo(input.workingDir);
    }
    await this.githubTagGateway.createTag(input.workingDir, input.tag, input.description ?? 'Release');
    await this.githubTagGateway.pushTag(input.workingDir, input.tag);

    const release = await this.releaseRepository.create({
      tag: input.tag,
      name: input.name,
      description: input.description,
    });

    const locales = await this.pageLocaleRepository.findAll();
    await this.releaseRepository.createSnapshot(
      release.id,
      locales.map((locale) => ({
        pageLocaleId: locale.id,
        slugAtRelease: locale.slug,
        titleAtRelease: locale.title,
      }))
    );

    return release;
  }
}
