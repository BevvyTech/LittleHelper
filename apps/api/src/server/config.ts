import { z } from 'zod';

const configSchema = z.object({
  port: z.coerce.number().default(3000),
  host: z.string().default('0.0.0.0'),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  databaseUrl: z.string(),

  sessionSecret: z.string().min(32),
  appUrl: z.string().url(),

  googleClientId: z.string().optional(),
  googleClientSecret: z.string().optional(),

  storageType: z.enum(['local', 's3']).default('local'),
  storageLocalPath: z.string().default('./uploads'),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const result = configSchema.safeParse({
    port: process.env['PORT'],
    host: process.env['HOST'],
    nodeEnv: process.env['NODE_ENV'],
    logLevel: process.env['LOG_LEVEL'],
    databaseUrl: process.env['DATABASE_URL'],
    sessionSecret: process.env['SESSION_SECRET'],
    appUrl: process.env['APP_URL'],
    googleClientId: process.env['GOOGLE_CLIENT_ID'],
    googleClientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    storageType: process.env['STORAGE_TYPE'],
    storageLocalPath: process.env['STORAGE_LOCAL_PATH'],
  });

  if (!result.success) {
    console.error('Invalid configuration:', result.error.format());
    process.exit(1);
  }

  return result.data;
}
