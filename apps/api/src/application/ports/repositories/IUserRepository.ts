import { type User } from '../../../domain/users/index.js';
import { type UserRole } from '@littlehelper/shared';

export interface CreateUserData {
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface UpdateUserData {
  name?: string | null;
  avatarUrl?: string | null;
  role?: UserRole;
  banned?: boolean;
  lastLogin?: Date;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(options?: { page?: number; pageSize?: number }): Promise<{ users: User[]; total: number }>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}
