import {
  DeleteObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { type IStorageGateway, type UploadResult } from '../../application/ports/gateways/IStorageGateway.js';

export interface S3StorageGatewayOptions {
  region: string;
  bucket: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl?: string;
  secure?: boolean;
}

export class S3StorageGateway implements IStorageGateway {
  private readonly client: S3Client;

  constructor(private readonly options: S3StorageGatewayOptions) {
    this.client = new S3Client({
      region: options.region,
      endpoint: options.endpoint,
      forcePathStyle: !!options.endpoint,
      tls: options.secure !== false,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    });
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.options.bucket }));
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
    const key = `${pageShortId}/${filename}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.options.bucket,
        Key: key,
        Body: content,
        ContentType: mimeType,
      })
    );

    return { storagePath: key, publicUrl: this.getPublicUrl(key) };
  }

  async delete(storagePath: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.options.bucket,
        Key: storagePath,
      })
    );
  }

  async list(prefix: string): Promise<string[]> {
    const result = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.options.bucket,
        Prefix: prefix,
      })
    );
    return (
      result.Contents?.map((item) => (item.Key ? this.getPublicUrl(item.Key) : null)).filter(
        Boolean
      ) as string[]
    );
  }

  async getPresignedUploadUrl(
    pageShortId: string,
    filename: string,
    mimeType: string
  ): Promise<{ url: string; storagePath: string }> {
    const key = `${pageShortId}/${filename}`;
    const command = new PutObjectCommand({
      Bucket: this.options.bucket,
      Key: key,
      ContentType: mimeType,
    });
    const url = await getSignedUrl(this.client, command, { expiresIn: 900 });
    return { url, storagePath: key };
  }

  getPublicUrl(storagePath: string): string {
    if (this.options.publicUrl) {
      return `${this.options.publicUrl.replace(/\/$/, '')}/${storagePath}`;
    }
    if (this.options.endpoint) {
      return `${this.options.endpoint.replace(/\/$/, '')}/${this.options.bucket}/${storagePath}`;
    }
    return `https://${this.options.bucket}.s3.${this.options.region}.amazonaws.com/${storagePath}`;
  }
}
