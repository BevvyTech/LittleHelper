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
  storageS3Endpoint: z.string().url().optional(),
  storageS3Bucket: z.string().optional(),
  storageS3Region: z.string().optional(),
  storageS3AccessKey: z.string().optional(),
  storageS3SecretKey: z.string().optional(),
  storagePublicUrl: z.string().url().optional(),
  storageSecureMode: z.coerce.boolean().default(true),

  geminiApiKey: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.storageType === 's3') {
    const requiredFields = [
      'storageS3Bucket',
      'storageS3Region',
      'storageS3AccessKey',
      'storageS3SecretKey',
    ] as const;
    for (const field of requiredFields) {
      if (!(data as Record<string, unknown>)[field]) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: 'Required when STORAGE_TYPE=s3',
        });
      }
    }
  }
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
    storageS3Endpoint: process.env['STORAGE_S3_ENDPOINT'],
    storageS3Bucket: process.env['STORAGE_S3_BUCKET'],
    storageS3Region: process.env['STORAGE_S3_REGION'],
    storageS3AccessKey: process.env['STORAGE_S3_ACCESS_KEY'],
    storageS3SecretKey: process.env['STORAGE_S3_SECRET_KEY'],
    storagePublicUrl: process.env['STORAGE_PUBLIC_URL'] ?? process.env['STORAGE_S3_PUBLIC_URL'],
    storageSecureMode: process.env['STORAGE_SECURE_MODE'],
    geminiApiKey: process.env['GEMINI_API_KEY'],
  });

  if (!result.success) {
    const issues = formatConfigErrors(result.error.format());
    console.error('Invalid configuration detected. Please set required environment variables:');
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  return result.data;
}

function formatConfigErrors(errorFormat: Record<string, any>): string[] {
  const messages: string[] = [];
  for (const [key, value] of Object.entries(errorFormat)) {
    if (key === '_errors') continue;
    const errs = (value as { _errors?: string[] } | undefined)?._errors;
    if (errs && errs.length > 0) {
      messages.push(`${envNameForKey(key)}: ${errs.join(', ')}`);
    }
  }
  return messages.length > 0 ? messages : ['Check DATABASE_URL, SESSION_SECRET, APP_URL'];
}

function envNameForKey(key: string): string {
  const mapping: Record<string, string> = {
    databaseUrl: 'DATABASE_URL',
    sessionSecret: 'SESSION_SECRET',
    appUrl: 'APP_URL',
    googleClientId: 'GOOGLE_CLIENT_ID',
    googleClientSecret: 'GOOGLE_CLIENT_SECRET',
    storageType: 'STORAGE_TYPE',
    storageLocalPath: 'STORAGE_LOCAL_PATH',
    storageS3Endpoint: 'STORAGE_S3_ENDPOINT',
    storageS3Bucket: 'STORAGE_S3_BUCKET',
    storageS3Region: 'STORAGE_S3_REGION',
    storageS3AccessKey: 'STORAGE_S3_ACCESS_KEY',
    storageS3SecretKey: 'STORAGE_S3_SECRET_KEY',
    storagePublicUrl: 'STORAGE_PUBLIC_URL',
    storageSecureMode: 'STORAGE_SECURE_MODE',
    geminiApiKey: 'GEMINI_API_KEY',
    port: 'PORT',
    host: 'HOST',
    nodeEnv: 'NODE_ENV',
    logLevel: 'LOG_LEVEL',
  };
  return mapping[key] ?? key;
}
