import { type FastifyInstance, type FastifyRequest } from 'fastify';
import {
  CreateReleaseUseCase,
  GetReleasesUseCase,
  GetReleaseByTagUseCase,
  DeleteReleaseUseCase,
} from '../../../application/usecases/releases/index.js';
import { type IReleaseRepository, type IPageLocaleRepository } from '../../../application/ports/repositories/index.js';
import { type IGithubTagGateway } from '../../../application/ports/gateways/IGithubGateway.js';
import { createAdminMiddleware, createAuthMiddleware } from '../../../server/middlewares/index.js';
import { type IUserRepository, type ISessionRepository } from '../../../application/ports/repositories/index.js';

export function createReleaseController(deps: {
  releaseRepository: IReleaseRepository;
  pageLocaleRepository: IPageLocaleRepository;
  githubTagGateway: IGithubTagGateway;
  userRepository: IUserRepository;
  sessionRepository: ISessionRepository;
  workingDir: string;
}) {
  const createRelease = new CreateReleaseUseCase(
    deps.releaseRepository,
    deps.pageLocaleRepository,
    deps.githubTagGateway
  );
  const getReleases = new GetReleasesUseCase(deps.releaseRepository);
  const getReleaseByTag = new GetReleaseByTagUseCase(deps.releaseRepository);
  const deleteRelease = new DeleteReleaseUseCase(deps.releaseRepository);

  const authMiddleware = createAuthMiddleware({
    userRepository: deps.userRepository,
    sessionRepository: deps.sessionRepository,
  });
  const adminMiddleware = createAdminMiddleware();

  return async function releaseRoutes(app: FastifyInstance) {
    app.get('/', async () => {
      const releases = await getReleases.execute();
      return { data: releases };
    });

    app.get<{ Params: { tag: string } }>('/:tag', async (request) => {
      const data = await getReleaseByTag.execute(request.params.tag);
      return { data };
    });

    app.post<
      FastifyRequest<{
        Body: { tag: string; name: string; description?: string | null };
      }>
    >('/', { preHandler: [authMiddleware, adminMiddleware] }, async (request) => {
      const result = await createRelease.execute({
        tag: request.body.tag,
        name: request.body.name,
        description: request.body.description,
        workingDir: deps.workingDir,
      });
      return { data: result };
    });

    app.delete<{ Params: { tag: string } }>(
      '/:tag',
      { preHandler: [authMiddleware, adminMiddleware] },
      async (request) => {
        await deleteRelease.execute(request.params.tag);
        return { data: { deleted: true } };
      }
    );
  };
}
