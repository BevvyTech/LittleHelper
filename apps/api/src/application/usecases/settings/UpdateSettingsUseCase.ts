import { type ISettingsRepository } from '../../ports/repositories/ISettingsRepository.js';
import { SettingGroup } from '../../../domain/settings/Setting.js';
import {
  GeneralSettingsSchema,
  ContentSourceSettingsSchema,
  StorageSettingsSchema,
  AiSettingsSchema,
} from '@littlehelper/shared';

export class UpdateSettingsUseCase {
  constructor(private readonly settingsRepository: ISettingsRepository) {}

  async execute(key: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!SettingGroup.isValidKey(key)) {
      throw new Error(`Invalid settings key: ${key}`);
    }

    const validated = this.validateSettings(key, data);

    const settings = await this.settingsRepository.upsert(key, validated);
    return settings.data;
  }

  private validateSettings(key: string, data: Record<string, unknown>): Record<string, unknown> {
    switch (key) {
      case 'general':
        return GeneralSettingsSchema.parse(data);
      case 'content-source':
        return ContentSourceSettingsSchema.parse(data);
      case 'storage':
        return StorageSettingsSchema.parse(data);
      case 'ai':
        return AiSettingsSchema.parse(data);
      default:
        throw new Error(`Unknown settings key: ${key}`);
    }
  }
}
