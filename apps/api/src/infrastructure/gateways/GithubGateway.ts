import path from 'node:path';
import fs from 'node:fs/promises';
import simpleGit, { type SimpleGit } from 'simple-git';
import { App } from '@octokit/app';
import { type IGithubGateway } from '../../application/ports/gateways/IGithubGateway.js';

export type GithubAuthMethod = 'pat' | 'app';

export interface GithubGatewayConfig {
  repositoryUrl: string;
  branch: string;
  authMethod: GithubAuthMethod;
  pat?: string;
  appId?: string;
  appPrivateKey?: string;
  appInstallationId?: string;
}

export class GithubGateway implements IGithubGateway {
  constructor(private readonly config: GithubGatewayConfig) {}

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const remote = await this.buildRemoteUrl();
      const git = simpleGit();
      await git.listRemote([remote]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async clone(targetDir: string): Promise<void> {
    if (await this.exists(targetDir)) {
      return;
    }

    await fs.mkdir(path.dirname(targetDir), { recursive: true });
    const remote = await this.buildRemoteUrl();
    const git = simpleGit();
    await git.clone(remote, targetDir, ['--branch', this.config.branch, '--single-branch']);
  }

  async pull(workingDir: string): Promise<void> {
    const git = await this.gitWithRemote(workingDir);
    await git.pull('origin', this.config.branch);
  }

  async listFiles(workingDir: string, pattern?: string): Promise<string[]> {
    const git = await this.gitWithRemote(workingDir);
    const rawList = await git.raw(['ls-files']);
    const files = rawList
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (!pattern) return files;
    const matcher = new RegExp(pattern.replace('.', '\\.').replace('*', '.*'));
    return files.filter((file) => matcher.test(file));
  }

  async readFile(workingDir: string, filePath: string): Promise<string> {
    const fullPath = path.join(workingDir, filePath);
    return await fs.readFile(fullPath, 'utf-8');
  }

  async writeFile(workingDir: string, filePath: string, content: string): Promise<void> {
    const fullPath = path.join(workingDir, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async commit(workingDir: string, message: string, files: string[]): Promise<string> {
    const git = await this.gitWithRemote(workingDir);
    await git.add(files);
    const result = await git.commit(message, files);
    return result.commit;
  }

  async push(workingDir: string): Promise<void> {
    const git = await this.gitWithRemote(workingDir);
    await git.push('origin', this.config.branch);
  }

  private async gitWithRemote(workingDir: string): Promise<SimpleGit> {
    const git = simpleGit({ baseDir: workingDir });
    const remote = await this.buildRemoteUrl();
    await git.remote(['set-url', 'origin', remote]);
    await git.addConfig('user.name', 'LittleHelper Bot');
    await git.addConfig('user.email', 'bot@littlehelper.local');
    return git;
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
