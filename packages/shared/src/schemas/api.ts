import { z } from 'zod';

import { SUPPORTED_LOCALES } from '../constants/locales.js';

export const LocaleSchema = z.enum(SUPPORTED_LOCALES);

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const SlugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

export const IdSchema = z.string().min(1).max(50);

export type Locale = z.infer<typeof LocaleSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type Slug = z.infer<typeof SlugSchema>;
