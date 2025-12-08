import { type SyncLog } from '../../../domain/content/index.js';
import { type SyncStatus } from '../../../domain/content/SyncLog.js';

export interface CreateSyncLogData {
  status: SyncStatus;
  message?: string | null;
  details?: Record<string, unknown> | null;
  startedAt?: Date;
}

export interface UpdateSyncLogData {
  status?: SyncStatus;
  message?: string | null;
  details?: Record<string, unknown> | null;
  finishedAt?: Date | null;
}

export interface ISyncLogRepository {
  create(data: CreateSyncLogData): Promise<SyncLog>;
  update(id: string, data: UpdateSyncLogData): Promise<SyncLog>;
  findLatest(): Promise<SyncLog | null>;
  findAll(options?: { page?: number; pageSize?: number }): Promise<{ logs: SyncLog[]; total: number }>;
}
