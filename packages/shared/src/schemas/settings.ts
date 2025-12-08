import { z } from 'zod';

export const SettingGroupKeySchema = z.enum([
  'general',
  'content-source',
  'storage',
  'ai',
]);

export const GeneralSettingsSchema = z.object({
  siteName: z.string().min(1).max(100).default('LittleHelper'),
  siteDescription: z.string().max(500).default(''),
  defaultLocale: z.string().default('en'),
  enableComments: z.boolean().default(true),
  enableReleases: z.boolean().default(true),
});

export const ContentSourceSettingsSchema = z.object({
  repositoryUrl: z.string().url().optional(),
  branch: z.string().default('main'),
  contentPath: z.string().default('docs'),
  authMethod: z.enum(['pat', 'app']).default('pat'),
  pat: z.string().optional(),
  appId: z.string().optional(),
  appPrivateKey: z.string().optional(),
  appInstallationId: z.string().optional(),
});

export const StorageSettingsSchema = z.object({
  type: z.enum(['local', 's3']).default('local'),
  localPath: z.string().default('./uploads'),
  s3Endpoint: z.string().url().optional(),
  s3Bucket: z.string().optional(),
  s3Region: z.string().optional(),
  s3AccessKey: z.string().optional(),
  s3SecretKey: z.string().optional(),
  s3PublicUrl: z.string().url().optional(),
  secureMode: z.boolean().default(false),
});

export const AiSettingsSchema = z.object({
  geminiApiKey: z.string().optional(),
  enabled: z.boolean().default(false),
  autoGenerateSeo: z.boolean().default(false),
});

export const EnvStatusResponseSchema = z.object({
  github: z.object({
    repositoryUrl: z.boolean(),
    branch: z.boolean(),
    contentPath: z.boolean(),
    authMethod: z.boolean(),
    pat: z.boolean(),
    appId: z.boolean(),
    appPrivateKey: z.boolean(),
    appInstallationId: z.boolean(),
  }),
  storage: z.object({
    type: z.boolean(),
    localPath: z.boolean(),
    s3Endpoint: z.boolean(),
    s3Bucket: z.boolean(),
    s3Region: z.boolean(),
    s3AccessKey: z.boolean(),
    s3SecretKey: z.boolean(),
    s3PublicUrl: z.boolean(),
    secureMode: z.boolean(),
  }),
  ai: z.object({
    geminiApiKey: z.boolean(),
  }),
});

export type SettingGroupKey = z.infer<typeof SettingGroupKeySchema>;
export type GeneralSettings = z.infer<typeof GeneralSettingsSchema>;
export type ContentSourceSettings = z.infer<typeof ContentSourceSettingsSchema>;
export type StorageSettings = z.infer<typeof StorageSettingsSchema>;
export type AiSettings = z.infer<typeof AiSettingsSchema>;
export type EnvStatusResponse = z.infer<typeof EnvStatusResponseSchema>;
