import { type SettingGroup } from '../../../domain/settings/index.js';

export interface ISettingsRepository {
  findByKey(key: string): Promise<SettingGroup | null>;
  upsert(key: string, data: Record<string, unknown>): Promise<SettingGroup>;
}
