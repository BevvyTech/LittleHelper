import { type PrismaClient } from '../prisma/index.js';
import { SettingGroup } from '../../domain/settings/Setting.js';
import { type ISettingsRepository } from '../../application/ports/repositories/ISettingsRepository.js';

export class SettingsRepositoryPrisma implements ISettingsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByKey(key: string): Promise<SettingGroup | null> {
    const setting = await this.prisma.settingGroup.findUnique({ where: { key } });
    return setting ? this.toDomain(setting) : null;
  }

  async upsert(key: string, data: Record<string, unknown>): Promise<SettingGroup> {
    const setting = await this.prisma.settingGroup.upsert({
      where: { key },
      create: { key, data },
      update: { data },
    });
    return this.toDomain(setting);
  }

  private toDomain(
    setting: NonNullable<Awaited<ReturnType<PrismaClient['settingGroup']['findUnique']>>>
  ): SettingGroup {
    return new SettingGroup({
      id: setting.id,
      key: setting.key,
      data: setting.data as Record<string, unknown>,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    });
  }
}
