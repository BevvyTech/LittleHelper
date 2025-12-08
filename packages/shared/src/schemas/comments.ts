import { z } from 'zod';

import { IdSchema, PaginationSchema } from './api.js';

export const CreateCommentSchema = z.object({
  anchorId: z.string().min(1).max(50),
  pageLocaleId: IdSchema,
  body: z.string().min(1).max(5000),
});

export const CommentQuerySchema = PaginationSchema.extend({
  pageLocaleId: IdSchema.optional(),
  userId: IdSchema.optional(),
});

export const CommentResponseSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  body: z.string(),
  author: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      avatarUrl: z.string().nullable(),
    })
    .nullable(),
  createdAt: z.string().datetime(),
});

export const CommentThreadResponseSchema = z.object({
  id: z.string(),
  anchorId: z.string(),
  pageLocaleId: z.string(),
  comments: z.array(CommentResponseSchema),
});

export type CreateComment = z.infer<typeof CreateCommentSchema>;
export type CommentQuery = z.infer<typeof CommentQuerySchema>;
export type CommentResponse = z.infer<typeof CommentResponseSchema>;
export type CommentThreadResponse = z.infer<typeof CommentThreadResponseSchema>;
