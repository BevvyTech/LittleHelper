import { type Page } from '../../../domain/content/index.js';

export interface CreatePageData {
  parentId?: string | null;
  headerImage?: string | null;
}

export interface UpdatePageData {
  parentId?: string | null;
  headerImage?: string | null;
}

export interface IPageRepository {
  findById(id: string): Promise<Page | null>;
  findByShortId(shortId: string): Promise<Page | null>;
  findAll(): Promise<Page[]>;
  findChildren(parentId: string): Promise<Page[]>;
  findRoots(): Promise<Page[]>;
  create(data: CreatePageData): Promise<Page>;
  update(id: string, data: UpdatePageData): Promise<Page>;
  delete(id: string): Promise<void>;
}
