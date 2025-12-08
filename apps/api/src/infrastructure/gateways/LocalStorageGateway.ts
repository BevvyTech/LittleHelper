import { mkdir, readdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { type IStorageGateway, type UploadResult } from '../../application/ports/gateways/IStorageGateway.js';

export interface LocalStorageGatewayOptions {
  basePath: string;
  publicUrl?: string;
}

export class LocalStorageGateway implements IStorageGateway {
  constructor(private readonly options: LocalStorageGatewayOptions) {}

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await mkdir(this.options.basePath, { recursive: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async upload(
    pageShortId: string,
    filename: string,
    content: Buffer,
    mimeType: string
  ): Promise<UploadResult> {
    const safeName = filename.replace(/\s+/g, '-');
    const dir = path.join(this.options.basePath, pageShortId);
    await mkdir(dir, { recursive: true });
    const storagePath = path.join(dir, safeName);
    await writeFile(storagePath, content);

    return {
      storagePath,
      publicUrl: this.getPublicUrl(storagePath),
    };
  }

  async delete(storagePath: string): Promise<void> {
    try {
      await unlink(storagePath);
    } catch {
      // ignore missing files
    }
  }

  async list(prefix: string): Promise<string[]> {
    const dir = path.join(this.options.basePath, prefix);
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      return entries
        .filter((entry) => entry.isFile())
        .map((entry) => this.getPublicUrl(path.join(dir, entry.name)));
    } catch {
      return [];
    }
  }

  getPublicUrl(storagePath: string): string {
    const relative = path.relative(this.options.basePath, storagePath).replace(/\\/g, '/');
    const prefix = this.options.publicUrl?.replace(/\/$/, '');
    if (prefix) {
      return `${prefix}/${relative}`;
    }
    return `/uploads/${relative}`;
  }
}
