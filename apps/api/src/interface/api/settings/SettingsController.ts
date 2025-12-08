import { type FastifyInstance, type FastifyRequest, type FastifyReply } from 'fastify';
import { GetSettingsUseCase } from '../../../application/usecases/settings/GetSettingsUseCase.js';
import { UpdateSettingsUseCase } from '../../../application/usecases/settings/UpdateSettingsUseCase.js';
import { type ISettingsRepository } from '../../../application/ports/repositories/ISettingsRepository.js';
import { SettingGroupKeySchema } from '@littlehelper/shared';

export function createSettingsController(deps: { settingsRepository: ISettingsRepository }) {
  const getSettings = new GetSettingsUseCase(deps.settingsRepository);
  const updateSettings = new UpdateSettingsUseCase(deps.settingsRepository);

  return async function settingsRoutes(app: FastifyInstance) {
    app.get(
      '/:group',
      async (
        request: FastifyRequest<{ Params: { group: string } }>,
        reply: FastifyReply
      ) => {
        const { group } = request.params;
        SettingGroupKeySchema.parse(group);

        const data = await getSettings.execute(group);
        return { data };
      }
    );

    app.put(
      '/:group',
      async (
        request: FastifyRequest<{ Params: { group: string }; Body: Record<string, unknown> }>,
        reply: FastifyReply
      ) => {
        const { group } = request.params;
        SettingGroupKeySchema.parse(group);

        const data = await updateSettings.execute(group, request.body);
        return { data };
      }
    );

    app.get('/env-status', async () => {
      return {
        data: {
          github: {
            repositoryUrl: !!process.env['GITHUB_REPO_URL'],
            branch: !!process.env['GITHUB_BRANCH'],
            contentPath: !!process.env['GITHUB_CONTENT_PATH'],
            authMethod: !!process.env['GITHUB_AUTH_METHOD'],
            pat: !!process.env['GITHUB_PAT'],
            appId: !!process.env['GITHUB_APP_ID'],
            appPrivateKey: !!process.env['GITHUB_APP_PRIVATE_KEY'],
            appInstallationId: !!process.env['GITHUB_APP_INSTALLATION_ID'],
          },
          storage: {
            type: !!process.env['STORAGE_TYPE'],
            localPath: !!process.env['STORAGE_LOCAL_PATH'],
            s3Endpoint: !!process.env['STORAGE_S3_ENDPOINT'],
            s3Bucket: !!process.env['STORAGE_S3_BUCKET'],
            s3Region: !!process.env['STORAGE_S3_REGION'],
            s3AccessKey: !!process.env['STORAGE_S3_ACCESS_KEY'],
            s3SecretKey: !!process.env['STORAGE_S3_SECRET_KEY'],
            s3PublicUrl: !!process.env['STORAGE_S3_PUBLIC_URL'],
            secureMode: !!process.env['STORAGE_SECURE_MODE'],
          },
          ai: {
            geminiApiKey: !!process.env['GEMINI_API_KEY'],
          },
        },
      };
    });
  };
}
