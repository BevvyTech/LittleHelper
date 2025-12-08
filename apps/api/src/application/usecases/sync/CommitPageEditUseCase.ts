import path from 'node:path';
import { GithubGateway } from '../../../infrastructure/gateways/GithubGateway.js';
import { resolveContentSourceConfig, getWorkingDir } from './SyncFromGithubUseCase.js';
import { type ISettingsRepository } from '../../ports/repositories/ISettingsRepository.js';
import { type IAnchorRepository } from '../../ports/repositories/IAnchorRepository.js';
import { GenerateAnchorsUseCase } from '../anchors/GenerateAnchorsUseCase.js';

export interface CommitPageEditInput {
  filePath: string;
  content: string;
  message: string;
  pageLocaleId?: string;
}

export class CommitPageEditUseCase {
  private readonly generateAnchors: GenerateAnchorsUseCase | null;

  constructor(
    private readonly settingsRepository: ISettingsRepository,
    anchorRepository?: IAnchorRepository
  ) {
    this.generateAnchors = anchorRepository
      ? new GenerateAnchorsUseCase(anchorRepository)
      : null;
  }

  async execute(input: CommitPageEditInput): Promise<{ commit: string; filePath: string }> {
    const config = await resolveContentSourceConfig(this.settingsRepository);
    const gateway = new GithubGateway(config);
    const workingDir = getWorkingDir(config.repositoryUrl);

    await gateway.clone(workingDir);
    await gateway.pull(workingDir);

    const targetPath = input.filePath.startsWith(config.contentPath)
      ? input.filePath
      : path.join(config.contentPath, input.filePath);

    await gateway.writeFile(workingDir, targetPath, input.content);
    const commitHash = await gateway.commit(workingDir, input.message, [targetPath]);
    await gateway.push(workingDir);

    if (this.generateAnchors && input.pageLocaleId) {
      await this.generateAnchors.execute({
        pageLocaleId: input.pageLocaleId,
        content: input.content,
      });
    }

    return { commit: commitHash, filePath: targetPath };
  }
}
