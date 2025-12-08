import { z } from 'zod';

import { IdSchema, LocaleSchema, SlugSchema } from './api.js';

export const PageLocaleCreateSchema = z.object({
  locale: LocaleSchema,
  title: z.string().min(1).max(200),
  slug: SlugSchema,
  parentId: IdSchema.nullable().optional(),
  headerImage: z.string().url().nullable().optional(),
});

export const PageLocaleUpdateSchema = PageLocaleCreateSchema.partial();

export const PageContentUpdateSchema = z.object({
  content: z.string().min(1),
  commitMessage: z.string().max(200).optional(),
});

export const PageQuerySchema = z.object({
  locale: LocaleSchema,
  slug: SlugSchema,
});

export const PageTreeNodeSchema: z.ZodType<PageTreeNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    shortId: z.string(),
    locales: z.array(
      z.object({
        id: z.string(),
        locale: LocaleSchema,
        title: z.string(),
        slug: z.string(),
      })
    ),
    children: z.array(PageTreeNodeSchema),
  })
);

export interface PageTreeNode {
  id: string;
  shortId: string;
  locales: Array<{
    id: string;
    locale: string;
    title: string;
    slug: string;
  }>;
  children: PageTreeNode[];
}

export type PageLocaleCreate = z.infer<typeof PageLocaleCreateSchema>;
export type PageLocaleUpdate = z.infer<typeof PageLocaleUpdateSchema>;
export type PageContentUpdate = z.infer<typeof PageContentUpdateSchema>;
export type PageQuery = z.infer<typeof PageQuerySchema>;
