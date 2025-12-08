import { type PrismaClient } from '../prisma/index.js';
import { SyncLog } from '../../domain/content/SyncLog.js';
import {
  type ISyncLogRepository,
  type CreateSyncLogData,
  type UpdateSyncLogData,
} from '../../application/ports/repositories/ISyncLogRepository.js';

export class SyncLogRepositoryPrisma implements ISyncLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateSyncLogData): Promise<SyncLog> {
    const log = await this.prisma.syncLog.create({
      data: {
        status: data.status,
        message: data.message ?? null,
        details: data.details ?? null,
        startedAt: data.startedAt ?? new Date(),
      },
    });
    return this.toDomain(log);
  }

  async update(id: string, data: UpdateSyncLogData): Promise<SyncLog> {
    const log = await this.prisma.syncLog.update({
      where: { id },
      data: {
        status: data.status,
        message: data.message,
        details: data.details,
        finishedAt: data.finishedAt,
      },
    });
    return this.toDomain(log);
  }

  async findLatest(): Promise<SyncLog | null> {
    const log = await this.prisma.syncLog.findFirst({
      orderBy: { startedAt: 'desc' },
    });
    return log ? this.toDomain(log) : null;
  }

  async findAll(
    options: { page?: number; pageSize?: number } = {}
  ): Promise<{ logs: SyncLog[]; total: number }> {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const [logs, total] = await Promise.all([
      this.prisma.syncLog.findMany({
        skip,
        take: pageSize,
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.syncLog.count(),
    ]);

    return {
      logs: logs.map((l) => this.toDomain(l)),
      total,
    };
  }

  private toDomain(log: NonNullable<Awaited<ReturnType<PrismaClient['syncLog']['findFirst']>>>): SyncLog {
    return new SyncLog({
      id: log.id,
      status: log.status as SyncLog['status'],
      message: log.message,
      details: log.details as Record<string, unknown> | null,
      startedAt: log.startedAt,
      finishedAt: log.finishedAt,
    });
  }
}
