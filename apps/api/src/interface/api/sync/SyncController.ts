import { type FastifyInstance, type FastifyRequest } from 'fastify';
import {
  CommitPageEditUseCase,
  SyncFromGithubUseCase,
  resolveContentSourceConfig,
} from '../../../application/usecases/sync/index.js';
import {
  type IPageRepository,
  type IPageLocaleRepository,
  type IRedirectRepository,
  type ISyncLogRepository,
  type ISettingsRepository,
  type IAnchorRepository,
} from '../../../application/ports/repositories/index.js';
import { GithubGateway } from '../../../infrastructure/gateways/GithubGateway.js';
import { BulkGenerateSeoUseCase } from '../../../application/usecases/seo/BulkGenerateSeoUseCase.js';
import { type IGeminiGateway } from '../../../application/ports/gateways/IGeminiGateway.js';

export function createSyncController(deps: {
  pageRepository: IPageRepository;
  pageLocaleRepository: IPageLocaleRepository;
  redirectRepository: IRedirectRepository;
  syncLogRepository: ISyncLogRepository;
  settingsRepository: ISettingsRepository;
  anchorRepository: IAnchorRepository;
  geminiGateway?: IGeminiGateway;
}) {
  const syncFromGithub = new SyncFromGithubUseCase(
    deps.pageRepository,
    deps.pageLocaleRepository,
    deps.redirectRepository,
    deps.syncLogRepository,
    deps.settingsRepository,
    deps.anchorRepository
  );
  const commitPageEdit = new CommitPageEditUseCase(deps.settingsRepository, deps.anchorRepository);
  const bulkSeo = deps.geminiGateway
    ? new BulkGenerateSeoUseCase(
        deps.pageRepository,
        deps.pageLocaleRepository,
        deps.geminiGateway
      )
    : null;

  return async function syncRoutes(app: FastifyInstance) {
    app.post('/trigger', async () => {
      await syncFromGithub.execute();
      return { data: { started: true } };
    });

    app.get('/status', async () => {
      const latest = await deps.syncLogRepository.findLatest();
      return { data: latest };
    });

    app.get('/logs', async (request: FastifyRequest<{ Querystring: { page?: string; pageSize?: string } }>) => {
      const page = request.query.page ? Number(request.query.page) : undefined;
      const pageSize = request.query.pageSize ? Number(request.query.pageSize) : undefined;
      const logs = await deps.syncLogRepository.findAll({ page, pageSize });
      return { data: logs };
    });

    app.post('/test-connection', async () => {
      const config = await resolveContentSourceConfig(deps.settingsRepository);
      const gateway = new GithubGateway(config);
      const result = await gateway.testConnection();
      return { data: result };
    });

    app.post(
      '/commit',
      async (
        request: FastifyRequest<{
          Body: { filePath: string; content: string; message: string; pageLocaleId?: string };
        }>
      ) => {
        const { filePath, content, message, pageLocaleId } = request.body;
        const result = await commitPageEdit.execute({ filePath, content, message, pageLocaleId });
        return { data: result };
      }
    );

    app.post('/generate-seo', async () => {
      if (!bulkSeo) {
        return { data: { skipped: true } };
      }
      const result = await bulkSeo.execute(async (markdownPath: string) => {
        const config = await resolveContentSourceConfig(deps.settingsRepository);
        const gateway = new GithubGateway(config);
        const workingDir = (await import('../../../application/usecases/sync/SyncFromGithubUseCase.js')).getWorkingDir(
          config.repositoryUrl
        );
        await gateway.clone(workingDir);
        await gateway.pull(workingDir);
        return gateway.readFile(workingDir, markdownPath);
      });
      return { data: result };
    });
  };
}
