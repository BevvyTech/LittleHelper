import { type FastifyInstance, type FastifyRequest, type FastifyReply } from 'fastify';
import { GetThreadByAnchorUseCase } from '../../../application/usecases/comments/GetThreadByAnchorUseCase.js';
import { CreateCommentUseCase } from '../../../application/usecases/comments/CreateCommentUseCase.js';
import { DeleteCommentUseCase } from '../../../application/usecases/comments/DeleteCommentUseCase.js';
import { GetCommentsForPageUseCase } from '../../../application/usecases/comments/GetCommentsForPageUseCase.js';
import {
  type ICommentThreadRepository,
  type ICommentRepository,
  type IUserRepository,
  type ISessionRepository,
} from '../../../application/ports/repositories/index.js';
import { createAuthMiddleware, createAdminMiddleware } from '../../../server/middlewares/index.js';

export function createCommentsController(deps: {
  threadRepository: ICommentThreadRepository;
  commentRepository: ICommentRepository;
  userRepository: IUserRepository;
  sessionRepository: ISessionRepository;
}) {
  const getThread = new GetThreadByAnchorUseCase(deps.threadRepository, deps.commentRepository);
  const createComment = new CreateCommentUseCase(deps.threadRepository, deps.commentRepository);
  const deleteComment = new DeleteCommentUseCase(deps.commentRepository);
  const getCommentsForPage = new GetCommentsForPageUseCase(
    deps.threadRepository,
    deps.commentRepository
  );

  const authMiddleware = createAuthMiddleware({
    userRepository: deps.userRepository,
    sessionRepository: deps.sessionRepository,
  });
  const adminMiddleware = createAdminMiddleware();

  return async function commentsRoutes(app: FastifyInstance) {
    app.get<{ Params: { pageLocaleId: string } }>('/pages/:pageLocaleId/comments', async (request) => {
      const threads = await getCommentsForPage.execute(request.params.pageLocaleId);
      return { data: threads };
    });

    app.get<{ Params: { anchorId: string } }>('/comments/thread/:anchorId', async (request) => {
      const anchorId = request.params.anchorId;
      const thread = await deps.threadRepository.findByAnchorId(anchorId);
      if (!thread) {
        return { data: null };
      }
      const comments = await deps.commentRepository.findByThreadId(thread.id);
      return { data: { thread, comments } };
    });

    app.post<
      FastifyRequest<{ Body: { anchorId: string; pageLocaleId: string; body: string } }>
    >('/comments', { preHandler: authMiddleware }, async (request) => {
      const user = request.user!;
      const result = await createComment.execute({
        anchorId: request.body.anchorId,
        pageLocaleId: request.body.pageLocaleId,
        body: request.body.body,
        userId: user.id,
      });
      return { data: result };
    });

    app.delete<{ Params: { id: string } }>(
      '/comments/:id',
      { preHandler: authMiddleware },
      async (request) => {
        const user = request.user!;
        await deleteComment.execute(request.params.id, user.id, user.isAdmin());
        return { data: { deleted: true } };
      }
    );

    app.delete<{ Params: { id: string } }>(
      '/admin/comments/:id',
      { preHandler: [authMiddleware, adminMiddleware] },
      async (request) => {
        await deps.commentRepository.delete(request.params.id);
        return { data: { deleted: true } };
      }
    );

    app.get('/admin/comments', { preHandler: [authMiddleware, adminMiddleware] }, async () => {
      const result = await deps.commentRepository.findAllWithContext();
      return { data: result };
    });

    app.get<{ Params: { id: string } }>(
      '/admin/comments/:id',
      { preHandler: [authMiddleware, adminMiddleware] },
      async (request, reply: FastifyReply) => {
        const comment = await deps.commentRepository.findById(request.params.id);
        if (!comment) {
          return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Comment not found' } });
        }
        const thread = await deps.threadRepository.findById(comment.threadId);
        return { data: { comment, thread } };
      }
    );
  };
}
