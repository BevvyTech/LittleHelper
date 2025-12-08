import { type FastifyInstance, type FastifyRequest } from 'fastify';
import { GenerateSeoMetadataUseCase, BulkGenerateSeoUseCase } from '../../../application/usecases/seo/index.js';
import { type IGeminiGateway } from '../../../application/ports/gateways/IGeminiGateway.js';
import {
  type IPageLocaleRepository,
  type IPageRepository,
} from '../../../application/ports/repositories/index.js';

export function createSeoController(deps: {
  pageRepository: IPageRepository;
  pageLocaleRepository: IPageLocaleRepository;
  geminiGateway: IGeminiGateway;
  loadContent: (path: string) => Promise<string>;
}) {
  const generateSeo = new GenerateSeoMetadataUseCase(
    deps.pageLocaleRepository,
    deps.geminiGateway
  );
  const bulkGenerate = new BulkGenerateSeoUseCase(
    deps.pageRepository,
    deps.pageLocaleRepository,
    deps.geminiGateway
  );

  return async function seoRoutes(app: FastifyInstance) {
    app.post<{ Params: { pageLocaleId: string }; Body: { content: string } }>(
      '/generate/:pageLocaleId',
      async (request) => {
        const { pageLocaleId } = request.params;
        const { content } = request.body;
        const result = await generateSeo.execute(pageLocaleId, content);
        return { data: result };
      }
    );

    app.post('/generate-all', async () => {
      const result = await bulkGenerate.execute(deps.loadContent);
      return { data: result };
    });

    app.post('/test-connection', async () => {
      const result = await deps.geminiGateway.testConnection();
      return { data: result };
    });
  };
}
