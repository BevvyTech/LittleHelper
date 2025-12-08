import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';

import { loadConfig } from './config.js';
import { errorHandler } from './middlewares/index.js';
import { registerRoutes } from './routes.js';

async function main() {
  const config = loadConfig();

  const app = Fastify({
    logger: {
      level: config.logLevel,
      transport:
        config.nodeEnv === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // Register plugins
  await app.register(cors, {
    origin: config.nodeEnv === 'development' ? true : config.appUrl,
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: config.nodeEnv === 'production',
  });

  await app.register(cookie, {
    secret: config.sessionSecret,
    parseOptions: {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
    },
  });

  // Error handler
  app.setErrorHandler(errorHandler);

  // Register routes
  await registerRoutes(app, config);

  // Start server
  try {
    await app.listen({ port: config.port, host: config.host });
    console.log(`Server listening on http://${config.host}:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main().catch(console.error);
