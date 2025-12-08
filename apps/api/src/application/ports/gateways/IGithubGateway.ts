export interface GithubFile {
  path: string;
  content: string;
}

export interface IGithubGateway {
  testConnection(): Promise<{ success: boolean; error?: string }>;
  clone(targetDir: string): Promise<void>;
  pull(workingDir: string): Promise<void>;
  listFiles(workingDir: string, pattern?: string): Promise<string[]>;
  readFile(workingDir: string, filePath: string): Promise<string>;
  writeFile(workingDir: string, filePath: string, content: string): Promise<void>;
  commit(workingDir: string, message: string, files: string[]): Promise<string>;
  push(workingDir: string): Promise<void>;
}

export interface IGithubTagGateway {
  prepareRepo?(workingDir: string): Promise<void>;
  createTag(workingDir: string, tag: string, message: string): Promise<void>;
  listTags(workingDir: string): Promise<string[]>;
  checkoutTag(workingDir: string, tag: string): Promise<void>;
  pushTag(workingDir: string, tag: string): Promise<void>;
  readFile(workingDir: string, filePath: string): Promise<string>;
}
