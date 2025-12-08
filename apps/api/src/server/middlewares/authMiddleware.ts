import { type FastifyRequest, type FastifyReply } from 'fastify';
import { type IUserRepository } from '../../application/ports/repositories/IUserRepository.js';
import { type ISessionRepository } from '../../application/ports/repositories/ISessionRepository.js';
import { type User } from '../../domain/users/User.js';

const SESSION_COOKIE_NAME = 'lh_session';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}

export function createAuthMiddleware(deps: {
  userRepository: IUserRepository;
  sessionRepository: ISessionRepository;
}) {
  return async function authMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const sessionToken = request.cookies[SESSION_COOKIE_NAME];

    if (!sessionToken) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }

    const session = await deps.sessionRepository.findByToken(sessionToken);

    if (!session || !session.isValid()) {
      reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Session expired' },
      });
    }

    const user = await deps.userRepository.findById(session.userId);

    if (!user || user.isBanned()) {
      reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'User not found or banned' },
      });
    }

    request.user = user;
  };
}

export function createAdminMiddleware() {
  return async function adminMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }

    if (!request.user.isAdmin()) {
      return reply.status(403).send({
        error: { code: 'AUTH_FORBIDDEN', message: 'Admin access required' },
      });
    }
  };
}
