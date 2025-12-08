import { z } from 'zod';

export const ReleaseTagSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[a-z0-9._-]+$/i, 'Tag must be alphanumeric with dots, underscores, and hyphens');

export const CreateReleaseSchema = z.object({
  tag: ReleaseTagSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
});

export const ReleaseResponseSchema = z.object({
  id: z.string(),
  tag: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const ReleaseListResponseSchema = z.array(ReleaseResponseSchema);

export type ReleaseTag = z.infer<typeof ReleaseTagSchema>;
export type CreateRelease = z.infer<typeof CreateReleaseSchema>;
export type ReleaseResponse = z.infer<typeof ReleaseResponseSchema>;
