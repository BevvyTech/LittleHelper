import { type FastifyInstance } from 'fastify';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Health check
  app.get('/healthz', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API routes
  app.register(
    async (api) => {
      // Health check at API level
      api.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
      });

      // Public API routes will be registered here
      // api.register(pagesRoutes, { prefix: '/pages' });
      // api.register(releasesRoutes, { prefix: '/releases' });
      // api.register(commentsRoutes, { prefix: '/comments' });

      // Admin API routes will be registered here
      // api.register(adminRoutes, { prefix: '/admin' });
    },
    { prefix: '/api' }
  );

  // Auth routes
  app.register(
    async (auth) => {
      // OAuth routes will be registered here
      // auth.get('/google', googleAuthHandler);
      // auth.get('/google/callback', googleCallbackHandler);

      auth.get('/google', async () => {
        return { message: 'Google OAuth not yet implemented' };
      });
    },
    { prefix: '/auth' }
  );
}
