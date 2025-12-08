import { type SupportedLocale, createNotFoundError, isValidLocale } from '@littlehelper/shared';
import { GetReleaseContentUseCase } from '../../application/usecases/releases/index.js';
import { type IReleaseRepository, type IPageLocaleRepository } from '../../application/ports/repositories/index.js';
import { type IGithubTagGateway } from '../../application/ports/gateways/IGithubGateway.js';

export class ReleaseContentResolver {
  private readonly getReleaseContent: GetReleaseContentUseCase;

  constructor(
    private readonly releaseRepository: IReleaseRepository,
    private readonly pageLocaleRepository: IPageLocaleRepository,
    private readonly githubTagGateway: IGithubTagGateway
  ) {
    this.getReleaseContent = new GetReleaseContentUseCase(releaseRepository, githubTagGateway);
  }

  async resolve(tag: string, locale: SupportedLocale, slug: string) {
    if (!isValidLocale(locale)) {
      throw createNotFoundError('Locale');
    }

    let pageLocale = await this.pageLocaleRepository.findBySlug(locale, slug);
    if (!pageLocale) {
      const release = await this.releaseRepository.findByTag(tag);
      if (!release) {
        throw createNotFoundError('Release');
      }
      const snapshots = await this.releaseRepository.getSnapshotByRelease(release.id);
      const snapshotMatch = snapshots.find((snap) => snap.slugAtRelease === slug);
      if (!snapshotMatch) {
        throw createNotFoundError('Release snapshot');
      }
      pageLocale = await this.pageLocaleRepository.findById(snapshotMatch.pageLocaleId);
      if (!pageLocale) {
        throw createNotFoundError('PageLocale');
      }
    }

    const result = await this.getReleaseContent.execute(tag, pageLocale.id, pageLocale.markdownPath);
    return {
      release: result.release,
      snapshot: result.snapshot,
      pageLocale,
      content: result.content,
    };
  }
}
