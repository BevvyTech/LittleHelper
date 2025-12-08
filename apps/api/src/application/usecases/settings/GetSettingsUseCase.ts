import { type ISettingsRepository } from '../../ports/repositories/ISettingsRepository.js';
import { SettingGroup } from '../../../domain/settings/Setting.js';

export class GetSettingsUseCase {
  constructor(private readonly settingsRepository: ISettingsRepository) {}

  async execute(key: string): Promise<Record<string, unknown>> {
    if (!SettingGroup.isValidKey(key)) {
      throw new Error(`Invalid settings key: ${key}`);
    }

    const settings = await this.settingsRepository.findByKey(key);
    return settings?.data ?? {};
  }
}
