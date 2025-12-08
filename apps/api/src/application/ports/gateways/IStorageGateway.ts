export interface UploadResult {
  storagePath: string;
  publicUrl: string;
}

export interface IStorageGateway {
  testConnection(): Promise<{ success: boolean; error?: string }>;
  upload(
    pageShortId: string,
    filename: string,
    content: Buffer,
    mimeType: string
  ): Promise<UploadResult>;
  delete(storagePath: string): Promise<void>;
  getPresignedUploadUrl?(
    pageShortId: string,
    filename: string,
    mimeType: string
  ): Promise<{ url: string; storagePath: string }>;
  getPublicUrl(storagePath: string): string;
}
