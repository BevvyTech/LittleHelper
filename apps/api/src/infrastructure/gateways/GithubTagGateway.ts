import simpleGit from 'simple-git';
import { App } from '@octokit/app';
import { type IGithubTagGateway } from '../../application/ports/gateways/IGithubGateway.js';
import { type GithubGatewayConfig } from './GithubGateway.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

export class GithubTagGateway implements IGithubTagGateway {
  constructor(private readonly config: GithubGatewayConfig) {}

  async prepareRepo(workingDir: string): Promise<void> {
    const git = simpleGit();
    const remote = await this.buildRemoteUrl();
    const exists = await this.exists(workingDir);
    if (!exists) {
      await fs.mkdir(path.dirname(workingDir), { recursive: true });
      await git.clone(remote, workingDir, ['--branch', this.config.branch, '--single-branch']);
    } else {
      const repo = await this.git(workingDir);
      await repo.checkout(this.config.branch);
      await repo.pull('origin', this.config.branch);
      await repo.fetch(['--tags']);
    }
  }

  private async git(workingDir: string) {
    const git = simpleGit({ baseDir: workingDir });
    const remote = await this.buildRemoteUrl();
    await git.remote(['set-url', 'origin', remote]);
    return git;
  }

  async createTag(workingDir: string, tag: string, message: string): Promise<void> {
    const git = await this.git(workingDir);
    await git.addAnnotatedTag(tag, message);
  }

  async listTags(workingDir: string): Promise<string[]> {
    const git = await this.git(workingDir);
    const tags = await git.tags();
    return tags.all;
  }

  async checkoutTag(workingDir: string, tag: string): Promise<void> {
    const git = await this.git(workingDir);
    await git.checkout(tag);
  }

  async pushTag(workingDir: string, tag: string): Promise<void> {
    const git = await this.git(workingDir);
    await git.pushTags('origin', tag);
  }

  async readFile(workingDir: string, filePath: string): Promise<string> {
    const fullPath = path.join(workingDir, filePath);
    return readFile(fullPath, 'utf-8');
  }

  private async buildRemoteUrl(): Promise<string> {
    const token = await this.getAuthToken();
    if (!token) {
      return this.config.repositoryUrl;
    }

    const url = new URL(this.config.repositoryUrl);
    url.username = token;
    url.password = '';
    return url.toString();
  }

  private async getAuthToken(): Promise<string | null> {
    if (this.config.authMethod === 'pat') {
      return this.config.pat ?? null;
    }

    if (
      !this.config.appId ||
      !this.config.appPrivateKey ||
      !this.config.appInstallationId
    ) {
      throw new Error('GitHub App credentials are missing');
    }

    const app = new App({
      appId: this.config.appId,
      privateKey: this.config.appPrivateKey,
    });

    const token = await app.getInstallationAccessToken({
      installationId: Number(this.config.appInstallationId),
    });

    return token;
  }

  private async exists(targetDir: string): Promise<boolean> {
    try {
      await fs.access(targetDir);
      return true;
    } catch {
      return false;
    }
  }
}
