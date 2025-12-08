import { type PrismaClient } from '../prisma/index.js';
import { User } from '../../domain/users/index.js';
import {
  type IUserRepository,
  type CreateUserData,
  type UpdateUserData,
} from '../../application/ports/repositories/index.js';

export class UserRepositoryPrisma implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findAll(
    options: { page?: number; pageSize?: number } = {}
  ): Promise<{ users: User[]; total: number }> {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users: users.map((u) => this.toDomain(u)),
      total,
    };
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
    });
    return this.toDomain(user);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return this.toDomain(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  private toDomain(
    user: Awaited<ReturnType<PrismaClient['user']['findUnique']>> & object
  ): User {
    return new User({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      banned: user.banned,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
