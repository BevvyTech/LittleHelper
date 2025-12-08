import { type PrismaClient } from '../prisma/index.js';
import { Session } from '../../domain/users/index.js';
import {
  type ISessionRepository,
  type CreateSessionData,
} from '../../application/ports/repositories/index.js';

export class SessionRepositoryPrisma implements ISessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByToken(token: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({ where: { token } });
    return session ? this.toDomain(session) : null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return sessions.map((s) => this.toDomain(s));
  }

  async create(data: CreateSessionData): Promise<Session> {
    const session = await this.prisma.session.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
    return this.toDomain(session);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.session.delete({ where: { id } });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.session.delete({ where: { token } });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  private toDomain(
    session: Awaited<ReturnType<PrismaClient['session']['findUnique']>> & object
  ): Session {
    return new Session({
      id: session.id,
      userId: session.userId,
      token: session.token,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
    });
  }
}
