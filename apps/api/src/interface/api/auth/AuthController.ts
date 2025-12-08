import { type FastifyInstance, type FastifyRequest, type FastifyReply } from 'fastify';
import { AuthenticateUserUseCase } from '../../../application/usecases/auth/AuthenticateUserUseCase.js';
import { GetCurrentUserUseCase } from '../../../application/usecases/auth/GetCurrentUserUseCase.js';
import { LogoutUserUseCase } from '../../../application/usecases/auth/LogoutUserUseCase.js';
import { type IOAuthGateway } from '../../../application/ports/gateways/IOAuthGateway.js';
import { type IUserRepository } from '../../../application/ports/repositories/IUserRepository.js';
import { type ISessionRepository } from '../../../application/ports/repositories/ISessionRepository.js';
import { LoginCallbackSchema } from '@littlehelper/shared';

const SESSION_COOKIE_NAME = 'lh_session';

export function createAuthController(deps: {
  userRepository: IUserRepository;
  sessionRepository: ISessionRepository;
  oauthGateway: IOAuthGateway;
  appUrl: string;
  isProduction: boolean;
}) {
  const authenticateUser = new AuthenticateUserUseCase(
    deps.userRepository,
    deps.sessionRepository,
    deps.oauthGateway
  );
  const getCurrentUser = new GetCurrentUserUseCase(deps.userRepository, deps.sessionRepository);
  const logoutUser = new LogoutUserUseCase(deps.sessionRepository);

  return async function authRoutes(app: FastifyInstance) {
    app.get('/google', async (_request: FastifyRequest, reply: FastifyReply) => {
      const state = crypto.randomUUID();
      const authUrl = deps.oauthGateway.getAuthorizationUrl(state);
      return reply.redirect(authUrl);
    });

    app.get('/google/callback', async (request: FastifyRequest, reply: FastifyReply) => {
      const query = LoginCallbackSchema.parse(request.query);

      const result = await authenticateUser.execute({ code: query.code });

      reply.setCookie(SESSION_COOKIE_NAME, result.sessionToken, {
        path: '/',
        httpOnly: true,
        secure: deps.isProduction,
        sameSite: 'lax',
        expires: result.expiresAt,
      });

      return reply.redirect(deps.appUrl + '/admin');
    });

    app.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionToken = request.cookies[SESSION_COOKIE_NAME];

      if (!sessionToken) {
        return reply
          .status(401)
          .send({ error: { code: 'AUTH_REQUIRED', message: 'Not authenticated' } });
      }

      const user = await getCurrentUser.execute(sessionToken);
      return { data: user };
    });

    app.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionToken = request.cookies[SESSION_COOKIE_NAME];

      if (sessionToken) {
        await logoutUser.execute(sessionToken);
      }

      reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
      return { data: { success: true } };
    });
  };
}
