import path from 'node:path';
import fs from 'node:fs/promises';
import {
  type IPageRepository,
  type IPageLocaleRepository,
  type IRedirectRepository,
  type ISyncLogRepository,
  type ISettingsRepository,
  type IAnchorRepository,
} from '../../ports/repositories/index.js';
import { GithubGateway, type GithubGatewayConfig } from '../../../infrastructure/gateways/GithubGateway.js';
import { FrontmatterParser } from '../../../infrastructure/markdown/FrontmatterParser.js';
import { type ContentSourceSettings, type AiSettings } from '@littlehelper/shared';
import { GenerateAnchorsUseCase } from '../anchors/GenerateAnchorsUseCase.js';
import { type IGeminiGateway } from '../../ports/gateways/IGeminiGateway.js';
import { GenerateSeoMetadataUseCase } from '../seo/GenerateSeoMetadataUseCase.js';

export interface ContentSourceConfig extends GithubGatewayConfig {
  contentPath: string;
}

export async function resolveContentSourceConfig(
  settingsRepository: ISettingsRepository
): Promise<ContentSourceConfig> {
  const settings = await settingsRepository.findByKey('content-source');
  const data = (settings?.data ?? {}) as Partial<ContentSourceSettings>;

  const repositoryUrl = process.env['GITHUB_REPO_URL'] ?? data.repositoryUrl;
  if (!repositoryUrl) {
    throw new Error('GitHub repository URL not configured');
  }

  const branch = process.env['GITHUB_BRANCH'] ?? data.branch ?? 'main';
  const contentPath = process.env['GITHUB_CONTENT_PATH'] ?? data.contentPath ?? 'docs';
  const authMethod = (process.env['GITHUB_AUTH_METHOD'] ?? data.authMethod ?? 'pat') as
    | 'pat'
    | 'app';

  const pat = process.env['GITHUB_PAT'] ?? data.pat;
  const appId = process.env['GITHUB_APP_ID'] ?? data.appId;
  const appPrivateKey = process.env['GITHUB_APP_PRIVATE_KEY'] ?? data.appPrivateKey;
  const appInstallationId =
    process.env['GITHUB_APP_INSTALLATION_ID'] ?? data.appInstallationId;

  return {
    repositoryUrl,
    branch,
    contentPath,
    authMethod,
    pat,
    appId,
    appPrivateKey,
    appInstallationId,
  };
}

function getRepoName(repositoryUrl: string): string {
  const { pathname } = new URL(repositoryUrl);
  const parts = pathname.replace(/\.git$/, '').split('/').filter(Boolean);
  return parts.slice(-1)[0] ?? 'repo';
}

export function getWorkingDir(repositoryUrl: string): string {
  return path.resolve('.github-repos', getRepoName(repositoryUrl));
}

export class SyncFromGithubUseCase {
  constructor(
    private readonly pageRepository: IPageRepository,
    private readonly pageLocaleRepository: IPageLocaleRepository,
    private readonly redirectRepository: IRedirectRepository,
    private readonly syncLogRepository: ISyncLogRepository,
    private readonly settingsRepository: ISettingsRepository,
    private readonly anchorRepository: IAnchorRepository,
    private readonly geminiGateway?: IGeminiGateway
  ) {
    this.generateAnchors = new GenerateAnchorsUseCase(this.anchorRepository);
    this.generateSeo =
      geminiGateway !== undefined
        ? new GenerateSeoMetadataUseCase(this.pageLocaleRepository, geminiGateway)
        : null;
  }

  private readonly generateAnchors: GenerateAnchorsUseCase;
  private readonly generateSeo: GenerateSeoMetadataUseCase | null;

  async execute(): Promise<void> {
    const config = await resolveContentSourceConfig(this.settingsRepository);
    const log = await this.syncLogRepository.create({
      status: 'RUNNING',
      message: 'Starting GitHub sync',
      startedAt: new Date(),
    });

    try {
      const workingDir = getWorkingDir(config.repositoryUrl);
      const gateway = new GithubGateway(config);
      const parser = new FrontmatterParser();
      const aiSettings = await this.getAiSettings();

      await this.ensureBaseDirExists(workingDir);
      await gateway.clone(workingDir);
      await gateway.pull(workingDir);

      const files = await gateway.listFiles(workingDir);
      const markdownFiles = files
        .filter((file) => file.endsWith('.md'))
        .filter((file) => file.startsWith(config.contentPath));

      const existingLocales = await this.pageLocaleRepository.findAll();
      const localesByPath = new Map(existingLocales.map((l) => [l.markdownPath, l]));

      const stats = { processed: 0, created: 0, updated: 0, redirects: 0, errors: [] as string[] };

      for (const file of markdownFiles) {
        stats.processed += 1;
        try {
          const content = await gateway.readFile(workingDir, file);
          const data = parser.parse(file, content);

          const parentLocale = await this.pageLocaleRepository.findBySlug(
            data.locale,
            data.parent
          );
          const parentId = parentLocale?.pageId ?? null;

          const existingByPath = localesByPath.get(file);
          const existingBySlug = await this.pageLocaleRepository.findBySlug(
            data.locale,
            data.slug
          );
          const targetLocale = existingByPath ?? existingBySlug ?? null;

          if (targetLocale) {
            if (targetLocale.slug !== data.slug) {
              await this.redirectRepository.create({
                oldSlug: targetLocale.slug,
                newSlug: data.slug,
                locale: data.locale,
              });
              stats.redirects += 1;
            }

            await this.pageRepository.update(targetLocale.pageId, {
              parentId,
              headerImage: data.headerImage ?? null,
            });

            await this.pageLocaleRepository.update(targetLocale.id, {
              title: data.title,
              slug: data.slug,
              summary: data.summary ?? null,
              keywords: data.keywords ?? [],
              markdownPath: file,
              headerImage: data.headerImage ?? null,
            });
            await this.generateAnchors.execute({
              pageLocaleId: targetLocale.id,
              content,
            });
            if (this.generateSeo && aiSettings.autoGenerateSeo && aiSettings.enabled) {
              await this.generateSeo.execute(targetLocale.id, content);
            }
            stats.updated += 1;
          } else {
            const page = await this.pageRepository.create({
              parentId,
              headerImage: data.headerImage ?? null,
            });

            const pageLocale = await this.pageLocaleRepository.create({
              pageId: page.id,
              locale: data.locale,
              title: data.title,
              slug: data.slug,
              markdownPath: file,
              summary: data.summary ?? null,
              keywords: data.keywords ?? [],
              headerImage: data.headerImage ?? null,
            });
            await this.generateAnchors.execute({
              pageLocaleId: pageLocale.id,
              content,
            });
            if (this.generateSeo && aiSettings.autoGenerateSeo && aiSettings.enabled) {
              await this.generateSeo.execute(pageLocale.id, content);
            }
            stats.created += 1;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          stats.errors.push(`${file}: ${message}`);
        }
      }

      await this.syncLogRepository.update(log.id, {
        status: 'SUCCESS',
        message: 'Sync completed',
        details: stats,
        finishedAt: new Date(),
      });
    } catch (error) {
      await this.syncLogRepository.update(log.id, {
        status: 'FAILURE',
        message: error instanceof Error ? error.message : 'Sync failed',
        finishedAt: new Date(),
      });
      throw error;
    }
  }

  private async ensureBaseDirExists(dir: string): Promise<void> {
    await fs.mkdir(path.dirname(dir), { recursive: true });
  }

  private async getAiSettings(): Promise<AiSettings> {
    const settings = await this.settingsRepository.findByKey('ai');
    return {
      geminiApiKey: '',
      enabled: false,
      autoGenerateSeo: false,
      ...(settings?.data as Partial<AiSettings>),
    };
  }
}

export { getWorkingDir };
