import { type Session } from '../../../domain/users/index.js';

export interface CreateSessionData {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface ISessionRepository {
  findByToken(token: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  create(data: CreateSessionData): Promise<Session>;
  delete(id: string): Promise<void>;
  deleteByToken(token: string): Promise<void>;
  deleteExpired(): Promise<number>;
  deleteAllForUser(userId: string): Promise<void>;
}
