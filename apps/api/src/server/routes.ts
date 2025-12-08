import { type FastifyInstance } from 'fastify';
import { createAuthController } from '../interface/api/auth/index.js';
import { createSettingsController } from '../interface/api/settings/index.js';
import { createSyncController } from '../interface/api/sync/index.js';
import { createPagesController } from '../interface/api/pages/index.js';
import { createCommentsController } from '../interface/api/comments/index.js';
import { createSeoController } from '../interface/api/seo/index.js';
import { createReleaseController } from '../interface/api/releases/index.js';
import { prisma } from '../infrastructure/prisma/index.js';
import {
  UserRepositoryPrisma,
  SessionRepositoryPrisma,
  SettingsRepositoryPrisma,
  PageRepositoryPrisma,
  PageLocaleRepositoryPrisma,
  RedirectRepositoryPrisma,
  SyncLogRepositoryPrisma,
  AnchorRepositoryPrisma,
  CommentThreadRepositoryPrisma,
  CommentRepositoryPrisma,
  ReleaseRepositoryPrisma,
} from '../infrastructure/repositories/index.js';
import { OAuthGoogleGateway, GeminiGateway, GithubTagGateway } from '../infrastructure/gateways/index.js';
import { createAdminMiddleware, createAuthMiddleware } from './middlewares/index.js';
import { GetPageBySlugUseCase, CheckRedirectUseCase } from '../application/usecases/content/index.js';
import { resolveContentSourceConfig, getWorkingDir } from '../application/usecases/sync/SyncFromGithubUseCase.js';
import { ReleaseContentResolver, SSRReleaseRenderer } from '../interface/ssr/index.js';
import { isValidLocale } from '@littlehelper/shared';
import { type Config } from './config.js';

export async function registerRoutes(app: FastifyInstance, config: Config): Promise<void> {
  const userRepository = new UserRepositoryPrisma(prisma);
  const sessionRepository = new SessionRepositoryPrisma(prisma);
  const settingsRepository = new SettingsRepositoryPrisma(prisma);
  const pageRepository = new PageRepositoryPrisma(prisma);
  const pageLocaleRepository = new PageLocaleRepositoryPrisma(prisma);
  const redirectRepository = new RedirectRepositoryPrisma(prisma);
  const syncLogRepository = new SyncLogRepositoryPrisma(prisma);
  const anchorRepository = new AnchorRepositoryPrisma(prisma);
  const commentThreadRepository = new CommentThreadRepositoryPrisma(prisma);
  const commentRepository = new CommentRepositoryPrisma(prisma);
  const releaseRepository = new ReleaseRepositoryPrisma(prisma);
  const aiSettings = await settingsRepository.findByKey('ai');
  const geminiKey =
    config.geminiApiKey ?? ((aiSettings?.data as { geminiApiKey?: string } | undefined)?.geminiApiKey ?? null);
  const contentSourceConfig = await resolveContentSourceConfig(settingsRepository);
  const contentWorkingDir = getWorkingDir(contentSourceConfig.repositoryUrl);
  const githubTagGateway = new GithubTagGateway(contentSourceConfig);
  const releaseContentResolver = new ReleaseContentResolver(releaseRepository, pageLocaleRepository, githubTagGateway);
  const releaseRenderer = new SSRReleaseRenderer(releaseContentResolver);

  const oauthGateway = new OAuthGoogleGateway(
    config.googleClientId ?? '',
    config.googleClientSecret ?? '',
    `${config.appUrl}/auth/google/callback`
  );
  const getPageBySlug = new GetPageBySlugUseCase(pageRepository, pageLocaleRepository);
  const checkRedirect = new CheckRedirectUseCase(redirectRepository);
  const geminiGateway = geminiKey ? new GeminiGateway(geminiKey) : null;

  app.get('/healthz', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  const authController = createAuthController({
    userRepository,
    sessionRepository,
    oauthGateway,
    appUrl: config.appUrl,
    isProduction: config.nodeEnv === 'production',
  });
  await app.register(authController, { prefix: '/auth' });

  app.register(
    async (api) => {
      api.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
      });

      await api.register(async (adminApi) => {
        const authMiddleware = createAuthMiddleware({ userRepository, sessionRepository });
        const adminMiddleware = createAdminMiddleware();
        adminApi.addHook('onRequest', authMiddleware);
        adminApi.addHook('onRequest', adminMiddleware);

        const settingsController = createSettingsController({ settingsRepository });
        await adminApi.register(settingsController, { prefix: '/settings' });

        const syncController = createSyncController({
          pageRepository,
          pageLocaleRepository,
          redirectRepository,
          syncLogRepository,
          settingsRepository,
          anchorRepository,
          geminiGateway: geminiGateway ?? undefined,
        });
        await adminApi.register(syncController, { prefix: '/sync' });

        const pagesController = createPagesController({
          pageRepository,
          pageLocaleRepository,
          settingsRepository,
          anchorRepository,
        });
        await adminApi.register(pagesController, { prefix: '/pages' });

        if (geminiGateway) {
          const seoController = createSeoController({
            pageRepository,
            pageLocaleRepository,
            geminiGateway,
            loadContent: async (markdownPath: string) => {
              const sourceConfig = await resolveContentSourceConfig(settingsRepository);
              const gateway = new (await import('../infrastructure/gateways/GithubGateway.js')).GithubGateway(
                sourceConfig
              );
              const workingDir = getWorkingDir(sourceConfig.repositoryUrl);
              await gateway.clone(workingDir);
              await gateway.pull(workingDir);
              return gateway.readFile(workingDir, markdownPath);
            },
          });
          await adminApi.register(seoController, { prefix: '/seo' });
        }
      }, { prefix: '/admin' });

      const commentsController = createCommentsController({
        threadRepository: commentThreadRepository,
        commentRepository,
        userRepository,
        sessionRepository,
      });
      await api.register(commentsController);

      const releaseController = createReleaseController({
        releaseRepository,
        pageLocaleRepository,
        githubTagGateway,
        userRepository,
        sessionRepository,
        workingDir: contentWorkingDir,
      });
      await api.register(releaseController, { prefix: '/releases' });
    },
    { prefix: '/api' }
  );

  app.get<{ Params: { locale: string; '*': string } }>(
    '/:locale/*',
    async (request, reply) => {
      const locale = request.params.locale;
      const slug = (request.params['*'] ?? '').replace(/^\/+|\/+$/g, '');

      if (!isValidLocale(locale)) {
        return reply.callNotFound();
      }

      const redirect = await checkRedirect.execute({ locale, slug });
      if (redirect.hasRedirect && redirect.newPath) {
        return reply.redirect(301, redirect.newPath);
      }

      const page = await getPageBySlug.execute({ locale, slug });
      return { data: page };
    }
  );

  app.get<{ Params: { tag: string; locale: string; '*': string } }>(
    '/releases/:tag/:locale/*',
    async (request, reply) => {
      const { tag, locale } = request.params;
      const slug = (request.params['*'] ?? '').replace(/^\/+|\/+$/g, '');
      return releaseRenderer.render(reply, { tag, locale, slug });
    }
  );
}
