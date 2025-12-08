import { z } from 'zod';

export const UserRoleSchema = z.enum(['USER', 'ADMIN']);

export const LoginCallbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().optional(),
});

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  role: UserRoleSchema,
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type LoginCallback = z.infer<typeof LoginCallbackSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
